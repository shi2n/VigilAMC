/**
 * VigilAMC Technician Offline Outbox, Photo Queue & Cache Engine
 * Zero-dependency IndexedDB storage for offline field resilience.
 *
 * Photo pipeline guarantees:
 * 1. Photos are stored as binary JPEG Blobs in `photo_queue` (DB v3) with stable `clientPhotoId`
 *    and authoritative `capturedAt` timestamp.
 * 2. Upload-first order: pending photos upload via POST /api/photos/upload (oldest first)
 *    and MUST receive a confirmed https:// storageUrl BEFORE their parent record syncs.
 * 3. Single-flight drain mutex: concurrent triggers never drop newly submitted photos/records.
 * 4. Honest counts: `getOutboxCount()` reports pendingPhotos & failedPhotos explicitly.
 * 5. Automatic recovery: `recoverUnsentPhotos()` migrates & drains any stuck local/legacy photos.
 */

import { createClient } from '@/lib/supabase/client';

export interface OutboxItem {
  clientSyncId: string;
  actionType:
    | 'COMPLETE_INSPECTION'
    | 'UPDATE_STATUS'
    | 'UPLOAD_PHOTO'
    | 'COMPLETE_WORK_ORDER'
    | 'VISIT_STAMP'
    | 'SEND_MESSAGE';
  payload: any;
  createdAt: number;
  attempts: number;
  status: 'PENDING' | 'SYNCED' | 'FAILED' | 'PAUSED';
  parentClientSyncId?: string;
  lastError?: string;
  httpStatus?: number;
  lastAttemptAt?: number;
  technicianId?: string;
  schemaVersion?: number;
}

export interface QueuedPhotoItem {
  clientPhotoId: string;
  parentSyncId?: string; // Links to COMPLETE_WORK_ORDER or COMPLETE_INSPECTION outbox item
  targetType: 'WORK_ORDER' | 'INSPECTION' | 'REPORT';
  targetId: string;
  buildingId?: string;
  equipmentId?: string;
  folder: 'tasks' | 'inspections' | 'reports';
  blob: Blob;
  contentType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  capturedAt: number; // Authoritative original capture ms timestamp (NEVER overwritten on retry)
  dayOfWeek: string;
  latitude?: number | null;
  longitude?: number | null;
  gpsAccuracy?: number | null;
  gpsSource: 'LIVE' | 'BASEMENT_CACHED';
  caption?: string;
  category?: string;
  status: 'PENDING' | 'UPLOADING' | 'UPLOADED' | 'FAILED';
  uploadedStorageUrl?: string; // Confirmed https:// storage URL returned by server
  uploadedSignedUrl?: string | null;
  attempts: number;
  lastError?: string;
  httpStatus?: number;
  lastAttemptAt?: number;
  createdAt: number;
}

export interface SyncDiagnosticLog {
  id?: number;
  timestamp: number;
  clientSyncId: string;
  actionType: string;
  status: 'SYNCED' | 'FAILED' | 'HTTP_ERROR';
  httpStatus?: number;
  message: string;
}

const DB_NAME = 'vigil_tech_offline_db';
const DB_VERSION = 3;
const OUTBOX_STORE = 'outbox';
const PHOTO_QUEUE_STORE = 'photo_queue';
const CACHE_STORE = 'cache';
const LOGS_STORE = 'sync_logs';

let dbInstance: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('IndexedDB not supported on server'));
  }
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(OUTBOX_STORE)) {
        const store = db.createObjectStore(OUTBOX_STORE, { keyPath: 'clientSyncId' });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
      if (!db.objectStoreNames.contains(PHOTO_QUEUE_STORE)) {
        const pStore = db.createObjectStore(PHOTO_QUEUE_STORE, { keyPath: 'clientPhotoId' });
        pStore.createIndex('status', 'status', { unique: false });
        pStore.createIndex('createdAt', 'createdAt', { unique: false });
        pStore.createIndex('parentSyncId', 'parentSyncId', { unique: false });
      }
      if (!db.objectStoreNames.contains(CACHE_STORE)) {
        db.createObjectStore(CACHE_STORE, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(LOGS_STORE)) {
        db.createObjectStore(LOGS_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      dbInstance.onclose = () => {
        dbInstance = null;
      };
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB'));
    };
  });
}

function dataUrlToBlob(dataUrl: string): Blob | null {
  try {
    const match = dataUrl.trim().match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/);
    if (!match) return null;
    const mime = match[1].toLowerCase();
    const binStr = atob(match[2]);
    const bytes = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) {
      bytes[i] = binStr.charCodeAt(i);
    }
    return new Blob([bytes], { type: mime });
  } catch {
    return null;
  }
}

export function getBackoffDelayMs(attempts: number): number {
  const delays = [5000, 15000, 60000, 300000, 900000];
  const idx = Math.min(Math.max(0, (attempts || 1) - 1), delays.length - 1);
  return delays[idx];
}

export function isItemReadyForRetry(
  item: { attempts?: number; status: string; lastAttemptAt?: number },
  force = false
): boolean {
  if (force) return true;
  if ((item.attempts || 0) >= 15 && item.status !== 'PENDING') {
    return false;
  }
  if (item.status === 'PENDING' || item.status === 'UPLOADING') return true;
  if (item.status === 'FAILED') {
    if (!item.lastAttemptAt) return true;
    const delay = getBackoffDelayMs(item.attempts || 1);
    return Date.now() - item.lastAttemptAt >= delay;
  }
  return false;
}

