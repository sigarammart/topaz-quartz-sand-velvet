import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, GripVertical, Sparkles, Star, Wand2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ListingMap } from "@/components/listing-map";
import { TripFormWizard } from "@/components/trip-form-wizard";
import { AddDayModal, useAddDayModal } from "@/components/add-day-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WP_ORIGIN } from "@/lib/wp-api";
import {
  formatTripDates,
  interestLabel,
  listingMatchesInterest,
  travelLeg,
  TRIP_BUDGETS,
  TRIP_LOCATIONS,
  TRIP_TYPES,
} from "@/lib/trip-form";
import { buildTripItinerary, travelLabel } from "@/lib/itinerary";
import { ANNA_SALAI } from "@/lib/geo";
import { useGeo } from "@/store/geo";
import { resolveListing, useCatalog } from "@/store/catalog";
import { useHydrated } from "@/lib/use-hydrated";
import { useTrip } from "@/store/trip";

export const Route = createFileRoute("/trip")({ component: TripPage });

function TripPage() {
  const hydrated = useHydrated();
  const catalog = useCatalog((s) => s.items);
  const started = useTrip((s) => s.started);
  const title = useTrip((s) => s.title);
  const code = useTrip((s) => s.code);
  const days = useTrip((s) => s.days);
  const locations = useTrip((s) => s.locations);
  const budget = useTrip((s) => s.budget);
  const tripType = useTrip((s) => s.tripType);
  const start = useTrip((s) => s.start);
  const end = useTrip((s) => s.end);
  const interests = useTrip((s) => s.interests);
  const items = useTrip((s) => s.items);
  const saved = useTrip((s) => s.saved);
  const wpUrl = useTrip((s) => s.wpUrl);
  const addToDay = useTrip((s) => s.addToDay);
  const removeItem = useTrip((s) => s.removeItem);
  const reorderDay = useTrip((s) => s.reorderDay);
  const itinerary = useTrip((s) => s.itinerary);
  const itineraryPolished = useTrip((s) => s.itineraryPolished);
  const setItinerary = useTrip((s) => s.setItinerary);
  const origin = useGeo((s) => s.origin) ?? ANNA_SALAI;
  const [busy, setBusy] = useState<"generate" | "ai" | null>(null);
  const [day, setDay] = useState(1);
  const [tab, setTab] = useState<"interests" | "saved" | "all">("interests");
  const [chip, setChip] = useState<string>(interests[0] ?? "");
  const [q, setQ] = useState("");
  const [selectedSlug, setSelectedSlug] = useState<string | undefined>();
  const [drag, setDrag] = useState<string | null>(null);
  const addDay = useAddDayModal();
  const seeded = useRef(false);

  useEffect(() => {
    if (seeded.current || !hydrated || items.length > 0 || catalog.length < 8 || interests.length === 0) return;
    const picks: { slug: string; day: number }[] = [];
    const used = new Set<string>();
    let d = 1;
    for (const slug of interests) {
      const matches = catalog.filter((l) => listingMatchesInterest(l, slug) && !used.has(l.slug)).slice(0, 2);
      for (const listing of matches) {
        used.add(listing.slug);
        picks.push({ slug: listing.slug, day: d });
        d = d >= days ? 1 : d + 1;
      }
    }
    if (picks.length) {
      seeded.current = true;
      useTrip.setState({ items: picks });
    }
  }, [hydrated, catalog.length, interests, items.length, days]);

  const interestChips = interests.length ? interests : ["cafes", "activities", "beaches"];
  const activeChip = chip || interestChips[0];

  const pool = useMemo(() => {
    let rows = catalog;
    if (tab === "saved") rows = catalog.filter((l) => saved.includes(l.slug));
    else if (tab === "interests") rows = catalog.filter((l) => listingMatchesInterest(l, activeChip));
    if (q.trim()) {
      const needle = q.toLowerCase();
      rows = rows.filter((l) => `${l.name} ${l.kind} ${l.location}`.toLowerCase().includes(needle));
    }
    return rows.slice(0, 24);
  }, [catalog, tab, saved, activeChip, q]);

  const dayItems = items.filter((i) => i.day === day);
  const dayListings = dayItems.map((i) => resolveListing(i.slug, catalog)).filter(Boolean);

  function runItinerary(polish: boolean) {
    const chosen = items
      .map((i) => resolveListing(i.slug, catalog))
      .filter((l): l is NonNullable<typeof l> => !!l);
    if (chosen.length === 0) {
      toast.error("Add listings first");
      return;
    }
    setBusy(polish ? "ai" : "generate");
    window.setTimeout(() => {
      const built = buildTripItinerary({
        items,
        listings: catalog,
        days,
        polish,
        origin,
        tripType,
        interests,
        locationLabel: locations.map((s) => TRIP_LOCATIONS.find((l) => l.slug === s)?.label ?? s).join(", ") || "Pondicherry",
      });
      setItinerary(built.days, built.items, polish);
      setBusy(null);
      toast.success(polish ? "AI itinerary ready" : "Itinerary created");
    }, 450);
  }

  if (!hydrated) return <p className="py-16 text-center text-sm text-muted-foreground">Loading trip…</p>;

  if (!started && items.length === 0) {
    return <TripFormWizard />;
  }

  const locationLabel = locations.map((s) => TRIP_LOCATIONS.find((l) => l.slug === s)?.label ?? s).join(", ");
  const budgetLabel = TRIP_BUDGETS.find((b) => b.slug === budget)?.label ?? budget;
  const typeLabel = TRIP_TYPES.find((t) => t.slug === tripType)?.label ?? tripType;
  const dateLabel = formatTripDates(start, end);

  return (
    <div className="-mx-4 px-3 lg:-mx-0">
      <section className="relative overflow-hidden rounded-2xl">
        <img src="/images/lighthouse.jpg" alt="" className="h-40 w-full object-cover sm:h-48" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <h1 className="font-display text-xl font-semibold leading-snug sm:text-2xl">{title}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <MetaChip label="Size" value={typeLabel} />
            <MetaChip label="Budget" value={budgetLabel} />
            {code ? <MetaChip label="Code" value={code} /> : null}
            <MetaChip label="Location" value={locationLabel || "Pondicherry"} />
          </div>
          {dateLabel ? <p className="mt-2 text-xs text-muted-foreground">Date: {dateLabel}</p> : null}
        </div>
      </section>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)_minmax(0,0.85fr)]">
        <section className="rounded-2xl bg-card p-3 ring-1 ring-border/70 sm:p-4">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["interests", "Chosen interests"],
                ["saved", "Saved"],
                ["all", "Categories"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={cn(
                  "h-9 rounded-full px-3 text-xs font-semibold ring-1",
                  tab === key ? "bg-primary text-primary-foreground ring-primary" : "bg-background ring-border",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          {tab === "interests" && (
            <div className="mt-3 flex flex-wrap gap-2">
              {interestChips.map((slug) => (
                <button
                  key={slug}
                  type="button"
                  onClick={() => setChip(slug)}
                  className={cn(
                    "h-8 rounded-full px-3 text-xs font-medium ring-1",
                    activeChip === slug ? "bg-accent text-accent-foreground ring-accent" : "ring-border",
                  )}
                >
                  {interestLabel(slug)}
                </button>
              ))}
            </div>
          )}
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search …" className="mt-3 h-10" />
          <div className="mt-3 grid grid-cols-2 gap-2">
            {pool.map((listing) => {
              const picked = items.find((i) => i.slug === listing.slug);
              return (
                <article key={listing.slug} className="overflow-hidden rounded-xl bg-background ring-1 ring-border/70">
                  <img src={listing.image} alt="" className="h-24 w-full object-cover" />
                  <div className="p-2">
                    <p className="line-clamp-2 text-xs font-semibold leading-snug">{listing.name}</p>
                    {listing.rating > 0 && (
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Star className="size-3 fill-primary text-primary" />
                        {listing.rating.toFixed(1)} ({listing.reviews.toLocaleString()})
                      </p>
                    )}
                    {picked ? (
                      <div className="mt-2 flex items-center gap-1">
                        <button
                          type="button"
                          className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground"
                          onClick={() => addDay.open({ slug: listing.slug, name: listing.name, currentDay: picked.day })}
                        >
                          Day {picked.day}
                        </button>
                        <button
                          type="button"
                          className="ml-auto text-[11px] font-medium text-destructive"
                          onClick={() => removeItem(listing.slug)}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        className="mt-2 h-8 w-full text-xs"
                        onClick={() => addDay.open({ slug: listing.slug, name: listing.name })}
                      >
                        + Add
                      </Button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
          {pool.length === 0 && <p className="mt-6 text-center text-sm text-muted-foreground">No listings in this set.</p>}
        </section>

        <section className="rounded-2xl bg-card p-3 ring-1 ring-border/70 sm:p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="font-display text-lg font-semibold">Your selected listings</h2>
              <p className="text-xs text-muted-foreground">Drag to reorder by preference</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            {Array.from({ length: days }, (_, i) => i + 1).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDay(d)}
                className={cn(
                  "h-9 rounded-full px-4 text-xs font-semibold",
                  day === d ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                Day {d}
              </button>
            ))}
          </div>
          <ol className="mt-4 space-y-2">
            {dayListings.map((listing, index) => {
              if (!listing) return null;
              const prev = dayListings[index - 1];
              const leg = index > 0 ? travelLeg(prev, listing) : null;
              return (
                <li key={listing.slug}>
                  {leg && (
                    <p className="mb-1 pl-10 text-[11px] text-muted-foreground">
                      {leg.minutes} min · {leg.km < 1 ? `${Math.round(leg.km * 1000)} m` : `${leg.km.toFixed(1)} km`}
                    </p>
                  )}
                  <div
                    draggable
                    onDragStart={() => setDrag(listing.slug)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (!drag || drag === listing.slug) return;
                      const slugs = dayItems.map((i) => i.slug);
                      const from = slugs.indexOf(drag);
                      const to = slugs.indexOf(listing.slug);
                      if (from < 0 || to < 0) return;
                      slugs.splice(from, 1);
                      slugs.splice(to, 0, drag);
                      reorderDay(day, slugs);
                      setDrag(null);
                    }}
                    className={cn(
                      "flex gap-3 rounded-xl bg-background p-2 ring-1",
                      selectedSlug === listing.slug ? "ring-primary" : "ring-border/70",
                    )}
                    onClick={() => setSelectedSlug(listing.slug)}
                  >
                    <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      {index + 1}
                    </span>
                    <img src={listing.image} alt="" className="size-14 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <p className="truncate text-sm font-semibold">{listing.name}</p>
                        <GripVertical className="ml-auto size-4 shrink-0 text-muted-foreground" />
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(listing.slug, day)}
                          aria-label={`Remove ${listing.name}`}
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                      <p className="text-[11px] uppercase tracking-wide text-primary">{listing.kind}</p>
                      {listing.rating > 0 && (
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {listing.rating.toFixed(1)} ({listing.reviews.toLocaleString()})
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
          {dayListings.length === 0 && (
            <p className="mt-8 text-center text-sm text-muted-foreground">Add listings from the left for Day {day}.</p>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/plan">Edit selection</Link>
            </Button>
            <Button size="sm" disabled={busy != null} onClick={() => runItinerary(false)}>
              <Wand2 className="size-3.5" />
              {busy === "generate" ? "Generating…" : itinerary ? "Regenerate itinerary" : "Generate itinerary"}
            </Button>
            <Button variant="secondary" size="sm" disabled={busy != null} onClick={() => runItinerary(true)}>
              <Sparkles className="size-3.5" />
              {busy === "ai" ? "Polishing…" : "AI generator"}
            </Button>
          </div>
          {busy && <p className="mt-3 text-sm text-muted-foreground">Generating itinerary… please wait.</p>}
          {itinerary && itinerary.length > 0 && (
            <div className="mt-5 rounded-xl bg-background p-3 ring-1 ring-border/70">
              <h3 className="font-display text-base font-semibold">
                Your itinerary{itineraryPolished ? " · AI" : ""}
              </h3>
              <p className="text-xs text-muted-foreground">Here is your day-by-day plan based on selected listings.</p>
              <div className="mt-3 space-y-4">
                {itinerary.map((block) => (
                  <section key={block.day}>
                    <p className="text-sm font-semibold">{block.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{block.intro}</p>
                    <ol className="mt-2 space-y-2">
                      {block.stops.map((stop) => {
                        const listing = resolveListing(stop.slug, catalog);
                        if (!listing) return null;
                        return (
                          <li key={`${block.day}-${stop.slug}`} className="rounded-lg bg-card px-3 py-2 ring-1 ring-border/60">
                            {stop.travel && (
                              <p className="text-[11px] text-muted-foreground">
                                {stop.travel.minutes} min · {travelLabel(stop.travel.km)}
                              </p>
                            )}
                            <p className="flex items-center gap-2 text-sm font-medium">
                              <Clock className="size-3.5 text-primary" />
                              <span className="tabular-nums">{stop.time}</span>
                              <span className="truncate">{listing.name}</span>
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{stop.blurb}</p>
                          </li>
                        );
                      })}
                    </ol>
                  </section>
                ))}
              </div>
            </div>
          )}
          {wpUrl && (
            <a href={wpUrl} className="mt-3 block text-xs text-primary hover:underline" target="_blank" rel="noreferrer">
              Open on {WP_ORIGIN.replace("https://", "")}
            </a>
          )}
        </section>

        <section className="rounded-2xl bg-card p-3 ring-1 ring-border/70 sm:p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Map view</h2>
            <div className="flex gap-1">
              {Array.from({ length: days }, (_, i) => i + 1).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDay(d)}
                  className={cn(
                    "h-8 rounded-full px-3 text-[11px] font-semibold",
                    day === d ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  Day {d}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-3">
            <ListingMap
              listings={dayListings.filter((l): l is NonNullable<typeof l> => !!l)}
              selected={selectedSlug}
              onSelect={setSelectedSlug}
            />
          </div>
        </section>
      </div>

      <AddDayModal
        pending={addDay.pending}
        days={days}
        onClose={addDay.close}
        onChoose={(d) => {
          const payload = addDay.confirm(d);
          if (!payload) return;
          addToDay(payload.slug, d);
          setDay(d);
          toast.success(`${payload.currentDay ? "Moved" : "Added"} to day ${d}`);
        }}
      />
    </div>
  );
}

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full bg-card/90 px-3 py-1 text-[11px] font-medium text-foreground backdrop-blur-sm">
      <span className="text-muted-foreground">{label} · </span>
      {value}
    </span>
  );
}
