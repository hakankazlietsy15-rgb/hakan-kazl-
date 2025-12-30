
const CACHE_NAME = 'yunuslar-izin-v3';
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
      // Hataları önlemek için her dosyayı tek tek eklemeyi dene
      return Promise.allSettled(
        urlsToCache.map(url => cache.add(url).catch(err => console.log('Cache hatası:', url, err)))
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

self.addEventListener('fetch', event => {
  // Navigasyon (sayfa açılış) istekleri için özel kontrol
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Eğer internet yoksa veya sunucu 404 dönerse önbellekteki kök dizini veya index.html'i ver
        return caches.match('./') || caches.match('index.html');
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
