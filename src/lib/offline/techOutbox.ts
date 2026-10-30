/**
 * VigilAMC Technician Offline Outbox & Cache Engine
 * Uses browser IndexedDB for zero-dependency, crash-resilient offline persistence
 * Handles basement queuing, auto-sync, idempotency, and legacy localStorage migration
 */

export interface OutboxItem {
  clientSyncId: string;
  actionType: 'COMPLETE_INSPECTION' | 'UPDATE_STATUS' | 'UPLOAD_PHOTO' | 'COMPLETE_WORK_ORDER';
  payload: any;
  createdAt: number;
  attempts: number;
  status: 'PENDING' | 'SYNCED' | 'FAILED';
  lastError?: string;
}

const DB_NAME = 'vigil_tech_offline_db';
const DB_VERSION = 1;
const OUTBOX_STORE = 'outbox';
const CACHE_STORE = 'cache';

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
      const clientSyncId = item.clientSyncId || `LEGACY-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      await enqueueOutboxItem({
        clientSyncId,
        actionType: 'COMPLETE_INSPECTION',
        payload: item,
        createdAt: item.createdAt || Date.now(),
        attempts: 0,
        status: 'PENDING',
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
 * Add or update an item in the outbox
 */
export async function enqueueOutboxItem(item: OutboxItem): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OUTBOX_STORE, 'readwrite');
    const store = tx.objectStore(OUTBOX_STORE);
    store.put(item);
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
 * Mark an outbox item as FAILED with error message
 */
export async function markOutboxItemFailed(clientSyncId: string, errorMsg: string): Promise<void> {
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
        store.put(item);
      }
      resolve();
    };
    getReq.onerror = () => reject(getReq.error);
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
export async function getLocalCache<T = any>(key: string): Promise<{ data: T; updatedAt: number } | null> {
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
 * Drain and sync all pending outbox entries to the server
 */
export async function drainOutbox(
  onProgress?: (synced: number, total: number) => void
): Promise<{ success: boolean; syncedCount: number; failedCount: number; errors: string[] }> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { success: false, syncedCount: 0, failedCount: 0, errors: ['Offline'] };
  }

  const items = await getPendingOutboxItems();
  if (items.length === 0) {
    return { success: true, syncedCount: 0, failedCount: 0, errors: [] };
  }

  let syncedCount = 0;
  let failedCount = 0;
  const errors: string[] = [];

  // Send items in chunks of up to 5 to avoid large payload timeouts on 2G/3G
  const chunkSize = 5;
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    try {
      const res = await fetch('/api/technician/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: chunk }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => 'Server error');
        for (const item of chunk) {
          await markOutboxItemFailed(item.clientSyncId, `HTTP ${res.status}: ${errText.slice(0, 80)}`);
          failedCount++;
        }
        errors.push(`HTTP ${res.status}`);
        continue;
      }

      const data = await res.json();
      const results: Array<{ clientSyncId: string; status: string; error?: string }> = data.results || [];

      for (const r of results) {
        if (r.status === 'SYNCED') {
          await markOutboxItemSynced(r.clientSyncId);
          syncedCount++;
        } else {
          await markOutboxItemFailed(r.clientSyncId, r.error || 'Server rejected');
          failedCount++;
          errors.push(r.error || 'Sync error');
        }
      }

      if (onProgress) {
        onProgress(syncedCount, items.length);
      }
    } catch (netErr: any) {
      console.warn('Network error while draining chunk:', netErr);
      for (const item of chunk) {
        await markOutboxItemFailed(item.clientSyncId, netErr.message || 'Network dropped');
        failedCount++;
      }
      errors.push(netErr.message || 'Network error');
    }
  }

  return {
    success: failedCount === 0,
    syncedCount,
    failedCount,
    errors,
  };
}
