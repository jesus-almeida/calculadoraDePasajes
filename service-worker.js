const CACHE_NAME = "transporte-cache";

const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./script.js",
  "./manifest.json"
];

// Instalar
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activar (limpiar cache viejo)
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    })
  );
});

// Fetch inteligente
self.addEventListener("fetch", e => {

  // ❌ Ignorar requests que no sean HTTP/HTTPS
  if (!e.request.url.startsWith("http")) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {

        // ❌ Ignorar respuestas inválidas
        if (!res || res.status !== 200 || res.type !== "basic") {
          return res;
        }

        const clone = res.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(e.request, clone);
        });

        return res;
      })
      .catch(() => caches.match(e.request))
  );
});