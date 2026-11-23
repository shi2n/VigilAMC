/**
 * VigilAMC Field PWA Service Worker v2
 * Runtime Caching Strategy for Offline Fire Safety Audits & Inspections
 *
 * Rules:
 * 1. Navigations (/technician): Stale-While-Revalidate (instant cached shell on reopen + background refresh)
 * 2. /_next/static/*: Cache-first with runtime fill + WARM_STATIC_ASSETS message (immutable hashed chunks)
 * 3. /api/technician/*: Network-only (never cache sensitive live data; return 503 JSON offline)
 * 4. Versioned cache names + auto-cleanup of outdated caches on activate
 * 5. skipWaiting on install, clientsClaim on activate
 */

const CACHE_VERSION = 'v2-20261123-1';
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

function isHtmlResponse(response) {
  return (response.headers.get('content-type') || '').includes('text/html');
}

// The first launch's HTML and JS load before this worker controls the page,
// so fetch the shell and every chunk it references up front.
async function precacheTechnicianShell() {
  try {
    const response = await fetch('/technician', { credentials: 'include', cache: 'no-store' });
    if (!response.ok || !isHtmlResponse(response)) return;

    const html = await response.clone().text();
    const shellCache = await caches.open(SHELL_CACHE);
    await shellCache.put('/technician', response);

    const assetPaths = new Set();
    for (const match of html.match(/(?:\/_next\/)?static\/(?:chunks|css|media)\/[^"'\s)\\]+/g) || []) {
      assetPaths.add(match.startsWith('/_next/') ? match : `/_next/${match}`);
    }
    const staticCache = await caches.open(STATIC_CACHE);
    await Promise.all([...assetPaths].map((path) => staticCache.add(path).catch(() => null)));
  } catch (err) {
    console.warn('[sw-field-v2] Shell precache skipped:', err);
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(SHELL_CACHE).then((cache) => {
        return cache.addAll(STATIC_PRECACHE).catch((err) => {
          console.warn('[sw-field-v2] Precache partial error (ignored):', err);
        });
      }),
      precacheTechnicianShell(),
    ])
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

// Warm additional /_next/static/* or /brand/* assets reported by the client after first paint
self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || data.type !== 'WARM_STATIC_ASSETS' || !Array.isArray(data.urls)) return;
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(STATIC_CACHE);
        await Promise.all(
          data.urls.map(async (rawUrl) => {
            try {
              const parsed = new URL(rawUrl, self.location.origin);
              if (parsed.origin !== self.location.origin) return;
              if (!parsed.pathname.startsWith('/_next/static/') && !parsed.pathname.startsWith('/brand/')) {
                return;
              }
              const existing = await cache.match(parsed.href);
              if (existing) return;
              const res = await fetch(parsed.href, { credentials: 'same-origin' });
              if (res && res.status === 200) {
                await cache.put(parsed.href, res);
              }
            } catch (_) {}
          })
        );
      } catch (_) {}
    })()
  );
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

  // 3. HTML Navigations (/technician and /technician/* only): STALE-WHILE-REVALIDATE
  // Never intercept marketing/admin/public routes, and never serve HTML for Next.js RSC flight fetches (?_rsc= or RSC: 1).
  const isTechnicianRoute = url.pathname === '/technician' || url.pathname.startsWith('/technician/');
  const isRscRequest = request.headers.get('RSC') === '1' || url.searchParams.has('_rsc');
  if (!isRscRequest && isTechnicianRoute && request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const isRootTech = url.pathname === '/technician';
        const cacheKey = isRootTech ? '/technician' : request;
        const cached = await caches.match(cacheKey, {
          cacheName: SHELL_CACHE,
          ignoreVary: true,
          ignoreSearch: isRootTech,
        });

        const networkPromise = fetch(request)
          .then(async (response) => {
            // Only real HTML may become the offline shell; RSC payloads on the same path would poison it.
            if (response && response.status === 200 && isHtmlResponse(response)) {
              const shellCache = await caches.open(SHELL_CACHE);
              await shellCache.put(cacheKey, response.clone());
              // Pre-warm any hashed _next/static assets referenced in fresh HTML
              try {
                const html = await response.clone().text();
                const staticCache = await caches.open(STATIC_CACHE);
                const assetPaths = new Set();
                for (const match of html.match(/(?:\/_next\/)?static\/(?:chunks|css|media)\/[^"'\s)\\]+/g) || []) {
                  assetPaths.add(match.startsWith('/_next/') ? match : `/_next/${match}`);
                }
                await Promise.all(
                  [...assetPaths].map(async (path) => {
                    const existing = await staticCache.match(path);
                    if (!existing) {
                      await staticCache.add(path).catch(() => null);
                    }
                  })
                );
              } catch (_) {}
            }
            return response;
          })
          .catch(() => null);

        if (cached) {
          event.waitUntil(networkPromise);
          return cached;
        }

        const networkResponse = await networkPromise;
        if (networkResponse) return networkResponse;

        const fallbackShell = await caches.match('/technician', {
          cacheName: SHELL_CACHE,
          ignoreVary: true,
          ignoreSearch: true,
        });
        if (fallbackShell) return fallbackShell;

        return new Response(
          '<!DOCTYPE html><html><head><meta charset="utf-8"><title>VigilAMC Offline</title><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="font-family:sans-serif;padding:24px;text-align:center;background:#FFF8F2;color:#1C1917;"><h2>VigilAMC Field App</h2><p>You are offline. Please reconnect to load the app shell for the first time.</p></body></html>',
          { headers: { 'Content-Type': 'text/html' } }
        );
      })()
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
