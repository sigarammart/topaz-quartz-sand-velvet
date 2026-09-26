import { useEffect } from "react";

/**
 * Cache worker is intentionally disabled.
 * Xplore Pondy uses live WordPress data as the source of truth while booking
 * and catalog integration is being developed. Remove any previously
 * registered service worker and its caches on startup.
 */
export function CacheWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    void navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
      .catch(() => undefined);

    if ("caches" in window) {
      void caches
        .keys()
        .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
        .catch(() => undefined);
    }
  }, []);

  return null;
}
