import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BedDouble,
  Beer,
  Bike,
  Camera,
  Clock3,
  Coffee,
  Compass,
  Hourglass,
  Landmark,
  MapPinned,
  Mountain,
  Search,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Umbrella,
  UtensilsCrossed,
  Wine,
  type LucideIcon,
} from "lucide-react";
import { ListingCard } from "@/components/listing-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { events } from "@/data/events";
import { CATEGORY_META, type Category } from "@/lib/types";
import { cn } from "@/lib/utils";
import { catalogFeatured, useCatalog } from "@/store/catalog";
import { useSession } from "@/store/session";

export const Route = createFileRoute("/")({ component: Home });

const PILLARS = [
  {
    icon: BadgeCheck,
    title: "Verified experts",
    body: "Trusted local agents, not a random WhatsApp list.",
  },
  {
    icon: Sparkles,
    title: "100% custom",
    body: "Tailor the days, the pace, the food, the quiet.",
  },
  {
    icon: Clock3,
    title: "24×7 assistance",
    body: "Someone to call when a ferry is full or a tide turns.",
  },
  {
    icon: MapPinned,
    title: "Built for Pondy",
    body: "White Town to Auroville, mapped the way locals move.",
  },
];

const TILE_TONES = ["text-coral", "text-lagoon", "text-sea", "text-mango", "text-leaf"] as const;

const QUICK_TILES: Array<{
  label: string;
  cat: Category;
  icon: LucideIcon;
  slug?: string;
  tone: (typeof TILE_TONES)[number];
}> = [
  { label: "Activities", cat: "activities", icon: Hourglass, tone: "text-coral" },
  { label: "Beaches", slug: "beaches", cat: "places", icon: Umbrella, tone: "text-sea" },
  { label: "Bike Rental", slug: "bike-rental", cat: "activities", icon: Bike, tone: "text-lagoon" },
  { label: "Cafe", slug: "cafes", cat: "food", icon: Coffee, tone: "text-mango" },
  { label: "Spiritual", slug: "spiritual-places", cat: "places", icon: Landmark, tone: "text-leaf" },
  { label: "Hotels", slug: "hotels", cat: "stay", icon: BedDouble, tone: "text-coral" },
  { label: "Restaurants", slug: "restaurants", cat: "food", icon: UtensilsCrossed, tone: "text-lagoon" },
  { label: "Nightlife", slug: "nightlife-experiences", cat: "activities", icon: Wine, tone: "text-sea" },
  { label: "Shopping", slug: "shopping-bazaars", cat: "activities", icon: ShoppingBag, tone: "text-mango" },
  { label: "Attractions", cat: "places", icon: Camera, tone: "text-leaf" },
  { label: "Adventure", slug: "adventure-sports", cat: "activities", icon: Mountain, tone: "text-coral" },
  { label: "Resto Pubs", slug: "resto-pubs", cat: "food", icon: Beer, tone: "text-mango" },
];

const THEMES = [
  { label: "French heritage", q: "heritage", image: "/images/french-quarter.jpg" },
  { label: "Beaches", q: "beach", image: "/images/beach.jpg" },
  { label: "Spiritual", q: "spiritual", image: "/images/matrimandir.jpg" },
  { label: "Cafés", q: "café", image: "/images/cafe.jpg" },
  { label: "Nightlife", q: "nightlife", image: "/images/nightlife.jpg" },
  { label: "Adventure", q: "scuba", image: "/images/scuba.jpg" },
];

function HomePhotoLink({
  image,
  kicker,
  label,
  search,
  className,
}: {
  image: string;
  kicker?: string;
  label: string;
  search: { cat: string; q: string };
  className?: string;
}) {
  return (
    <Link
      to="/explore"
      search={search}
      className={cn(
        "group relative flex overflow-hidden rounded-2xl ring-1 ring-border/60",
        className,
      )}
    >
      <img
        src={image}
        alt=""
        className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-overlay via-overlay/60 to-overlay/15" />
      <div className="relative mt-auto w-full p-3 sm:p-3.5">
        {kicker ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-hero/80">{kicker}</p>
        ) : null}
        <p className="font-display text-[15px] font-semibold leading-snug text-hero sm:text-base">{label}</p>
      </div>
    </Link>
  );
}

