
const CACHE_NAME = 'yunuslar-izin-v4';
const urlsToCache = [
  'index.html',
  'manifest.json',
  'https://cdn-icons-png.flaticon.com/512/3652/3652191.png',
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(
        urlsToCache.map(url => cache.add(url).catch(err => console.log('Önbellek hatası:', url, err)))
      );
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Navigasyon istekleri için (Ana ekrandan açılış dahil)
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Eğer sunucu bir hata (404) döndürürse, önbellekteki index.html'i ver
          if (!response || response.status === 404) {
            return caches.match('index.html');
          }
          return response;
        })
        .catch(() => {
          // İnternet tamamen yoksa önbellekten yükle
          return caches.match('index.html');
        })
    );
    return;
  }

  // Diğer kaynaklar için (Resimler, scriptler vb.)
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