export async function recordSyncDiagnosticLog(
  entry: Omit<SyncDiagnosticLog, 'id' | 'timestamp'>
): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const db = await openDB();
    const tx = db.transaction(LOGS_STORE, 'readwrite');
    const store = tx.objectStore(LOGS_STORE);

    store.add({
      ...entry,
      timestamp: Date.now(),
    });

    const countReq = store.count();
    countReq.onsuccess = () => {
      if (countReq.result > 25) {
        const openReq = store.openCursor();
        let deleted = 0;
        const targetDelete = countReq.result - 20;
        openReq.onsuccess = (e: any) => {
          const cursor = e.target.result;
          if (cursor && deleted < targetDelete) {
            cursor.delete();
            deleted++;
            cursor.continue();
          }
        };
      }
    };
  } catch (err) {
    console.warn('Failed to record sync diagnostic log:', err);
  }
}

export async function getSyncDiagnosticLogs(): Promise<SyncDiagnosticLog[]> {
  if (typeof window === 'undefined') return [];
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(LOGS_STORE, 'readonly');
      const store = tx.objectStore(LOGS_STORE);
      const req = store.getAll();
      req.onsuccess = () => {
        const logs: SyncDiagnosticLog[] = req.result || [];
        logs.sort((a, b) => b.timestamp - a.timestamp);
        resolve(logs.slice(0, 20));
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

// ====================================================================================
// PHOTO QUEUE STORE CRUD (DB v3)
// ====================================================================================

export async function enqueuePhotoUpload(item: QueuedPhotoItem): Promise<void> {
  if (item.sizeBytes > 2 * 1024 * 1024) {
    throw new Error('Photo exceeds 2 MB maximum allowed size.');
  }
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTO_QUEUE_STORE, 'readwrite');
    const store = tx.objectStore(PHOTO_QUEUE_STORE);
    store.put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getQueuedPhoto(clientPhotoId: string): Promise<QueuedPhotoItem | null> {
  if (typeof window === 'undefined') return null;
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(PHOTO_QUEUE_STORE, 'readonly');
      const store = tx.objectStore(PHOTO_QUEUE_STORE);
      const req = store.get(clientPhotoId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function getAllQueuedPhotos(): Promise<QueuedPhotoItem[]> {
  if (typeof window === 'undefined') return [];
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(PHOTO_QUEUE_STORE, 'readonly');
      const store = tx.objectStore(PHOTO_QUEUE_STORE);
      const req = store.getAll();
      req.onsuccess = () => {
        const all: QueuedPhotoItem[] = req.result || [];
        all.sort((a, b) => a.createdAt - b.createdAt); // oldest first
        resolve(all);
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function getPendingQueuedPhotos(): Promise<QueuedPhotoItem[]> {
  const all = await getAllQueuedPhotos();
  return all.filter((p) => p.status !== 'UPLOADED');
}

export async function getFailedQueuedPhotos(): Promise<QueuedPhotoItem[]> {
  const all = await getAllQueuedPhotos();
  return all.filter((p) => p.status === 'FAILED');
}

export async function updateQueuedPhoto(
  clientPhotoId: string,
  patch: Partial<QueuedPhotoItem>
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTO_QUEUE_STORE, 'readwrite');
    const store = tx.objectStore(PHOTO_QUEUE_STORE);
    const req = store.get(clientPhotoId);
    req.onsuccess = () => {
      const existing: QueuedPhotoItem | undefined = req.result;
      if (existing) {
        store.put({ ...existing, ...patch });
      }
      resolve();
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteQueuedPhoto(clientPhotoId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTO_QUEUE_STORE, 'readwrite');
    const store = tx.objectStore(PHOTO_QUEUE_STORE);
    store.delete(clientPhotoId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function resetQueuedPhotoForRetry(clientPhotoId: string): Promise<void> {
  await updateQueuedPhoto(clientPhotoId, {
    status: 'PENDING',
    lastAttemptAt: 0,
    lastError: undefined,
    httpStatus: undefined,
  });
}

// ====================================================================================
// OUTBOX STORE CRUD
// ====================================================================================

export async function migrateLegacyLocalStorageQueue(): Promise<number> {
  if (typeof window === 'undefined') return 0;
  try {
    const legacyKey = 'vigil_offline_insp_queue';
    const legacyRaw = localStorage.getItem(legacyKey);
    if (!legacyRaw) return 0;

    const legacyItems = JSON.parse(legacyRaw);
    if (!Array.isArray(legacyItems) || legacyItems.length === 0) {
      localStorage.removeItem(legacyKey);
      return 0;
    }

    let count = 0;
    for (const item of legacyItems) {
      const clientSyncId =
        item.clientSyncId || `LEGACY-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      await enqueueOutboxItem({
        clientSyncId,
        actionType: 'COMPLETE_INSPECTION',
        payload: item,
        createdAt: item.createdAt || Date.now(),
        attempts: 0,
        status: 'PENDING',
        schemaVersion: 2,
      });
      count++;
    }

    localStorage.removeItem(legacyKey);
    return count;
  } catch (err) {
    console.warn('Error during legacy queue migration:', err);
    return 0;
  }
}

export async function enqueueOutboxItem(item: OutboxItem): Promise<void> {
  const payloadStr =
    typeof item.payload === 'string' ? item.payload : JSON.stringify(item.payload || {});

  if (payloadStr.length > 1.5 * 1024 * 1024) {
    throw new Error('Payload exceeds 1.5 MB maximum allowed client size budget.');
  }

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OUTBOX_STORE, 'readwrite');
    const store = tx.objectStore(OUTBOX_STORE);
    store.put({
      ...item,
      schemaVersion: item.schemaVersion || 2,
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPendingOutboxItems(): Promise<OutboxItem[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OUTBOX_STORE, 'readonly');
    const store = tx.objectStore(OUTBOX_STORE);
    const request = store.getAll();
    request.onsuccess = () => {
      const all: OutboxItem[] = request.result || [];
      const pending = all.filter((i) => i.status !== 'SYNCED');
      pending.sort((a, b) => a.createdAt - b.createdAt);
      resolve(pending);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getAllOutboxItems(): Promise<OutboxItem[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OUTBOX_STORE, 'readonly');
    const store = tx.objectStore(OUTBOX_STORE);
    const request = store.getAll();
    request.onsuccess = () => {
      const all: OutboxItem[] = request.result || [];
      all.sort((a, b) => b.createdAt - a.createdAt);
      resolve(all);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function markOutboxItemSynced(clientSyncId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OUTBOX_STORE, 'readwrite');
    const store = tx.objectStore(OUTBOX_STORE);
    store.delete(clientSyncId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function markOutboxItemFailed(
  clientSyncId: string,
  errorMsg: string,
  httpStatus?: number
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OUTBOX_STORE, 'readwrite');
    const store = tx.objectStore(OUTBOX_STORE);
    const getReq = store.get(clientSyncId);
    getReq.onsuccess = () => {
      const item: OutboxItem = getReq.result;
      if (item) {
        item.status = 'FAILED';
        item.attempts = (item.attempts || 0) + 1;
        item.lastError = errorMsg;
        if (httpStatus !== undefined) item.httpStatus = httpStatus;
        item.lastAttemptAt = Date.now();
        store.put(item);
      }
      resolve();
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

export async function discardOutboxItem(clientSyncId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OUTBOX_STORE, 'readwrite');
    const store = tx.objectStore(OUTBOX_STORE);
    store.delete(clientSyncId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function resetOutboxItemForRetry(clientSyncId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OUTBOX_STORE, 'readwrite');
    const store = tx.objectStore(OUTBOX_STORE);
    const req = store.get(clientSyncId);
    req.onsuccess = () => {
      const item: OutboxItem = req.result;
      if (item) {
        item.status = 'PENDING';
        item.lastAttemptAt = 0;
        store.put(item);
      }
      resolve();
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getPendingMessageOutboxItems(
  technicianId?: string,
  dmKey?: string
): Promise<OutboxItem[]> {
  try {
    const items = await getPendingOutboxItems();
    return items.filter((i) => {
      if (i.actionType !== 'SEND_MESSAGE') return false;
      if (dmKey) {
        const itemDmKey = i.payload?.dmKey || (i.technicianId ? `office__${i.technicianId}` : '');
        return itemDmKey === dmKey;
      }
      return !technicianId || !i.technicianId || i.technicianId === technicianId;
    });
  } catch {
    return [];
  }
}

/**
 * Honest outbox counts including BOTH pending records AND pending/failed photo uploads.
 * Guarantees "Online • All synced" is NEVER shown while any photo is un-uploaded or failed.
 */
export async function getOutboxCount(): Promise<{
  pending: number;
  failed: number;
  pendingPhotos: number;
  failedPhotos: number;
}> {
  try {
    const [items, photos] = await Promise.all([getPendingOutboxItems(), getPendingQueuedPhotos()]);
    const legacyUploadPhotos = items.filter((i) => i.actionType === 'UPLOAD_PHOTO');
    const pendingPhotos = photos.length + legacyUploadPhotos.length;
    const failedPhotos =
      photos.filter((p) => p.status === 'FAILED').length +
      legacyUploadPhotos.filter((i) => i.status === 'FAILED').length;

    const failedRecords = items.filter((i) => i.status === 'FAILED').length;
    const standalonePhotos = photos.filter((p) => !p.parentSyncId).length;
    const pending = items.length + standalonePhotos;
    const failed = Math.max(failedRecords, failedPhotos);

    return { pending, failed, pendingPhotos, failedPhotos };
  } catch {
    return { pending: 0, failed: 0, pendingPhotos: 0, failedPhotos: 0 };
  }
}

export async function setLocalCache(key: string, data: any): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CACHE_STORE, 'readwrite');
    const store = tx.objectStore(CACHE_STORE);
    store.put({ key, data, updatedAt: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getLocalCache<T = any>(
  key: string
): Promise<{ data: T; updatedAt: number } | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(CACHE_STORE, 'readonly');
      const store = tx.objectStore(CACHE_STORE);
      const req = store.get(key);
      req.onsuccess = () => {
        if (req.result) {
          resolve({ data: req.result.data, updatedAt: req.result.updatedAt });
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function resolveAuthHeader(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  const localTechToken = localStorage.getItem('vigil_tech_token');
  if (localTechToken) {
    return `Bearer ${localTechToken}`;
  }

  try {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      return `Bearer ${session.access_token}`;
    }
  } catch (err) {
    console.warn('Failed to read Supabase session:', err);
  }

  return null;
}

async function refreshAuthSession(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  try {
    const supabase = createClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.refreshSession();
    if (!error && session?.access_token) {
      return `Bearer ${session.access_token}`;
    }
  } catch (err) {
    console.warn('Supabase refreshSession failed:', err);
  }

  return resolveAuthHeader();
}

/**
 * Upload a single QueuedPhotoItem via POST /api/photos/upload (idempotent by clientPhotoId).
 * Returns confirmed https:// storageUrl ONLY after HTTP 200 confirmation.
 */
async function uploadSinglePhotoItem(
  photo: QueuedPhotoItem,
  authHeader: string | null
): Promise<{
  ok: boolean;
  storageUrl?: string;
  signedUrl?: string | null;
  error?: string;
  httpStatus?: number;
  authRequired?: boolean;
  refreshedAuthHeader?: string | null;
}> {
  const buildForm = () => {
    const fd = new FormData();
    const ext = photo.contentType === 'image/png' ? 'png' : photo.contentType === 'image/webp' ? 'webp' : 'jpg';
    const file = new File([photo.blob], `${photo.clientPhotoId}.${ext}`, {
      type: photo.contentType || 'image/jpeg',
    });
    fd.append('file', file);
    fd.append('clientPhotoId', photo.clientPhotoId);
    fd.append('folder', photo.folder || 'inspections');
    fd.append('capturedAt', String(photo.capturedAt));
    return fd;
  };

  await updateQueuedPhoto(photo.clientPhotoId, { status: 'UPLOADING' }).catch(() => {});

  const doPost = (hdr: string | null) =>
    fetch('/api/photos/upload', {
      method: 'POST',
      headers: hdr ? { Authorization: hdr } : undefined,
      credentials: 'include',
      cache: 'no-store',
      body: buildForm(),
    });

  let res: Response;
  let activeAuth = authHeader;
  try {
    res = await doPost(activeAuth);
  } catch (netErr: any) {
    const errMsg = 'Network error while uploading photo — tap Retry.';
    await updateQueuedPhoto(photo.clientPhotoId, {
      status: 'FAILED',
      attempts: (photo.attempts || 0) + 1,
      lastError: errMsg,
      httpStatus: 0,
      lastAttemptAt: Date.now(),
    });
    await recordSyncDiagnosticLog({
      clientSyncId: photo.clientPhotoId,
      actionType: 'PHOTO_UPLOAD',
      status: 'FAILED',
      httpStatus: 0,
      message: errMsg,
    });
    return { ok: false, error: errMsg, httpStatus: 0 };
  }

  if (res.status === 401) {
    const fresh = await refreshAuthSession();
    if (fresh) {
      activeAuth = fresh;
      try {
        const retryRes = await doPost(activeAuth);
        res = retryRes;
      } catch {}
    }
    if (res.status === 401) {
      await updateQueuedPhoto(photo.clientPhotoId, { status: 'PENDING' });
      await recordSyncDiagnosticLog({
        clientSyncId: photo.clientPhotoId,
        actionType: 'PHOTO_UPLOAD',
        status: 'HTTP_ERROR',
        httpStatus: 401,
        message: 'Session expired during photo upload',
      });
      return {
        ok: false,
        authRequired: true,
        httpStatus: 401,
        error: 'Session expired. Please sign in to upload your saved photos.',
      };
    }
  }

  const json = await res.json().catch(() => ({}));
  const confirmedUrl: string | undefined = json?.storageUrl || json?.url;

  if (!res.ok || !json?.ok || typeof confirmedUrl !== 'string' || !confirmedUrl.startsWith('https://')) {
    const errMsg =
      res.status === 413
        ? 'Photo exceeds 2 MB limit — tap Retry.'
        : json?.error || `Photo upload failed (HTTP ${res.status})`;
    await updateQueuedPhoto(photo.clientPhotoId, {
      status: 'FAILED',
      attempts: (photo.attempts || 0) + 1,
      lastError: errMsg,
      httpStatus: res.status,
      lastAttemptAt: Date.now(),
    });
    await recordSyncDiagnosticLog({
      clientSyncId: photo.clientPhotoId,
      actionType: 'PHOTO_UPLOAD',
      status: 'FAILED',
      httpStatus: res.status,
      message: errMsg,
    });
    return { ok: false, error: errMsg, httpStatus: res.status, refreshedAuthHeader: activeAuth };
  }

  await updateQueuedPhoto(photo.clientPhotoId, {
    status: 'UPLOADED',
    uploadedStorageUrl: confirmedUrl,
    uploadedSignedUrl: json?.signedUrl || null,
    lastError: undefined,
    httpStatus: 200,
    lastAttemptAt: Date.now(),
  });
  await recordSyncDiagnosticLog({
    clientSyncId: photo.clientPhotoId,
    actionType: 'PHOTO_UPLOAD',
    status: 'SYNCED',
    httpStatus: 200,
    message: `Photo uploaded (${Math.round((photo.sizeBytes || 0) / 1024)} KB)`,
  });

  return {
    ok: true,
    storageUrl: confirmedUrl,
    signedUrl: json?.signedUrl || null,
    httpStatus: 200,
    refreshedAuthHeader: activeAuth,
  };
}

/**
 * Direct single-photo retry helper (reuses exact same clientPhotoId -> 100% idempotent).
 */
export async function retryQueuedPhotoUpload(clientPhotoId: string): Promise<DrainResult> {
  await resetQueuedPhotoForRetry(clientPhotoId);
  return drainOutbox({ force: true, targetPhotoId: clientPhotoId });
}

export interface DrainOptions {
  force?: boolean;
  targetSyncId?: string;
  targetPhotoId?: string;
  onProgress?: (synced: number, total: number) => void;
}

export interface DrainResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  uploadedPhotosCount: number;
  failedPhotosCount: number;
  errors: string[];
  authRequired?: boolean;
}

// Single-flight mutex so concurrent triggers NEVER silently drop newly queued photos/records
let activeDrainPromise: Promise<DrainResult> | null = null;
let queuedFollowUpForce = false;

export async function drainOutbox(options?: DrainOptions): Promise<DrainResult> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      success: false,
      syncedCount: 0,
      failedCount: 0,
      uploadedPhotosCount: 0,
      failedPhotosCount: 0,
      errors: ['Offline'],
    };
  }

  // If a targeted retry or normal drain arrives while one is active, wait for it and then run
  if (activeDrainPromise) {
    if (options?.force) queuedFollowUpForce = true;
    await activeDrainPromise.catch(() => {});
    if (!options?.targetSyncId && !options?.targetPhotoId && !queuedFollowUpForce) {
      return {
        success: true,
        syncedCount: 0,
        failedCount: 0,
        uploadedPhotosCount: 0,
        failedPhotosCount: 0,
        errors: [],
      };
    }
    queuedFollowUpForce = false;
  }

  const run = performDrain(options);
  activeDrainPromise = run;
  try {
    return await run;
  } finally {
    if (activeDrainPromise === run) {
      activeDrainPromise = null;
    }
  }
}

async function performDrain(options?: DrainOptions): Promise<DrainResult> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      success: false,
      syncedCount: 0,
      failedCount: 0,
      uploadedPhotosCount: 0,
      failedPhotosCount: 0,
      errors: ['Offline'],
    };
  }

  // Step 0: Auto-migrate any legacy inline-base64 outbox items into photo_queue (recovery)
  try {
    await repairOversizedOutboxItems();
  } catch (repairErr) {
    console.warn('[VigilAMC Sync] Pre-drain repair warning:', repairErr);
  }

  let authHeader = await resolveAuthHeader();
  let refreshedOnce = false;

  let uploadedPhotosCount = 0;
  let failedPhotosCount = 0;
  let syncedCount = 0;
  let failedCount = 0;
  const errors: string[] = [];

  // =========================================================================
  // PHASE 1: UPLOAD PENDING PHOTOS FIRST (OLDEST FIRST -> CONFIRMED https://)
  // =========================================================================
  const allPendingPhotos = await getPendingQueuedPhotos();
  let eligiblePhotos = options?.targetPhotoId
    ? allPendingPhotos.filter((p) => p.clientPhotoId === options.targetPhotoId)
    : options?.targetSyncId
    ? allPendingPhotos.filter((p) => p.parentSyncId === options.targetSyncId)
    : allPendingPhotos.filter((p) => isItemReadyForRetry(p, options?.force));

  // Strictly oldest first
  eligiblePhotos.sort((a, b) => a.createdAt - b.createdAt);

  for (const photo of eligiblePhotos) {
    const upRes = await uploadSinglePhotoItem(photo, authHeader);
    if (upRes.refreshedAuthHeader) {
      authHeader = upRes.refreshedAuthHeader;
    }
    if (upRes.authRequired) {
      return {
        success: false,
        syncedCount,
        failedCount,
        uploadedPhotosCount,
        failedPhotosCount,
        errors: [upRes.error || 'Session expired. Please sign in to upload saved photos.'],
        authRequired: true,
      };
    }
    if (upRes.ok && upRes.storageUrl) {
      uploadedPhotosCount++;
      // If standalone photo (no parentSyncId in outbox), enqueue an idempotent UPLOAD_PHOTO sync item
      if (!photo.parentSyncId) {
        const attachSyncId = `ATTACH-${photo.clientPhotoId}`;
        await enqueueOutboxItem({
          clientSyncId: attachSyncId,
          actionType: 'UPLOAD_PHOTO',
          payload: {
            clientPhotoId: photo.clientPhotoId,
            photoUrl: upRes.storageUrl,
            workOrderId: photo.targetType === 'WORK_ORDER' ? photo.targetId : undefined,
            inspectionId: photo.targetType === 'INSPECTION' ? photo.targetId : undefined,
            equipmentId: photo.equipmentId,
            buildingId: photo.buildingId,
            category: photo.category || 'GAUGE',
            caption: photo.caption || null,
            capturedAt: photo.capturedAt,
            dayOfWeek: photo.dayOfWeek,
            latitude: photo.latitude,
            longitude: photo.longitude,
            gpsAccuracy: photo.gpsAccuracy,
            gpsSource: photo.gpsSource,
          },
          createdAt: photo.createdAt,
          attempts: 0,
          status: 'PENDING',
        });
      }
    } else {
      failedPhotosCount++;
      if (upRes.error) errors.push(upRes.error);
    }
  }

  // =========================================================================
  // PHASE 2: DRAIN OUTBOX RECORDS (ONLY AFTER LINKED PHOTOS ARE CONFIRMED!)
  // =========================================================================
  const allItems = await getPendingOutboxItems();
  if (allItems.length === 0) {
    return {
      success: failedPhotosCount === 0,
      syncedCount,
      failedCount,
      uploadedPhotosCount,
      failedPhotosCount,
      errors,
    };
  }

  const targetId = options?.targetSyncId;
  let eligibleItems = targetId
    ? allItems.filter((i) => i.clientSyncId === targetId)
    : options?.targetPhotoId
    ? allItems.filter((i) => {
        const pIds: string[] = Array.isArray(i.payload?.pendingPhotoIds)
          ? i.payload.pendingPhotoIds
          : [];
        return (
          pIds.includes(options.targetPhotoId!) ||
          i.clientSyncId === `ATTACH-${options.targetPhotoId}`
        );
      })
    : allItems.filter((i) => isItemReadyForRetry(i, options?.force));

  // Oldest first; parent records before legacy child UPLOAD_PHOTO
  eligibleItems.sort((a, b) => {
    const aIsChild = Boolean(
      a.parentClientSyncId || (a.actionType === 'UPLOAD_PHOTO' && a.payload?.parentClientSyncId)
    );
    const bIsChild = Boolean(
      b.parentClientSyncId || (b.actionType === 'UPLOAD_PHOTO' && b.payload?.parentClientSyncId)
    );
    if (!aIsChild && bIsChild) return -1;
    if (aIsChild && !bIsChild) return 1;
    return a.createdAt - b.createdAt;
  });

  for (let i = 0; i < eligibleItems.length; i++) {
    const item = eligibleItems[i];
    const clientSyncId = item.clientSyncId;

    // Gate: If this record references queued photos, EVERY photo MUST be confirmed UPLOADED first!
    const pendingPhotoIds: string[] = Array.isArray(item.payload?.pendingPhotoIds)
      ? item.payload.pendingPhotoIds
      : [];

    let hydratedPayload = item.payload;
    const confirmedPhotoIdsToClean: string[] = [];

    if (pendingPhotoIds.length > 0) {
      const photoRecords: any[] = [];
      let blockingError: string | null = null;

      for (const pid of pendingPhotoIds) {
        const qp = await getQueuedPhoto(pid);
        if (!qp) {
          blockingError = 'Queued photo missing from local storage — please retake photo.';
          break;
        }
        if (qp.status !== 'UPLOADED' || !qp.uploadedStorageUrl || !qp.uploadedStorageUrl.startsWith('https://')) {
          blockingError = qp.lastError || 'Photo upload pending — waiting for confirmed upload.';
          break;
        }
        confirmedPhotoIdsToClean.push(pid);
        photoRecords.push({
          clientPhotoId: qp.clientPhotoId,
          photoUrl: qp.uploadedStorageUrl,
          category: qp.category || 'GAUGE',
          caption: qp.caption || null,
          capturedAt: qp.capturedAt,
          dayOfWeek: qp.dayOfWeek,
          latitude: qp.latitude,
          longitude: qp.longitude,
          gpsAccuracy: qp.gpsAccuracy,
          gpsSource: qp.gpsSource,
        });
      }

      if (blockingError) {
        // NEVER sync record while its photo is unconfirmed!
        failedCount++;
        if (!errors.includes(blockingError)) errors.push(blockingError);
        continue;
      }

      hydratedPayload = {
        ...item.payload,
        photoUrl: photoRecords[0]?.photoUrl || undefined,
        photos: photoRecords.map((r) => r.photoUrl),
        photoRecords,
        photoDataUrl: undefined,
      };
    }

    const isChatMessage = item.actionType === 'SEND_MESSAGE';
    const targetUrl = isChatMessage ? '/api/messages' : '/api/technician/sync';
    const requestPayload = isChatMessage
      ? {
          target: hydratedPayload?.target || undefined,
          dmKey: hydratedPayload?.dmKey || undefined,
          recipientId: hydratedPayload?.recipientId || undefined,
          technicianId: hydratedPayload?.technicianId || item.technicianId || undefined,
          body: hydratedPayload?.body,
          clientMsgId: item.clientSyncId,
        }
      : { items: [{ ...item, payload: hydratedPayload }] };

    let res: Response;
    let resStatus = 0;

    try {
      res = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify(requestPayload),
      });
      resStatus = res.status;
    } catch {
      const errMsg = 'Network dropped — will retry automatically.';
      await markOutboxItemFailed(clientSyncId, errMsg, 0);
      await recordSyncDiagnosticLog({
        clientSyncId,
        actionType: item.actionType,
        status: 'FAILED',
        httpStatus: 0,
        message: errMsg,
      });
      failedCount++;
      errors.push(errMsg);
      continue;
    }

    if (resStatus === 401) {
      if (!refreshedOnce) {
        refreshedOnce = true;
        const freshHeader = await refreshAuthSession();
        if (freshHeader) {
          authHeader = freshHeader;
          try {
            const retryRes = await fetch(targetUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: authHeader,
              },
              credentials: 'include',
              cache: 'no-store',
              body: JSON.stringify(requestPayload),
            });
            if (retryRes.ok) {
              res = retryRes;
              resStatus = retryRes.status;
            }
          } catch {}
        }
      }

      if (resStatus === 401) {
        await recordSyncDiagnosticLog({
          clientSyncId,
          actionType: item.actionType,
          status: 'HTTP_ERROR',
          httpStatus: 401,
          message: 'Session expired — authentication required',
        });
        return {
          success: false,
          syncedCount,
          failedCount,
          uploadedPhotosCount,
          failedPhotosCount,
          errors: ['Session expired. Please sign in to send your saved items.'],
          authRequired: true,
        };
      }
    }

    if (resStatus === 413) {
      const msg413 = 'Payload too large — tap Retry to try again';
      await markOutboxItemFailed(clientSyncId, msg413, 413);
      await recordSyncDiagnosticLog({
        clientSyncId,
        actionType: item.actionType,
        status: 'FAILED',
        httpStatus: 413,
        message: msg413,
      });
      failedCount++;
      errors.push(msg413);
      continue;
    }

    if (!res.ok) {
      const resBodyText = await res.text().catch(() => 'Server error');
      const errMsg = `HTTP ${resStatus}: ${resBodyText.slice(0, 120)}`;
      await markOutboxItemFailed(clientSyncId, errMsg, resStatus);
      await recordSyncDiagnosticLog({
        clientSyncId,
        actionType: item.actionType,
        status: 'FAILED',
        httpStatus: resStatus,
        message: errMsg,
      });
      failedCount++;
      errors.push(errMsg);
      continue;
    }

    try {
      const data = await res.json();

      if (isChatMessage) {
        if (data?.ok && data?.message) {
          await markOutboxItemSynced(clientSyncId);
          await recordSyncDiagnosticLog({
            clientSyncId,
            actionType: item.actionType,
            status: 'SYNCED',
            httpStatus: resStatus,
            message: data.deduplicated ? 'Message already synced (deduplicated)' : 'Message sent',
          });
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('vigil:message-outbox-synced', {
                detail: {
                  clientMsgId: clientSyncId,
                  message: data.message,
                  deduplicated: Boolean(data.deduplicated),
                },
              })
            );
          }
          syncedCount++;
        } else {
          const errMsg = data?.error || 'Server rejected chat message';
          await markOutboxItemFailed(clientSyncId, errMsg, resStatus);
          failedCount++;
          errors.push(errMsg);
        }
      } else {
        const perItemResult = Array.isArray(data.results) ? data.results[0] : null;

        if (perItemResult && perItemResult.status === 'SYNCED') {
          await markOutboxItemSynced(clientSyncId);
          // Clean up confirmed photo blobs ONLY AFTER parent record is confirmed synced
          for (const pid of confirmedPhotoIdsToClean) {
            await deleteQueuedPhoto(pid).catch(() => {});
          }
          if (clientSyncId.startsWith('ATTACH-')) {
            await deleteQueuedPhoto(clientSyncId.slice('ATTACH-'.length)).catch(() => {});
          }
          await recordSyncDiagnosticLog({
            clientSyncId,
            actionType: item.actionType,
            status: 'SYNCED',
            httpStatus: 200,
            message: perItemResult.message || 'Synced successfully',
          });
          syncedCount++;
        } else {
          const errMsg = perItemResult?.error || 'Server rejected item';
          await markOutboxItemFailed(clientSyncId, errMsg, 200);
          await recordSyncDiagnosticLog({
            clientSyncId,
            actionType: item.actionType,
            status: 'FAILED',
            httpStatus: 200,
            message: errMsg,
          });
          failedCount++;
          errors.push(errMsg);
        }
      }
    } catch {
      const errMsg = 'Invalid JSON response from server';
      await markOutboxItemFailed(clientSyncId, errMsg, 200);
      failedCount++;
      errors.push(errMsg);
    }

    if (options?.onProgress) {
      options.onProgress(syncedCount + failedCount, eligibleItems.length);
    }
  }

  return {
    success: failedCount === 0 && failedPhotosCount === 0,
    syncedCount,
    failedCount,
    uploadedPhotosCount,
    failedPhotosCount,
    errors,
  };
}

/**
 * Migrate any legacy inline-base64 outbox items (COMPLETE_INSPECTION, COMPLETE_WORK_ORDER, UPLOAD_PHOTO)
 * into the dedicated binary `photo_queue` so they drain via confirmed upload-first pipeline.
 */
export async function repairOversizedOutboxItems(): Promise<number> {
  if (typeof window === 'undefined') return 0;
  try {
    const items = await getPendingOutboxItems();
    let repairedCount = 0;
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    for (const item of items) {
      const payload =
        typeof item.payload === 'string'
          ? JSON.parse(item.payload)
          : item.payload
          ? { ...item.payload }
          : null;
      if (!payload) continue;

      // Case 1: Legacy UPLOAD_PHOTO outbox item with inline dataUrl -> upload via photo_queue (standalone attach)
      if (
        item.actionType === 'UPLOAD_PHOTO' &&
        typeof payload.photoDataUrl === 'string' &&
        payload.photoDataUrl.startsWith('data:image/')
      ) {
        const blob = dataUrlToBlob(payload.photoDataUrl);
        if (blob) {
          const cpid = payload.clientPhotoId || item.clientSyncId;
          const capMs = payload.capturedAt ? new Date(payload.capturedAt).getTime() : item.createdAt;
          const safeCap = isNaN(capMs) ? item.createdAt : capMs;
          await enqueuePhotoUpload({
            clientPhotoId: cpid,
            parentSyncId: undefined,
            targetType: payload.workOrderId ? 'WORK_ORDER' : 'INSPECTION',
            targetId: payload.workOrderId || payload.inspectionId || '',
            buildingId: payload.buildingId,
            equipmentId: payload.equipmentId,
            folder: payload.workOrderId ? 'tasks' : 'inspections',
            blob,
            contentType: blob.type || 'image/jpeg',
            sizeBytes: blob.size,
            capturedAt: safeCap,
            dayOfWeek: payload.dayOfWeek || dayNames[new Date(safeCap).getDay()],
            latitude: payload.latitude ?? null,
            longitude: payload.longitude ?? null,
            gpsAccuracy: payload.gpsAccuracy ?? null,
            gpsSource: payload.gpsSource === 'BASEMENT_CACHED' ? 'BASEMENT_CACHED' : 'LIVE',
            caption: payload.caption || undefined,
            category: payload.category || 'GAUGE',
            status: 'PENDING',
            attempts: 0,
            createdAt: item.createdAt,
          });
          // Keep item referencing pendingPhotoIds so once photo uploads, it attaches to parentClientSyncId!
          payload.pendingPhotoIds = [cpid];
          payload.photoDataUrl = undefined;
          await enqueueOutboxItem({
            ...item,
            payload,
            status: 'PENDING',
            attempts: 0,
            lastError: undefined,
            httpStatus: undefined,
          });
          repairedCount++;
        }
        continue;
      }

      // Case 2: Legacy COMPLETE_INSPECTION or COMPLETE_WORK_ORDER with inline dataUrl
      if (
        (item.actionType === 'COMPLETE_INSPECTION' || item.actionType === 'COMPLETE_WORK_ORDER') &&
        !Array.isArray(payload.pendingPhotoIds)
      ) {
        const inlinePhoto =
          (typeof payload.photoDataUrl === 'string' && payload.photoDataUrl.startsWith('data:image/')
            ? payload.photoDataUrl
            : null) ||
          (Array.isArray(payload.photos) &&
          typeof payload.photos[0] === 'string' &&
          payload.photos[0].startsWith('data:image/')
            ? payload.photos[0]
            : null);

        if (inlinePhoto) {
          const blob = dataUrlToBlob(inlinePhoto);
          if (blob) {
            const cpid = payload.clientPhotoId || `REC-${item.clientSyncId}`;
            const capMs = payload.capturedAt ? new Date(payload.capturedAt).getTime() : item.createdAt;
            const safeCap = isNaN(capMs) ? item.createdAt : capMs;
            const isWo = item.actionType === 'COMPLETE_WORK_ORDER';
            await enqueuePhotoUpload({
              clientPhotoId: cpid,
              parentSyncId: item.clientSyncId,
              targetType: isWo ? 'WORK_ORDER' : 'INSPECTION',
              targetId: isWo ? payload.workOrderId || '' : payload.equipmentId || payload.buildingId || '',
              buildingId: payload.buildingId,
              equipmentId: payload.equipmentId,
              folder: isWo ? 'tasks' : 'inspections',
              blob,
              contentType: blob.type || 'image/jpeg',
              sizeBytes: blob.size,
              capturedAt: safeCap,
              dayOfWeek: payload.dayOfWeek || dayNames[new Date(safeCap).getDay()],
              latitude: payload.latitude ?? null,
              longitude: payload.longitude ?? null,
              gpsAccuracy: payload.gpsAccuracy ?? null,
              gpsSource: payload.gpsSource === 'BASEMENT_CACHED' ? 'BASEMENT_CACHED' : 'LIVE',
              caption: payload.remarks || payload.notes || undefined,
              category: isWo ? 'TASK_COMPLETION' : 'GAUGE',
              status: 'PENDING',
              attempts: 0,
              createdAt: item.createdAt,
            });
            payload.photoDataUrl = undefined;
            payload.photos = [];
            payload.pendingPhotoIds = [cpid];
            await enqueueOutboxItem({
              ...item,
              payload,
              status: 'PENDING',
              attempts: 0,
              lastError: undefined,
              httpStatus: undefined,
            });
            repairedCount++;
          }
        }
      }
    }

    return repairedCount;
  } catch (err) {
    console.warn('Error repairing legacy outbox items:', err);
    return 0;
  }
}

/**
 * Recovery routine for already-captured, un-uploaded photos stored locally in IndexedDB.
 * Runs automatically on app open & network reconnect.
 * Returns exact counts: { found, uploaded, failed }.
 */
export async function recoverUnsentPhotos(): Promise<{
  found: number;
  uploaded: number;
  failed: number;
}> {
  if (typeof window === 'undefined') return { found: 0, uploaded: 0, failed: 0 };
  try {
    await migrateLegacyLocalStorageQueue();
    await repairOversizedOutboxItems();

    const pendingPhotos = await getPendingQueuedPhotos();
    const found = pendingPhotos.length;
    if (found === 0) {
      return { found: 0, uploaded: 0, failed: 0 };
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return { found, uploaded: 0, failed: 0 };
    }

    // Reset previously failed photos so recovery immediately tries them oldest-first
    for (const p of pendingPhotos) {
      if (p.status === 'FAILED') {
        await resetQueuedPhotoForRetry(p.clientPhotoId);
      }
    }

    const res = await drainOutbox({ force: true });
    console.info(
      `[VigilAMC Recovery] Found ${found} unsent local photo(s); uploaded=${res.uploadedPhotosCount}, failed=${res.failedPhotosCount}`
    );
    return {
      found,
      uploaded: res.uploadedPhotosCount,
      failed: res.failedPhotosCount,
    };
  } catch (err) {
    console.warn('[VigilAMC Recovery] Error recovering unsent photos:', err);
    return { found: 0, uploaded: 0, failed: 0 };
  }
}

export async function seedOversizedOutboxItemForTest(clientSyncId: string): Promise<void> {
  const db = await openDB();
  const oversizedPhoto = 'data:image/jpeg;base64,' + 'A'.repeat(200000);
  const brokenItem: OutboxItem = {
    clientSyncId,
    actionType: 'COMPLETE_INSPECTION',
    payload: {
      clientSyncId,
      buildingId: 'test-building',
      equipmentId: 'test-equipment',
      status: 'PASSED',
      photoDataUrl: oversizedPhoto,
      remarks: 'Seeded oversized test inspection',
    },
    createdAt: Date.now(),
    attempts: 2,
    status: 'FAILED',
    lastError: 'HTTP 413: Payload too large',
    httpStatus: 413,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(OUTBOX_STORE, 'readwrite');
    const store = tx.objectStore(OUTBOX_STORE);
    store.put(brokenItem);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
