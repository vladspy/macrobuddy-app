const CACHE_NAME = "macrobuddy-cache-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/login.html",
  "/profile.html",
  "/css/design.css",
  "/css/login.css",
  "/css/profile.css",
  "/js/index.js",
  "/js/login.js",
  "/js/profile.js",
  "/manifest.json"
];

// Install Service Worker and Cache Files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caching app shell...");
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate Event - Clean Old Caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("Deleting old cache:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// Fetch Event - Serve from Cache if Offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
