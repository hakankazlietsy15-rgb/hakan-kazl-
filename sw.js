
const CACHE_NAME = 'yunuslar-izin-v6';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn-icons-png.flaticon.com/512/3652/3652191.png',
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)));
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Navigasyon isteklerini her zaman index.html'e yönlendir (SPA mantığı)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html') || caches.match('/');
      })
    );
    return;
  }

  // Diğer dosyalar için: Önbellekte varsa ver, yoksa internetten al
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
