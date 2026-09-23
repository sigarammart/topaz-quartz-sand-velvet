import { useEffect } from "react";

/** Registers the browser cache worker. Dev Vite sockets are ignored inside the worker. */
export function CacheWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => undefined);
  }, []);
  return null;
}
