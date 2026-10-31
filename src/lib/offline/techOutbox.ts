/**
 * VigilAMC Technician Offline Outbox & Cache Engine
 * Zero-dependency IndexedDB storage for offline field resilience
 * Implements sequential per-item drain, backoff, session preservation, and diagnostics
 */

import { createClient } from '@/lib/supabase/client';

export interface OutboxItem {
  clientSyncId: string;
  actionType: 'COMPLETE_INSPECTION' | 'UPDATE_STATUS' | 'UPLOAD_PHOTO' | 'COMPLETE_WORK_ORDER';
  payload: any;
  createdAt: number;
  attempts: number;
  status: 'PENDING' | 'SYNCED' | 'FAILED';
  lastError?: string;
  httpStatus?: number;
  lastAttemptAt?: number;
  technicianId?: string;
  schemaVersion?: number;
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
const DB_VERSION = 2;
const OUTBOX_STORE = 'outbox';
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
      if (!db.objectStoreNames.contains(CACHE_STORE)) {
        db.createObjectStore(CACHE_STORE, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(LOGS_STORE)) {
        db.createObjectStore(LOGS_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB'));
    };
  });
}

/**
 * Exponential backoff delay calculation (Section 4.2)
 * Intervals: 5s -> 15s -> 60s -> 5m (300s) -> 15m (900s)
 */
export function getBackoffDelayMs(attempts: number): number {
  const delays = [5000, 15000, 60000, 300000, 900000];
  const idx = Math.min(Math.max(0, (attempts || 1) - 1), delays.length - 1);
  return delays[idx];
}

export function isItemReadyForRetry(item: OutboxItem, force = false): boolean {
  if (force) return true;
  if (item.status === 'PENDING') return true;
  if (item.status === 'FAILED') {
    if (!item.lastAttemptAt) return true;
    const delay = getBackoffDelayMs(item.attempts || 1);
    return Date.now() - item.lastAttemptAt >= delay;
  }
  return false;
}

/**
 * Record a diagnostic log breadcrumb for dev + support troubleshooting (Section 4.6)
 * Keeps the last 20 entries
 */
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

    // Prune entries older than last 20
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

/**
 * Retrieve the last ~20 sync diagnostic logs
 */
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

/**
 * Migrate legacy localStorage inspection queue on first initialization
 */
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
        schemaVersion: 1,
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

/**
 * Add or update an item in the outbox with payload size guard (Section 4.4)
 */