function Home() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const items = useCatalog((s) => s.items);
  const source = useCatalog((s) => s.source);
  const total = useCatalog((s) => s.total);
  const liveGuides = useCatalog((s) => s.guides);
  const user = useSession((s) => s.user);
  const featured = catalogFeatured(items);
  const homeGuides = liveGuides.slice(0, 3);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    void navigate({ to: "/explore", search: { q: q.trim(), cat: "all" } });
  }

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-2xl">
        <img
          src="/images/promenade.jpg"
          alt=""
          className="absolute inset-0 size-full object-cover object-[center_35%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-overlay via-overlay/80 to-overlay/45" />
        <div className="relative flex flex-col gap-3 px-4 py-5 sm:gap-4 sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-hero/75 sm:text-[11px]">
            Pondicherry travel planner
          </p>
          <h1 className="max-w-xl font-display text-[1.65rem] font-semibold leading-[1.15] text-hero sm:text-4xl">
            Explore Puducherry like never before
          </h1>
          <p className="max-w-lg text-xs leading-relaxed text-hero/90 sm:text-sm">
            Places, cafés, stays, and a trip you can actually follow — live from xplorepondy.com.
            {source === "live" ? ` ${total.toLocaleString()} listings in the directory.` : ""}
            {user ? ` Signed in as ${user.name}.` : ""}
          </p>
          <form onSubmit={onSearch} className="flex max-w-lg flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Beaches, bakeries, Auroville…"
                className="h-11 border-0 bg-card pl-10 text-foreground"
                aria-label="Search Pondicherry"
              />
            </div>
            <Button type="submit" size="lg" className="h-11 sm:w-auto">
              Search
            </Button>
          </form>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link
              to="/get-app"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-hero/90 hover:text-hero sm:text-sm"
            >
              <Smartphone className="size-4" />
              Get the Android app
            </Link>
            <Link to="/trip" className="inline-flex items-center gap-1.5 text-xs font-medium text-hero/90 hover:text-hero sm:text-sm">
              <Compass className="size-4" />
              Open my itinerary
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-4 gap-1.5 sm:gap-2 md:grid-cols-6 md:gap-3">
        {QUICK_TILES.map((tile) => (
          <Link
            key={tile.label}
            to="/explore"
            search={{ cat: tile.cat, q: "", ...(tile.slug ? { type: tile.slug } : {}) }}
            className="flex flex-col items-center justify-center gap-1 rounded-sm bg-hero px-1 py-2.5 text-overlay shadow-soft ring-1 ring-overlay/10 transition-transform duration-150 hover:-translate-y-0.5 sm:px-2 sm:py-3"
          >
            <tile.icon className={cn("size-5 sm:size-6", tile.tone)} strokeWidth={1.85} />
            <span className="text-center text-[10px] font-semibold leading-tight sm:text-xs">{tile.label}</span>
          </Link>
        ))}
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Explore</p>
            <h2 className="mt-0.5 font-display text-xl font-semibold">Find Pondy your way</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {(Object.keys(CATEGORY_META) as Category[]).map((key) => {
            const meta = CATEGORY_META[key];
            return (
              <HomePhotoLink
                key={key}
                search={{ cat: key, q: "" }}
                image={meta.image}
                kicker={meta.kicker}
                label={meta.label}
                className="min-h-[9.5rem] sm:min-h-[11rem]"
              />
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {PILLARS.map((p) => (
          <div key={p.title} className="flex gap-2.5 rounded-xl bg-card p-3 ring-1 ring-border/70">
            <p.icon className="mt-0.5 size-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <h3 className="font-display text-sm font-semibold leading-snug">{p.title}</h3>
              <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{p.body}</p>
            </div>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Handpicked</p>
            <h2 className="mt-0.5 font-display text-xl font-semibold">Do not miss these</h2>
          </div>
          <Link to="/explore" className="flex items-center gap-1 text-sm font-medium text-primary">
            View all <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {featured.map((l) => (
            <ListingCard key={l.slug} listing={l} layout="compact" />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">By mood</p>
          <h2 className="mt-0.5 font-display text-xl font-semibold">Explore by theme</h2>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {THEMES.map((t) => (
            <HomePhotoLink
              key={t.label}
              search={{ q: t.q, cat: "all" }}
              image={t.image}
              label={t.label}
              className="min-h-[7.5rem] sm:min-h-[8.5rem]"
            />
          ))}
        </div>
      </section>

      <div className="grid gap-7 lg:grid-cols-2">
        <section>
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Guides</p>
              <h2 className="mt-0.5 font-display text-xl font-semibold">Read before you ride</h2>
            </div>
            <Link to="/guides" className="flex items-center gap-1 text-sm font-medium text-primary">
              All <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {homeGuides.map((g) => (
              <Link
                key={g.slug}
                to="/guides/$slug"
                params={{ slug: g.slug }}
                className="flex gap-3 overflow-hidden rounded-xl bg-card p-2 ring-1 ring-border/70"
              >
                <img src={g.image} alt="" className="size-20 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 py-0.5">
                  <p className="text-[11px] text-muted-foreground">
                    {g.topic} · {g.readTime} read
                  </p>
                  <h3 className="font-display text-sm font-semibold leading-snug">{g.title}</h3>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{g.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Now</p>
              <h2 className="mt-0.5 font-display text-xl font-semibold">What’s on</h2>
            </div>
            <Link to="/events" className="flex items-center gap-1 text-sm font-medium text-primary">
              All <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {events.slice(0, 4).map((ev) => (
              <Link
                key={ev.slug}
                to="/events"
                className="flex gap-3 overflow-hidden rounded-xl bg-card p-2 ring-1 ring-border/70"
              >
                <img src={ev.image} alt="" className="size-16 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 py-0.5">
                  <p className="text-[11px] font-medium text-primary">{ev.dateLabel}</p>
                  <h3 className="font-display text-sm font-semibold leading-snug">{ev.title}</h3>
                  <p className="text-xs text-muted-foreground">{ev.place}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl bg-primary px-5 py-6 text-primary-foreground sm:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-lg">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground/70">
              Custom trips
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold leading-snug">
              Tell us how you travel. We’ll shape Pondy around it.
            </h2>
            <p className="mt-2 text-sm text-primary-foreground/80">
              Verified agents, 100% custom itineraries, assistance around the clock — the same promise as
              xplorepondy.com, now in your pocket.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Button asChild variant="secondary" className="bg-card text-foreground hover:bg-card/90">
              <Link to="/plan">
                <Compass />
                Plan a custom trip
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link to="/trip">Open my itinerary</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
