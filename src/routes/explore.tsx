import { createFileRoute } from "@tanstack/react-router";
import { LayoutGrid, LayoutList, LocateFixed, Map as MapIcon, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ListingCard } from "@/components/listing-card";
import { ListingMap } from "@/components/listing-map";
import { SmartFiltersBar } from "@/components/smart-filters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { emptyFilterSearch, filtersFromSearch, type FilterParam } from "@/lib/filters";
import type { LatLng } from "@/lib/geo";
import { listingPinNumbers } from "@/lib/pins";
import { listingIsOpen } from "@/lib/hours";
import { CATEGORIES, CATEGORY_META, type Category } from "@/lib/types";
import { cn } from "@/lib/utils";
import { catalogSearch, sortListings, useCatalog } from "@/store/catalog";
import { useGeo } from "@/store/geo";

type ArchiveView = "list" | "grid" | "map";

type ExploreSearch = {
  q?: string;
  cat?: string;
  view?: ArchiveView;
  here?: string;
} & Partial<Record<FilterParam, string>>;

const PAGE_SIZE = 24;
const SERVICES_CATEGORY_URL = "https://xplorepondy.com/listing-category/services/";

function parseView(value: unknown): ArchiveView | undefined {
  if (value === "list" || value === "grid" || value === "map") return value;
  return undefined;
}

function parseHere(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const [lat, lng] = value.split(",").map(Number);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return undefined;
  return `${lat},${lng}`;
}