export async function enqueueOutboxItem(item: OutboxItem): Promise<void> {
  const payloadStr =
    typeof item.payload === 'string' ? item.payload : JSON.stringify(item.payload || {});

  // Enqueue size guard: prevent queuing items over 2.5MB
  if (payloadStr.length > 2.5 * 1024 * 1024) {
    throw new Error('Payload exceeds 2.5 MB maximum allowed offline limit. Please retake photo.');
  }

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OUTBOX_STORE, 'readwrite');
    const store = tx.objectStore(OUTBOX_STORE);
    store.put({
      ...item,
      schemaVersion: item.schemaVersion || 1,
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Get all pending/failed outbox items ordered by createdAt ascending
 */
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

/**
 * Get all outbox items (pending, failed, and recent)
 */
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

/**
 * Mark an outbox item as SYNCED (or remove it)
 */
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

/**
 * Mark an outbox item as FAILED with error message and HTTP status code
 */
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

/**
 * Discard an individual outbox item explicitly (Section 4.5)
 */
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

/**
 * Reset an individual item's status to PENDING for immediate retry
 */
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

/**
 * Get count of pending outbox items
 */
export async function getOutboxCount(): Promise<{ pending: number; failed: number }> {
  try {
    const items = await getPendingOutboxItems();
    const failed = items.filter((i) => i.status === 'FAILED').length;
    return { pending: items.length, failed };
  } catch {
    return { pending: 0, failed: 0 };
  }
}

/**
 * Set a key-value pair in local offline cache (tasks, history, buildings, profile)
 */
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

/**
 * Get cached data by key
 */
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

/**
 * Resolve Authorization header using stored vigil_tech_token or Supabase session
 */
async function resolveAuthHeader(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  // 1. Check vigil_tech_token in localStorage
  const localTechToken = localStorage.getItem('vigil_tech_token');
  if (localTechToken) {
    return `Bearer ${localTechToken}`;
  }

  // 2. Check Supabase session
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

/**
 * Attempt to refresh session when 401 occurs (Section 2 [A])
 */
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

export interface DrainOptions {
  force?: boolean;
  targetSyncId?: string;
  onProgress?: (synced: number, total: number) => void;
}

export interface DrainResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  errors: string[];
  authRequired?: boolean;
}

/**
 * Drain and sync outbox entries SEQUENTIALLY with per-item isolation,
 * session-expiry recovery, backoff, and diagnostics (Sections 2 & 4).
 */
export async function drainOutbox(options?: DrainOptions): Promise<DrainResult> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { success: false, syncedCount: 0, failedCount: 0, errors: ['Offline'] };
  }

  const allItems = await getPendingOutboxItems();
  if (allItems.length === 0) {
    return { success: true, syncedCount: 0, failedCount: 0, errors: [] };
  }

  // Filter items eligible by backoff or specific target
  const targetId = options?.targetSyncId;
  const eligibleItems = targetId
    ? allItems.filter((i) => i.clientSyncId === targetId)
    : allItems.filter((i) => isItemReadyForRetry(i, options?.force));

  if (eligibleItems.length === 0) {
    return { success: true, syncedCount: 0, failedCount: 0, errors: [] };
  }

  let syncedCount = 0;
  let failedCount = 0;
  const errors: string[] = [];

  let authHeader = await resolveAuthHeader();
  let refreshedOnce = false;

  // Process items ONE BY ONE sequentially (Section 4.1)
  for (let i = 0; i < eligibleItems.length; i++) {
    const item = eligibleItems[i];
    const clientSyncId = item.clientSyncId;

    console.warn(`[VigilAMC Sync] Draining item ${i + 1}/${eligibleItems.length}: ${clientSyncId}`, {
      actionType: item.actionType,
      attempts: item.attempts,
    });

    let res: Response;
    let resStatus = 0;
    let resBodyText = '';

    try {
      res = await fetch('/api/technician/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ items: [item] }),
      });
      resStatus = res.status;
    } catch (netErr: any) {
      console.warn(`[VigilAMC Sync] Network error for ${clientSyncId}:`, netErr);
      const errMsg = netErr.message || 'Network disconnected';
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

    // Section 2 [A]: HTTP 401 on expired session
    if (resStatus === 401) {
      if (!refreshedOnce) {
        refreshedOnce = true;
        const freshHeader = await refreshAuthSession();
        if (freshHeader) {
          authHeader = freshHeader;
          // Silent retry with refreshed session token
          try {
            const retryRes = await fetch('/api/technician/sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: authHeader,
              },
              credentials: 'include',
              body: JSON.stringify({ items: [item] }),
            });
            if (retryRes.ok) {
              res = retryRes;
              resStatus = retryRes.status;
            }
          } catch {}
        }
      }

      // If still 401: NEVER mark items failed! Keep queued and prompt re-auth (Section 2 [A])
      if (resStatus === 401) {
        console.warn(
          `[VigilAMC Sync] 401 Unauthorized for ${clientSyncId}. Preserving outbox without failing items.`
        );
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
          errors: ['Session expired. Please sign in to send your saved items.'],
          authRequired: true,
        };
      }
    }

    // Section 2 [B]: HTTP 413 Payload Too Large
    if (resStatus === 413) {
      const msg413 = 'Payload too large (>2.5MB). Please retake photo with camera.';
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
      resBodyText = await res.text().catch(() => 'Server error');
      console.warn(`[VigilAMC Sync] HTTP ${resStatus} error for ${clientSyncId}:`, resBodyText);
      const errMsg = `HTTP ${resStatus}: ${resBodyText.slice(0, 100)}`;
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

    // HTTP 200: Parse per-item JSON result
    try {
      const data = await res.json();
      const perItemResult = Array.isArray(data.results) ? data.results[0] : null;

      if (perItemResult && perItemResult.status === 'SYNCED') {
        await markOutboxItemSynced(clientSyncId);
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
    } catch (jsonErr: any) {
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
    success: failedCount === 0,
    syncedCount,
    failedCount,
    errors,
  };
}
