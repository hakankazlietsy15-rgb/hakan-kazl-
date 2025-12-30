
const CACHE_NAME = 'yunuslar-izin-v2'; // Versiyon yükseltildi
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn-icons-png.flaticon.com/512/3652/3652191.png',
  'https://cdn.tailwindcss.com'
];

// Yükleme aşamasında dosyaları önbelleğe al
self.addEventListener('install', event => {
  self.skipWaiting(); // Yeni versiyonu hemen aktif et
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Aktivasyon aşamasında eski önbellekleri temizle
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

// İstekleri yakala
self.addEventListener('fetch', event => {
  // Eğer bu bir sayfa navigasyon isteği ise (örn: ana ekrandan açılış)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        // İnternet yoksa veya hata varsa önbellekteki index.html'i döndür
        return caches.match('./index.html');
      })
    );
    return;
  }

  // Diğer istekler için (resim, script vb.)
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
