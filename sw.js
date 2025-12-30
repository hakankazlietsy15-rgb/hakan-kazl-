
const CACHE_NAME = 'yunuslar-izin-v5';
const urlsToCache = [
  './',
  'index.html',
  'manifest.json',
  'https://cdn-icons-png.flaticon.com/512/3652/3652191.png',
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
  return self.clients.claim();
});

// KRİTİK NOKTA: Navigasyon hatasını öldüren fetch yöneticisi
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Eğer cevap 404 ise veya bozuksa, cache'deki ana sayfayı ver
          if (!response || response.status >= 400) {
            return caches.match('index.html') || caches.match('./');
          }
          return response;
        })
        .catch(() => {
          // İnternet yoksa veya sunucuya erişilemiyorsa cache'i ver
          return caches.match('index.html') || caches.match('./');
        })
    );
    return;
  }

  // Resim, font vb. diğer dosyalar için cache-first
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
