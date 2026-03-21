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
self.addEventListener("fetch", event => {

  // Ignorar cosas raras (extensiones, etc.)
  if (!event.request.url.startsWith("http")) return;

  // 🧠 Si es navegación (abrir la app)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // 🧠 Para archivos normales (CSS, JS, etc.)
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request)
          .then(res => {
            // Validar respuesta
            if (!res || res.status !== 200 || res.type !== "basic") {
              return res;
            }

            const clone = res.clone();

            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, clone);
            });

            return res;
          });
      })
      .catch(() => caches.match("./index.html"))
  );
});