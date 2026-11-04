/**
 * BRAIN LAG - Service Worker for 100% Offline Gameplay
 */

const CACHE_NAME = 'brainlag-v1.0.0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/styles.css',
  './manifest.json',
  './icons/brain-icon.svg',
  './js/questions.js',
  './js/audio.js',
  './js/storage.js',
  './js/particles.js',
  './js/share.js',
  './js/modes/overthink.js',
  './js/modes/colorchaos.js',
  './js/modes/memory.js',
  './js/modes/reflex.js',
  './js/modes/destroyer.js',
  './js/modes/daily.js',
  './js/app.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        // Fallback for HTML documents
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