function hereToLatLng(value?: string): LatLng | null {
  if (!value) return null;
  const [lat, lng] = value.split(",").map(Number);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

export const Route = createFileRoute("/explore")({
  validateSearch: (search: Record<string, unknown>): ExploreSearch => {
    const next: ExploreSearch = {
      q: typeof search.q === "string" ? search.q : "",
      cat: typeof search.cat === "string" ? search.cat : "all",
      view: parseView(search.view),
      here: parseHere(search.here),
    };
    for (const key of Object.keys(emptyFilterSearch()) as FilterParam[]) {
      if (typeof search[key] === "string" && search[key]) next[key] = search[key] as string;
    }
    return next;
  },
  component: Explore,
});

function isCategory(v: string | undefined): v is Category {
  return !!v && (CATEGORIES as readonly string[]).includes(v);
}

function Explore() {
  const search = Route.useSearch();
  const { q = "", cat = "all" } = search;
  const navigate = Route.useNavigate();
  const items = useCatalog((s) => s.items);
  const source = useCatalog((s) => s.source);
  const status = useCatalog((s) => s.status);
  const total = useCatalog((s) => s.total);
  const category: Category | "all" = isCategory(cat) ? cat : "all";
  const filters = useMemo(() => filtersFromSearch(search), [search]);
  const origin = useGeo((s) => s.origin);
  const geoStatus = useGeo((s) => s.status);
  const nearMe = useGeo((s) => s.nearMe);
  const locate = useGeo((s) => s.locate);
  const clearGeo = useGeo((s) => s.clear);
  const scoped = useMemo(
    () => items.filter((l) => (category === "all" ? true : l.category === category)),
    [items, category],
  );
  const results = useMemo(() => {
    const rows = catalogSearch(items, q, category, filters);
    if (q.trim()) return rows;
    return sortListings(rows, { origin, nearMe });
  }, [items, q, category, filters, origin, nearMe]);

  // Use the same live hours logic as the Open Now filter and listing badges.
  const openNowCount = useMemo(() => {
    const countFilters = { ...filters };
    delete countFilters.open;
    const candidates = catalogSearch(items, q, category, countFilters);
    return candidates.filter((listing) => listingIsOpen(listing) === true).length;
  }, [items, q, category, filters]);
  const meta = isCategory(category) ? CATEGORY_META[category] : null;
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<string | undefined>();
  const view: ArchiveView = search.view ?? "list";
  const hoverLock = useRef(0);

  useEffect(() => {
    const fromUrl = hereToLatLng(search.here);
    if (fromUrl) useGeo.setState({ origin: fromUrl, source: "gps", status: "ready", nearMe: true });
  }, [search.here]);

  const shown = view === "map" ? results : results.slice(0, visible);
  const mappedCount = results.filter((l) => l.lat != null && l.lng != null).length;
  const pinNumbers = useMemo(() => listingPinNumbers(results), [results]);
  const mapList = useMemo(() => {
    const rows = results.filter((l) => l.lat != null && l.lng != null);
    if (selected && !rows.slice(0, 80).some((l) => l.slug === selected)) {
      const extra = rows.find((l) => l.slug === selected);
      return extra ? [extra, ...rows.slice(0, 79)] : rows.slice(0, 80);
    }
    return rows.slice(0, 80);
  }, [results, selected]);

  useEffect(() => {
    setVisible(PAGE_SIZE);
    setSelected(undefined);
  }, [q, category, items.length, search.type, search.feat, search.amen, search.area, search.theme, search.open]);

  useEffect(() => {
    if (!selected) return;
    hoverLock.current = Date.now();
    const el = document.getElementById(`listing-card-${selected}`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selected]);

  function setView(next: ArchiveView) {
    void navigate({
      search: (prev) => ({ ...prev, view: next === "list" ? undefined : next }),
    });
  }

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Explore</p>
      <h1 className="mt-0.5 font-display text-2xl font-semibold">
        {meta ? meta.label : "All of Pondy"}
      </h1>
      <p className="mt-1 max-w-xl text-sm text-muted-foreground">
        {meta
          ? meta.description
          : "Beaches, the French Quarter, dives, bakeries, pubs, and a bed for the night."}
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        {source === "live" && items.length > 80
          ? `Live from xplorepondy.com · ${Math.max(total, items.length).toLocaleString()} listings`
          : status === "loading"
            ? "Refreshing from xplorepondy.com…"
            : status === "offline"
              ? "WordPress unreachable · showing the curated set"
              : "Loading the directory…"}
      </p>

      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) =>
            void navigate({
              search: (prev) => ({ ...prev, q: e.target.value }),
            })
          }
          placeholder="Search places, food, stays…"
          className="h-10 pl-10"
          aria-label="Filter listings"
        />
      </div>

      <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
        {(["all", ...CATEGORIES] as const).map((key) => {
          const label = key === "all" ? "All" : CATEGORY_META[key].label;
          const active = category === key || (key === "all" && !isCategory(cat));
          return (
            <button
              key={key}
              type="button"
              onClick={() =>
                void navigate({
                  search: (prev) => ({ ...prev, ...emptyFilterSearch(), cat: key }),
                })
              }
              className={cn(
                "h-8 shrink-0 rounded-full px-3 text-xs font-medium ring-1 ring-border transition-colors",
                active
                  ? "bg-primary text-primary-foreground ring-primary"
                  : "bg-card text-foreground hover:bg-muted",
              )}
            >
              {label}
            </button>
          );
        })}
        <a
          href={SERVICES_CATEGORY_URL}
          className="h-8 shrink-0 rounded-full bg-card px-3 text-xs font-medium text-foreground ring-1 ring-border transition-colors hover:bg-muted"
        >
          Services
        </a>
      </div>

      <SmartFiltersBar
        items={scoped}
        category={category}
        filters={filters}
        openNowCount={openNowCount}
        onChange={(patch) =>
          void navigate({
            search: (prev) => ({ ...prev, ...patch }),
          })
        }
      />

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground tabular-nums">
          {results.length} {results.length === 1 ? "place" : "places"}
          {nearMe ? " · nearest first" : " · featured first"}
          {view === "map" && mappedCount > 0 ? ` · ${mappedCount} on the map` : ""}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => (nearMe ? clearGeo() : locate(true))}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs ring-1 transition-colors",
              nearMe
                ? "bg-primary text-primary-foreground ring-primary"
                : "bg-card text-foreground ring-border hover:bg-muted",
            )}
          >
            <LocateFixed className="size-4" />
            <span>
              {geoStatus === "asking" && nearMe ? "Locating…" : "Near me"}
            </span>
          </button>
          <div className="flex overflow-hidden rounded-full ring-1 ring-border">
            {(
              [
                ["list", LayoutList, "List"],
                ["grid", LayoutGrid, "Grid"],
              ] as const
            ).map(([key, Icon, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setView(key)}
                className={cn(
                  "flex h-8 items-center gap-1.5 px-2.5 text-xs transition-colors",
                  view === key ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground",
                )}
                aria-pressed={view === key}
                aria-label={label}
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {results.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          {status === "loading"
            ? "Fetching listings…"
            : "Nothing matches. Clear a filter or try a broader word."}
        </p>
      ) : view === "map" ? (
        <div className="fixed inset-0 z-[80] bg-background">
          <ListingMap
            listings={results}
            selected={selected}
            onSelect={setSelected}
            className="!h-full rounded-none ring-0"
          />
          <div className="absolute left-1/2 top-4 z-[100] flex -translate-x-1/2 items-center gap-2">
            <button
              type="button"
              onClick={() => setView("list")}
              className="flex h-10 items-center gap-2 rounded-full bg-card/95 px-4 text-xs font-semibold text-foreground shadow-soft ring-1 ring-border backdrop-blur-sm"
              aria-label="Close map"
            >
              <X className="size-4" />
              <span>Close map</span>
            </button>
          </div>
        </div>
      ) : view === "grid" ? (
        <>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {shown.map((l) => (
              <ListingCard key={l.slug} listing={l} layout="grid" pin={pinNumbers.get(l.slug)} />
            ))}
          </div>
          {visible < results.length && (
            <div className="mt-8 flex justify-center">
              <Button variant="outline" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                Load more · {results.length - visible} left
              </Button>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="mt-4 flex flex-col gap-3">
            {shown.map((l) => (
              <ListingCard key={l.slug} listing={l} layout="row" pin={pinNumbers.get(l.slug)} />
            ))}
          </div>
          {visible < results.length && (
            <div className="mt-8 flex justify-center">
              <Button variant="outline" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                Load more · {results.length - visible} left
              </Button>
            </div>
          )}
        </>
      )}

      {view !== "map" && (
        <button
          type="button"
          onClick={() => setView("map")}
          className="fixed bottom-20 left-1/2 z-[70] flex h-11 -translate-x-1/2 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg ring-1 ring-primary/40 sm:bottom-6"
          aria-label="Open map"
        >
          <MapIcon className="size-4" />
          <span>View map</span>
        </button>
      )}
    </div>
  );
}
