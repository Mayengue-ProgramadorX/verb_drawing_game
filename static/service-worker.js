// CACHE NAME
const CACHE_NAME = "verb-game-cache-v1";

// FILES TO CACHE OFFLINE
const FILES_TO_CACHE = [
  "/",
  "/roleta",
  "/about",
  "/static/css/index.css",
  "/static/css/about.css",
  "/static/css/roleta.css",
  "/static/css/conjugations.css",
  "/static/js/animation.js",
  "/static/js/roleta.js",
  "/static/js/conjugations.js",
  "/static/js/voice.js",
  "/static/icons/icon-192.png",
  "/static/icons/icon-512.png",
  "/static/sound/spin.mp3"
];

// INSTALL SW
self.addEventListener("install", (event) => {
  console.log("Service Worker installed!");

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// ACTIVATE SW
self.addEventListener("activate", (event) => {
  console.log("Service Worker activated!");
  event.waitUntil(self.clients.claim());
});

// FETCH (offline support)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      // Return cache OR fetch from internet
      return cached || fetch(event.request);
    })
  );
});
