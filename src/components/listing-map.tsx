import { useEffect, useMemo, useRef, useState } from "react";
import { LocateFixed } from "lucide-react";
import type { Listing } from "@/lib/types";
import { listingIsOpen } from "@/lib/hours";
import { listingPinNumbers } from "@/lib/pins";
import { cn } from "@/lib/utils";
import { ListingCard } from "@/components/listing-card";
import { GoogleListingMap } from "@/components/google-listing-map";
import { loadGoogleMaps } from "@/lib/google-maps";
import { useGeo } from "@/store/geo";
import { useTheme } from "@/store/theme";

const PONDICHERRY = { lat: 11.934, lng: 79.832 };
const TILE = 256;
const MIN_ZOOM = 10;
const MAX_ZOOM = 18;

type MapView = { lat: number; lng: number; zoom: number };

type ListingMapProps = {
  listings: Listing[];
  selected?: string;
  onSelect: (slug: string | undefined) => void;
  className?: string;
};

function project(lat: number, lng: number, zoom: number) {
  const n = 2 ** zoom;
  const x = ((lng + 180) / 360) * n;
  const rad = (lat * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n;
  return { x, y };
}

function unproject(x: number, y: number, zoom: number) {
  const n = 2 ** zoom;
  const lng = (x / n) * 360 - 180;
  const m = Math.PI * (1 - (2 * y) / n);
  const lat = (180 / Math.PI) * Math.atan(Math.sinh(m));
  return { lat, lng };
}

function clampZoom(z: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
}

function zoomAround(view: MapView, nextZoom: number, sx: number, sy: number, size: { w: number; h: number }): MapView {
  const z = clampZoom(nextZoom);
  const center = project(view.lat, view.lng, view.zoom);
  const originX = center.x * TILE - size.w / 2;
  const originY = center.y * TILE - size.h / 2;
  const tileX = (originX + sx) / TILE;
  const tileY = (originY + sy) / TILE;
  const k = 2 ** (z - view.zoom);
  return {
    ...unproject(tileX * k - (sx - size.w / 2) / TILE, tileY * k - (sy - size.h / 2) / TILE, z),
    zoom: z,
  };
}

function panView(view: MapView, dx: number, dy: number): MapView {
  const center = project(view.lat, view.lng, view.zoom);
  return { ...view, ...unproject(center.x - dx / TILE, center.y - dy / TILE, view.zoom) };
}

function pointerDistance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function fit(pins: Array<{ lat: number; lng: number }>, width: number, height: number): MapView {
  if (!pins.length) return { ...PONDICHERRY, zoom: 13 };
  const lats = pins.map((p) => p.lat);
  const lngs = pins.map((p) => p.lng);
  const mid = {
    lat: (Math.min(...lats) + Math.max(...lats)) / 2,
    lng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
  };
  for (let zoom = 16; zoom >= MIN_ZOOM; zoom--) {
    const a = project(Math.min(...lats), Math.min(...lngs), zoom);
    const b = project(Math.max(...lats), Math.max(...lngs), zoom);
    const w = Math.abs(b.x - a.x) * TILE;
    const h = Math.abs(b.y - a.y) * TILE;
    if (w < width - 80 && h < height - 80) return { ...mid, zoom };
  }
  return { ...mid, zoom: MIN_ZOOM };
}

export function ListingMap(props: ListingMapProps) {
  const [engine, setEngine] = useState<"pending" | "google" | "osm">("pending");
  useEffect(() => {
    let cancelled = false;
    void loadGoogleMaps().then((ok) => {
      if (!cancelled) setEngine(ok ? "google" : "osm");
    });
    return () => {
      cancelled = true;
    };
  }, []);
  if (engine === "google") return <GoogleListingMap {...props} />;
  if (engine === "osm") return <OsmListingMap {...props} />;
  return (
    <div
      className={cn(
        "relative h-[22rem] overflow-hidden rounded-2xl bg-muted ring-1 ring-border sm:h-[28rem]",
        props.className,
      )}
      aria-busy="true"
      aria-label="Loading map"
    >
      <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">Loading map…</p>
    </div>
  );
}

function OsmListingMap({ listings, selected, onSelect, className }: ListingMapProps) {
  const root = useRef<HTMLDivElement>(null);
  const dark = useTheme((s) => s.mode) !== "light";
  const [size, setSize] = useState({ w: 640, h: 420 });
  const pinNumbers = useMemo(() => listingPinNumbers(listings), [listings]);
  const pins = useMemo(
    () => listings.filter((l) => Number.isFinite(l.lat) && Number.isFinite(l.lng)) as Array<Listing & { lat: number; lng: number }>,
    [listings],
  );
  const you = useGeo((s) => (s.source === "gps" ? s.origin : null));
  const locate = useGeo((s) => s.locate);
  const geoStatus = useGeo((s) => s.status);
  const fitted = useMemo(
    () => fit(you ? [...pins, you] : pins, size.w, size.h),
    [pins, size.w, size.h, you?.lat, you?.lng],
  );
  const [view, setView] = useState(fitted);
  const viewRef = useRef(view);
  viewRef.current = view;
  const sizeRef = useRef(size);
  sizeRef.current = size;
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; view: MapView; x: number; y: number } | null>(null);
  const userView = useRef(false);
  const prevPinCount = useRef(-1);
  const active = pins.find((l) => l.slug === selected);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      setSize({ w: Math.max(1, rect.width), h: Math.max(1, rect.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (size.w < 80) return;
    if (prevPinCount.current !== pins.length) {
      prevPinCount.current = pins.length;
      userView.current = false;
    }
    if (userView.current) return;
    setView(fitted);
  }, [fitted, pins.length, size.w]);

  useEffect(() => {
    if (!active) return;
    setView((v) => {
      const p = project(active.lat, active.lng, v.zoom);
      const shifted = unproject(p.x, p.y + (sizeRef.current.h * 0.22) / TILE, v.zoom);
      return { lat: shifted.lat, lng: shifted.lng, zoom: v.zoom };
    });
  }, [active?.slug]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      userView.current = true;
      const rect = el.getBoundingClientRect();
      const factor = e.ctrlKey || e.metaKey ? 0.012 : 0.003;
      setView((v) =>
        zoomAround(v, v.zoom - e.deltaY * factor, e.clientX - rect.left, e.clientY - rect.top, sizeRef.current),
      );
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const tileZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.floor(view.zoom)));
  const tileScale = 2 ** (view.zoom - tileZoom);

  const tiles = useMemo(() => {
    const center = project(view.lat, view.lng, tileZoom);
    const originX = center.x * TILE - size.w / 2;
    const originY = center.y * TILE - size.h / 2;
    const minX = Math.floor(originX / TILE) - 1;
    const minY = Math.floor(originY / TILE) - 1;
    const maxX = Math.floor((originX + size.w) / TILE) + 1;
    const maxY = Math.floor((originY + size.h) / TILE) + 1;
    const n = 2 ** tileZoom;
    const out: Array<{ key: string; x: number; y: number; left: number; top: number }> = [];
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const tx = ((x % n) + n) % n;
        if (y < 0 || y >= n) continue;
        out.push({
          key: `${tileZoom}-${tx}-${y}`,
          x: tx,
          y,
          left: x * TILE - originX,
          top: y * TILE - originY,
        });
      }
    }
    return { originX, originY, items: out };
  }, [view.lat, view.lng, tileZoom, size]);

  function bumpZoom(delta: number) {
    userView.current = true;
    setView((v) => zoomAround(v, v.zoom + delta, size.w / 2, size.h / 2, size));
  }

  function localPoint(e: { clientX?: number; clientY?: number; x?: number; y?: number }) {
    const rect = root.current?.getBoundingClientRect();
    const clientX = e.clientX ?? e.x ?? 0;
    const clientY = e.clientY ?? e.y ?? 0;
    if (!rect) return { x: size.w / 2, y: size.h / 2 };
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  return (
    <div
      ref={root}
      className={cn(
        "relative h-[22rem] touch-none overflow-hidden rounded-2xl bg-muted ring-1 ring-border sm:h-[28rem]",
        className,
      )}
      style={{ touchAction: "none" }}
      onPointerDown={(e) => {
        if (e.pointerType === "mouse") {
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            /* ignore */
          }
        }
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pointers.current.size >= 2) {
          const pts = [...pointers.current.values()];
          const dist = pointerDistance(pts[0], pts[1]);
          const a = localPoint(pts[0]);
          const b = localPoint(pts[1]);
          pinch.current = {
            dist,
            view: viewRef.current,
            x: (a.x + b.x) / 2,
            y: (a.y + b.y) / 2,
          };
          drag.current = null;
          return;
        }
        drag.current = { x: e.clientX, y: e.clientY, moved: false };
      }}
      onPointerMove={(e) => {
        if (!pointers.current.has(e.pointerId) && !drag.current) return;
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pinch.current && pointers.current.size >= 2) {
          const pts = [...pointers.current.values()];
          const dist = pointerDistance(pts[0], pts[1]);
          const a = localPoint(pts[0]);
          const b = localPoint(pts[1]);
          const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
          userView.current = true;
          const zoomed = zoomAround(
            pinch.current.view,
            pinch.current.view.zoom + Math.log2(dist / pinch.current.dist),
            pinch.current.x,
            pinch.current.y,
            sizeRef.current,
          );
          setView(panView(zoomed, mid.x - pinch.current.x, mid.y - pinch.current.y));
          return;
        }
        if (!drag.current) return;
        const dx = e.clientX - drag.current.x;
        const dy = e.clientY - drag.current.y;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) drag.current.moved = true;
        drag.current = { x: e.clientX, y: e.clientY, moved: drag.current.moved };
        if (drag.current.moved) userView.current = true;
        setView((v) => panView(v, dx, dy));
      }}
      onPointerUp={(e) => {
        pointers.current.delete(e.pointerId);
        if (pointers.current.size < 2) pinch.current = null;
        if (pointers.current.size === 1) {
          const leftover = [...pointers.current.values()][0];
          drag.current = { x: leftover.x, y: leftover.y, moved: true };
        } else if (pointers.current.size === 0) {
          if (drag.current && !drag.current.moved) onSelect(undefined);
          drag.current = null;
        }
      }}
      onPointerCancel={(e) => {
        pointers.current.delete(e.pointerId);
        pinch.current = null;
        drag.current = null;
      }}
      onDoubleClick={(e) => {
        userView.current = true;
        const pt = localPoint(e);
        setView((v) => zoomAround(v, v.zoom + 1, pt.x, pt.y, size));
      }}
    >
      <button
        type="button"
        onClick={locate}
        disabled={geoStatus === "asking"}
        className="absolute left-3 top-3 z-40 flex size-10 items-center justify-center rounded-xl bg-card/95 text-foreground shadow-soft ring-1 ring-border backdrop-blur-sm hover:bg-muted disabled:opacity-60"
        aria-label="Find my location"
        title="Find my location"
      >
        <LocateFixed className={cn("size-5", geoStatus === "asking" && "animate-pulse")} />
      </button>

      <div
        className="absolute inset-0 origin-center"
        style={{ transform: tileScale === 1 ? undefined : `scale(${tileScale})` }}
      >
        {tiles.items.map((tile) => (
          <img
            key={tile.key}
            alt=""
            draggable={false}
            src={
              `https://tile.openstreetmap.org/${tileZoom}/${tile.x}/${tile.y}.png`
            }
            className="pointer-events-none absolute size-[256px] max-w-none select-none outline-none"
            style={{ left: tile.left, top: tile.top }}
          />
        ))}
      </div>

      {pins.map((listing) => {
        const p = project(listing.lat, listing.lng, view.zoom);
        const center = project(view.lat, view.lng, view.zoom);
        const left = p.x * TILE - (center.x * TILE - size.w / 2);
        const top = p.y * TILE - (center.y * TILE - size.h / 2);
        const isActive = selected === listing.slug;
        const open = listingIsOpen(listing);
        const n = pinNumbers.get(listing.slug) ?? 0;
        return (
          <button
            key={listing.slug}
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(listing.slug);
            }}
            className={cn(
              "absolute z-10 flex size-8 -translate-x-1/2 -translate-y-full items-center justify-center rounded-full text-[11px] font-bold tabular-nums shadow-[0_2px_8px_rgba(0,0,0,0.55)] ring-2 ring-white transition-transform",
              isActive ? "z-20 scale-110 bg-amber-400 text-zinc-900" : "bg-cyan-400 text-zinc-900",
              open === false && !isActive && "opacity-80",
            )}
            style={{ left, top }}
            title={listing.name}
            aria-label={`${n}. ${listing.name}`}
          >
            {n}
          </button>
        );
      })}

      {you && (() => {
        const p = project(you.lat, you.lng, view.zoom);
        const center = project(view.lat, view.lng, view.zoom);
        const left = p.x * TILE - (center.x * TILE - size.w / 2);
        const top = p.y * TILE - (center.y * TILE - size.h / 2);
        return (
          <div
            className="absolute z-20 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-4 ring-primary/30"
            style={{ left, top }}
            title="You"
            aria-label="Your location"
          />
        );
      })()}

      {active && (
        <div
          className="absolute inset-x-3 bottom-8 z-30"
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <ListingCard listing={active} layout="row" active pin={pinNumbers.get(active.slug)} />
        </div>
      )}

      <div className="absolute right-3 top-3 z-40 flex flex-col overflow-hidden rounded-xl bg-card/95 shadow-soft ring-1 ring-border">
        <button
          type="button"
          className="flex size-10 items-center justify-center text-lg leading-none hover:bg-muted disabled:opacity-40"
          disabled={view.zoom >= MAX_ZOOM - 0.05}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            bumpZoom(1);
          }}
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          type="button"
          className="flex size-10 items-center justify-center text-lg leading-none hover:bg-muted disabled:opacity-40"
          disabled={view.zoom <= MIN_ZOOM + 0.05}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            bumpZoom(-1);
          }}
          aria-label="Zoom out"
        >
          −
        </button>
      </div>
      <p className="absolute bottom-2 left-3 z-20 rounded-md bg-card/90 px-2 py-0.5 text-[10px] text-muted-foreground">
        © OpenStreetMap contributors
      </p>
      {pins.length === 0 && (
        <p className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 text-sm text-muted-foreground">
          No mapped listings in this set yet.
        </p>
      )}
    </div>
  );
}
