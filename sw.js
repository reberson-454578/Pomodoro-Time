const CACHE_NAME = "pomodoro-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/styles.css",
  "/responsividade.css",
  "/script.js",
  "/manifest.json",
  "/images/icon-192x192.png",
  "/images/icon-512x512.png",
  "/sounds/alarm.mp3",
  "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
