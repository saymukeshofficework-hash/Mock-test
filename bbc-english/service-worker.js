/* Bump CACHE_VERSION whenever any cached file changes, to bust old caches. */
const CACHE_VERSION = "bbceng-v1";
const PRECACHE_URLS = [
  "index.html", "learn.html", "speaking.html", "grammar.html", "vocabulary.html",
  "listening.html", "reading.html", "progress.html", "courses.html", "about.html",
  "contact.html", "privacy.html", "test.html", "onboarding.html", "more.html",
  "css/style.css", "css/components.css", "css/responsive.css",
  "js/app.js", "js/config.js", "js/storage.js", "js/progress.js", "js/gamification.js", "js/quiz.js", "js/speaking.js",
  "data/vocabulary.js", "data/grammar.js", "data/speaking.js", "data/phrases.js", "data/reading.js", "data/listening.js", "data/challenges.js",
  "manifest.json", "assets/icons/icon.svg", "assets/icons/icon-192.png", "assets/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match(req).then((res) => res || caches.match("index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        if (res && res.status === 200 && res.type === "basic") {
          const clone = res.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(req, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
