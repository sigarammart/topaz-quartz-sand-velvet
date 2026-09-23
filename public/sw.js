/* Xplore Pondy — browser cache. Network stays the source of truth; this only skips repeat downloads. */
const SHELL = "xp-shell-v1";
const DATA = "xp-data-v1";
const IMAGES = "xp-images-v1";
const DATA_LIMIT = 40;
const IMAGE_LIMIT = 120;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((cache) => cache.addAll(["/manifest.webmanifest", "/favicon.ico", "/icon-192.png", "/apple-touch-icon.png"]).catch(() => undefined))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  const keep = new Set([SHELL, DATA, IMAGES]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("xp-") && !keep.has(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

function skip(url) {
  return (
    url.pathname.startsWith("/@") ||
    url.pathname.startsWith("/src/") ||
    url.pathname.startsWith("/node_modules") ||
    url.pathname.startsWith("/api/auth") ||
    url.pathname.startsWith("/__grok")
  );
}

function isImage(url) {
  if (/\.(?:png|jpe?g|webp|gif|avif|svg|ico)$/i.test(url.pathname)) return true;
  return url.hostname.endsWith("xplorepondy.com") && url.pathname.includes("/wp-content/uploads/");
}

function isServerRead(request, url) {
  if (request.method !== "GET" || url.origin !== self.location.origin) return false;
  return request.headers.get("x-tsr-serverfn") === "true" || url.pathname.includes("_serverFn");
}

async function trim(cache, limit) {
  const keys = await cache.keys();
  if (keys.length <= limit) return;
  await Promise.all(keys.slice(0, keys.length - limit).map((key) => cache.delete(key)));
}

async function fromNetwork(request, cacheName, limit) {
  const response = await fetch(request);
  if (response.ok || response.type === "opaque") {
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
    await trim(cache, limit);
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (skip(url)) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          void caches.open(SHELL).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => (await caches.match(request)) || (await caches.match("/")) || Response.error()),
    );
    return;
  }

  if (isImage(url)) {
    event.respondWith(
      caches.open(IMAGES).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          return await fromNetwork(request, IMAGES, IMAGE_LIMIT);
        } catch {
          return cached || Response.error();
        }
      }),
    );
    return;
  }

  if (isServerRead(request, url)) {
    event.respondWith(
      caches.open(DATA).then(async (cache) => {
        const cached = await cache.match(request);
        const refresh = fromNetwork(request, DATA, DATA_LIMIT).catch(() => cached);
        if (cached) {
          event.waitUntil(refresh);
          return cached;
        }
        return refresh.then((response) => response || Response.error());
      }),
    );
  }
});
