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
  if (url.pathname.startsWith('/snooze')) return;      
  if (url.pathname.startsWith('/subscribe')) return;   
  if (url.pathname.startsWith('/unsubscribe')) return; 

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
  let data = { title: 'Новое уведомление', body: '', reminderId: null };
  if (event.data) {
    data = event.data.json();
  }

  const options = {
    body: data.body,
    icon: '/icons/favicon-192x192.png',
    badge: '/icons/favicon-96x96.png',
    data: { reminderId: data.reminderId }
  };

  if (data.reminderId) {
    options.actions = [
      { action: 'snooze', title: 'Отложить на 5 минут' }
    ];
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;

  console.log('Notification clicked:', action, notification.data);

  if (action === 'snooze') {
    const reminderId = notification.data.reminderId;
    console.log('Snoozing reminder:', reminderId);

    const url = `http://localhost:3001/snooze?reminderId=${reminderId}`;

    event.waitUntil(
      fetch(`http://localhost:3001/snooze?reminderId=${reminderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(response => {
          console.log('Snooze response:', response.status);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('Snooze successful:', data);
          notification.close();
        })
        .catch(err => {
          console.error('Snooze failed:', err);
          self.registration.showNotification('Ошибка', {
            body: 'Не удалось отложить напоминание',
            icon: '/icons/favicon-192x192.png'
          });
        })
    );
  } else {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(windowClients => {
        if (windowClients.length > 0) {
          windowClients[0].focus();
        } else {
          clients.openWindow('/');
        }
        notification.close();
      })
    );
  }
});