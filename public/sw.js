var CACHE_NAME = 'pepperberry-v5';
var OFFLINE_URL = '/offline.html';

// Pre-cache offline fallback page on install
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll([OFFLINE_URL, '/icon-192.png', '/icon-512.png', '/PBLogo.png']);
    })
  );
  self.skipWaiting();
});

// Delete ALL old caches on activate
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) { return key !== CACHE_NAME; })
          .map(function (key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// NO fetch caching — all requests go straight to network
// Only handle navigation failures with offline page
self.addEventListener('fetch', function (event) {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(function () {
        return caches.match(OFFLINE_URL);
      })
    );
  }
});

// Push notification handler
self.addEventListener('push', function (event) {
  if (!event.data) return;

  var data = event.data.json();

  var options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: {
      url: data.url || '/dashboard',
    },
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Pepperberry Farm', options)
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  var url = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      return clients.openWindow(url);
    })
  );
});
