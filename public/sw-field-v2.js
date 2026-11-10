/**
 * VigilAMC Field PWA Service Worker v2
 * Runtime Caching Strategy for Offline Fire Safety Audits & Inspections
 *
 * Rules:
 * 1. Navigations (/technician): Network-first with cached fallback (last-known app shell)
 * 2. /_next/static/*: Cache-first with runtime fill (immutable hashed chunks safe per filename)
 * 3. /api/technician/*: Network-only (never cache sensitive live data; return 503 JSON offline)
 * 4. Versioned cache names + auto-cleanup of old 'vigilamc-field-pwa-v1' and outdated v2 caches on activate
 * 5. skipWaiting on install, clientsClaim on activate
 */

const CACHE_VERSION = 'v2-20261110-1';
const SHELL_CACHE = `vigilamc-field-shell-${CACHE_VERSION}`;
const STATIC_CACHE = `vigilamc-field-static-${CACHE_VERSION}`;
const CURRENT_CACHES = [SHELL_CACHE, STATIC_CACHE];

const STATIC_PRECACHE = [
  '/manifest.json',
  '/favicon.svg',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/brand/favicon-32.png',
  '/brand/logo-tile-192.png',
  '/brand/logo-tile-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => {
      return cache.addAll(STATIC_PRECACHE).catch((err) => {
        console.warn('[sw-field-v2] Precache partial error (ignored):', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !CURRENT_CACHES.includes(key))
          .map((key) => {
            console.info('[sw-field-v2] Deleting stale cache:', key);
            return caches.delete(key);
          })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // 1. Bypass external origins (Supabase, Cloudflare R2, Google Maps, etc.)
  if (url.origin !== self.location.origin) {
    return;
  }

  // 2. Technician API requests: NETWORK-ONLY (never cache sensitive compliance/auth data)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({
            error: 'OFFLINE: Device is currently offline. Actions will queue in phone outbox.',
            offline: true,
          }),
          {
            status: 503,
            statusText: 'Service Unavailable (Offline)',
            headers: { 'Content-Type': 'application/json' },
          }
        );
      })
    );
    return;
  }

  // 3. HTML Navigations (/technician): NETWORK-FIRST with cached fallback
  if (request.mode === 'navigate' || url.pathname.startsWith('/technician')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(SHELL_CACHE).then((cache) => {
              cache.put(request, clone);
              cache.put('/technician', response.clone());
            });
          }
          return response;
        })
        .catch(async () => {
          const cached =
            (await caches.match(request)) ||
            (await caches.match('/technician')) ||
            (await caches.match(new Request('/technician')));
          if (cached) return cached;
          return new Response(
            '<!DOCTYPE html><html><head><meta charset="utf-8"><title>VigilAMC Offline</title><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="font-family:sans-serif;padding:24px;text-align:center;background:#F4F8FB;color:#1C1917;"><h2>VigilAMC Field App</h2><p>You are offline. Please reconnect to load the app shell for the first time.</p></body></html>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        })
    );
    return;
  }

  // 4. Immutable Next.js static assets (_next/static/*): CACHE-FIRST with runtime fill
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // 5. Static icons / brand images / manifests: CACHE-FIRST
  if (
    STATIC_PRECACHE.includes(url.pathname) ||
    url.pathname.startsWith('/brand/') ||
    /\.(png|jpg|jpeg|webp|svg|ico|woff2?)$/i.test(url.pathname)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }
});
