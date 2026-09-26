/* Xplore Pondy — cache disabled. Network is the source of truth. */
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
      .then(() => self.registration.unregister()),
  );
});

/*
 * Intentionally no fetch handler.
 * The previous service worker cached HTML, server-function responses and
 * images, which could leave the PWA between live WordPress and cached data.
 * This worker only clears those old caches and unregisters itself.
 */
