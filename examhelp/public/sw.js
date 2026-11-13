// Minimal service worker: shows an offline page when a page cannot load. No content is cached.
const OFFLINE = "/examhelp/offline.html";
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open("offline-v1").then((c) => c.add(OFFLINE)));
  self.skipWaiting();
});
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (e) => {
  if (e.request.mode !== "navigate") return;
  e.respondWith(fetch(e.request).catch(() => caches.match(OFFLINE)));
});

// Daily current affairs alerts (Web Push). In the Android app these show as app notifications.
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.title || "TETTESTHUB", {
    body: d.body || "आज के करेंट अफेयर्स आ गए / Today's current affairs are live",
    icon: "/examhelp/icons/icon-192.png",
    badge: "/examhelp/icons/icon-192.png",
    tag: d.tag || "ca-daily",
    data: { url: d.url || "/examhelp/current-affairs/" },
  }));
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "/examhelp/current-affairs/";
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
    for (const c of list) if (c.url.includes("/examhelp/") && "navigate" in c) return c.navigate(url).then((w) => w && w.focus());
    return self.clients.openWindow(url);
  }));
});
