const CACHE_NAME = 'headache-manager-v2';
const urlsToCache = [
  '/headache/',                             // For some servers
  '/headache/index.html',                     // ONLY this is required
  '/headache/manifest.json',                  // Must exist
  '/headache/assets/icon/money-bag-color.svg', // Correct name + path
  '/headache/assets/icon/money-bag-flat.svg'   // If you have it
  // NO GOOGLE FONTS
  // NO STYLES.CSS
  // NO 3D PNG
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async cache => {
        console.log('Caching app shell...');

        // Cache one by one with error handling
        for (const url of urlsToCache) {
          try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            await cache.put(url, response);
            console.log('Cached:', url);
          } catch (err) {
            console.warn('Failed to cache:', url, err);
            // Continue — don't break install
          }
        }
      })
      .catch(err => {
        console.error('Install failed:', err);
      })
  );

  // Force new SW to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names => {
      return Promise.all(
        names.map(name => {
          if (name !== CACHE_NAME) {
            console.log('Deleting old cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Serve HTML from cache for navigation
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/headache/index.html')
        .then(cached => cached || fetch(event.request))
    );
    return;
  }

  // Serve other cached assets
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request))
  );
});