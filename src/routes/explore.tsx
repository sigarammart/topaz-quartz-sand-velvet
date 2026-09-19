import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { ListingCard } from "@/components/listing-card";
import { Input } from "@/components/ui/input";
import { CATEGORIES, CATEGORY_META, type Category } from "@/lib/types";
import { cn } from "@/lib/utils";
import { catalogSearch, useCatalog } from "@/store/catalog";

type ExploreSearch = {
  q?: string;
  cat?: string;
};

export const Route = createFileRoute("/explore")({
  validateSearch: (search: Record<string, unknown>): ExploreSearch => ({
    q: typeof search.q === "string" ? search.q : "",
    cat: typeof search.cat === "string" ? search.cat : "all",
  }),
  component: Explore,
});

function isCategory(v: string | undefined): v is Category {
  return !!v && (CATEGORIES as readonly string[]).includes(v);
}

function Explore() {
  const { q = "", cat = "all" } = Route.useSearch();
  const navigate = Route.useNavigate();
  const items = useCatalog((s) => s.items);
  const source = useCatalog((s) => s.source);
  const status = useCatalog((s) => s.status);
  const total = useCatalog((s) => s.total);
  const category: Category | "all" = isCategory(cat) ? cat : "all";
  const results = catalogSearch(items, q, category);
  const meta = isCategory(category) ? CATEGORY_META[category] : null;

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Explore</p>
      <h1 className="mt-1 font-display text-3xl font-semibold">
        {meta ? meta.label : "All of Pondy"}
      </h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        {meta
          ? meta.description
          : "Beaches, the French Quarter, dives, bakeries, pubs, and a bed for the night."}
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        {status === "loading"
          ? "Refreshing from xplorepondy.com…"
          : source === "live"
            ? `Live from xplorepondy.com · ${total.toLocaleString()} listings`
            : status === "offline"
              ? "WordPress unreachable · showing the curated set"
              : "Loading the directory…"}
      </p>

      <div className="relative mt-6">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) =>
            void navigate({
              search: (prev) => ({ ...prev, q: e.target.value }),
            })
          }
          placeholder="Search places, food, stays…"
          className="h-12 pl-10"
          aria-label="Filter listings"
        />
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {(["all", ...CATEGORIES] as const).map((key) => {
          const label = key === "all" ? "All" : CATEGORY_META[key].label;
          const active = category === key || (key === "all" && !isCategory(cat));
          return (
            <button
              key={key}
              type="button"
              onClick={() => void navigate({ search: (prev) => ({ ...prev, cat: key }) })}
              className={cn(
                "h-10 shrink-0 rounded-full px-4 text-sm font-medium ring-1 ring-border transition-colors",
                active
                  ? "bg-primary text-primary-foreground ring-primary"
                  : "bg-card text-foreground hover:bg-muted",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      <p className="mt-5 text-sm text-muted-foreground tabular-nums">
        {results.length} {results.length === 1 ? "place" : "places"}
      </p>

      {results.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          {status === "loading"
            ? "Fetching listings…"
            : "Nothing matches. Try a broader word — beach, café, temple."}
        </p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((l) => (
            <ListingCard key={l.slug} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
