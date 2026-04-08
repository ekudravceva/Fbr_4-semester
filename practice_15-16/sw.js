const CACHE_NAME = 'app-shell-v2';
const DYNAMIC_CACHE = 'dynamic-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/app.js',
  '/style.css',
  '/manifest.json',
  '/icons/favicon.ico',
  '/icons/favicon-180x180.png',
  '/icons/favicon-96x96.png',
  '/icons/favicon-192x192.png',
  '/icons/favicon-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME && k !== DYNAMIC_CACHE).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (url.origin !== location.origin) return;

  if (url.pathname.startsWith('/socket.io/')) return;

  if (url.pathname.startsWith('/content/')) {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          const clone = res.clone();
          caches.open(DYNAMIC_CACHE).then(cache => cache.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});

self.addEventListener('push', (event) => {
  let data = { title: 'Новое уведомление', body: '' };
  if (event.data) {
    data = event.data.json();
  }
  const options = {
    body: data.body,
    icon: '/icons/favicon-192x192.png',
    badge: '/icons/favicon-96x96.png'
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});