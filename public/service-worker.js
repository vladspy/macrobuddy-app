const CACHE_NAME = "macrobuddy-cache-v3";
const STATIC_ASSETS = [
    "/",
    "/index.html",
    "/search.html",
    "/css/design.css",
    "/js/index.js",
    "/js/search.js",
    "/manifest.json"
];

// ✅ Install and Cache UI
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("✅ Caching UI files.");
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

// ✅ Activate and Delete Old Cache
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            )
        )
    );
});

// ✅ Serve Cached UI If Offline (API Calls Are NOT Cached)
self.addEventListener("fetch", (event) => {
    if (event.request.url.includes("/api/food/search")) {
        return; // 🛑 Do NOT cache API requests
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request);
        })
    );
});
