const CACHE_NAME = 'notes-cache-v3';  
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
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('Удаление старого кэша:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});