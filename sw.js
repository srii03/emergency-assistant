self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('emergency-ai-cache-v1').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/app.js',
        '/manifest.json'
      ]).catch(err => {
        console.error('Cache addAll failed:', err);
      });
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => {
        return caches.match('/index.html');
      });
    })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = ['emergency-ai-cache-v1'];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});