const CACHE_NAME = 'simple-pwa-cache-v2-' + new Date().toISOString().slice(0, 10);
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.ico'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    ).then(() => {
      self.clients.claim();
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        if (networkResponse.ok) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        return cachedResponse;
      });
      
      return cachedResponse || fetchPromise;
    })
  );
});

self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : { title: 'Notification!', body: 'You receive a notification.' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: './icon-192.png'
    })
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.action === 'push-test') {
    self.registration.showNotification('notificatio!', {
      body: 'Hello,a world!.',
      icon: './icon-192.png'
    });
  }
});
