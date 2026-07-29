const CACHE_NAME = 'eastwest-app-v5';
const APP_SHELL = [
  '/',
  '/manifest.webmanifest',
  '/icon-192.png?v=4',
  '/icon-512.png?v=4',
  '/apple-touch-icon.png?v=4',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api/')
  ) {
    return;
  }

  // Crawler-facing resources always come from the network — a cached copy goes
  // stale the moment a package is published or edited.
  if (url.pathname === '/robots.txt' || url.pathname.startsWith('/sitemap')) {
    return;
  }

  // Navigations are network-first and cached *per URL*. Every HTML response now
  // carries a <head> built for its own URL by the edge server, so the previous
  // behaviour — storing one response under '/' and replaying it for every route
  // — would serve the wrong title, canonical and Open Graph tags everywhere.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          // Offline: prefer this URL's own cached HTML, then the app shell.
          const cached = await caches.match(request);
          if (cached) return cached;
          const shell = await caches.match('/');
          return shell ?? Response.error();
        }),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        }),
    ),
  );
});
