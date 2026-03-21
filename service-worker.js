const CACHE_NAME = "transporte-cache-v1";

const urlsToCache = [
  "/",
  "/index.html",
  "/styles.css",
  "/script.js",
  "/manifest.json"
];

// Instalar
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Activar
self.addEventListener("activate", event => {
  console.log("Service Worker activo");
});

// Interceptar peticiones (offline)
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});