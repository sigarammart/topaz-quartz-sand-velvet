import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Clock, GripVertical, Sparkles, Wand2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ListingMap } from "@/components/listing-map";
import { TripFormWizard } from "@/components/trip-form-wizard";
import { AddDayModal, useAddDayModal } from "@/components/add-day-modal";
import { TripPaneBar, type TripPane } from "@/components/trip-pane-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WP_ORIGIN } from "@/lib/wp-api";
import { generateAiItinerary } from "@/lib/ai-itinerary";
import {
  formatTripDates,
  interestLabel,
  listingMatchesInterest,
  travelLeg,
  TRIP_BUDGETS,
  TRIP_LOCATIONS,
  TRIP_TYPES,
} from "@/lib/trip-form";
import { attachTravel, buildTripItinerary, travelLabel } from "@/lib/itinerary";
import { ANNA_SALAI } from "@/lib/geo";
import { cn } from "@/lib/utils";
import { useGeo } from "@/store/geo";
import { resolveListing, useCatalog } from "@/store/catalog";
import { useHydrated } from "@/lib/use-hydrated";
import { useTrip } from "@/store/trip";

type TripTab = "interests" | "saved" | "all";

export const Route = createFileRoute("/trip")({
  validateSearch: (search: Record<string, unknown>): { tab?: TripTab } => ({
    tab: search.tab === "saved" || search.tab === "all" || search.tab === "interests" ? search.tab : undefined,
  }),
  component: TripPage,
});

function TripPage() {
  const hydrated = useHydrated();
  const { tab: tabParam } = Route.useSearch();
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
  const tempTrip = useTrip((s) => s.tempTrip);
  const wpUrl = useTrip((s) => s.wpUrl);
  const addToDay = useTrip((s) => s.addToDay);
  const removeItem = useTrip((s) => s.removeItem);
  const reorderDay = useTrip((s) => s.reorderDay);
  const itinerary = useTrip((s) => s.itinerary);
  const itineraryPolished = useTrip((s) => s.itineraryPolished);
  const setItinerary = useTrip((s) => s.setItinerary);
  const originGps = useGeo((s) => s.origin) ?? ANNA_SALAI;
  const fromLat = useTrip((s) => s.fromLat);
  const fromLng = useTrip((s) => s.fromLng);
  const origin =
    fromLat != null && fromLng != null ? { lat: fromLat, lng: fromLng } : originGps;
  const [busy, setBusy] = useState<"generate" | "ai" | null>(null);
  const [day, setDay] = useState(1);
  const [tab, setTab] = useState<TripTab>(tabParam ?? "interests");
  const [chip, setChip] = useState<string>(interests[0] ?? "");
  const [q, setQ] = useState("");
  const [selectedSlug, setSelectedSlug] = useState<string | undefined>();
  const [drag, setDrag] = useState<string | null>(null);
  const [pane, setPane] = useState<TripPane>("locations");
  const addDay = useAddDayModal();
  const seeded = useRef(false);
  const tabSeeded = useRef(false);

  useEffect(() => {
    if (tabParam) {
      setTab(tabParam);
      tabSeeded.current = true;
      return;
    }
    if (tabSeeded.current || !hydrated) return;
    tabSeeded.current = true;
    if (tempTrip.length > 0) setTab("saved");
  }, [hydrated, tabParam, tempTrip.length]);

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
  const locationLabel = locations.map((s) => TRIP_LOCATIONS.find((l) => l.slug === s)?.label ?? s).join(", ") || "Pondicherry";

  const pool = useMemo(() => {
    if (tab === "saved") {
      const rows = [...tempTrip]
        .reverse()
        .map((slug) => resolveListing(slug, catalog))
        .filter((l): l is NonNullable<typeof l> => !!l);
      if (!q.trim()) return rows;
      const needle = q.toLowerCase();
      return rows.filter((l) => `${l.name} ${l.kind} ${l.location}`.toLowerCase().includes(needle));
    }
    let rows = catalog;
    if (tab === "interests") rows = catalog.filter((l) => listingMatchesInterest(l, activeChip));
    if (q.trim()) {
      const needle = q.toLowerCase();
      rows = rows.filter((l) => `${l.name} ${l.kind} ${l.location}`.toLowerCase().includes(needle));
    }
    return rows.slice(0, 24);
  }, [catalog, tab, tempTrip, activeChip, q]);

  const dayItems = items.filter((i) => i.day === day);
  const dayListings = dayItems.map((i) => resolveListing(i.slug, catalog)).filter(Boolean);

  function applyLocalItinerary(polish: boolean) {
    const built = buildTripItinerary({
      items,
      listings: catalog,
      days,
      polish,
      origin,
      tripType,
      interests,
      locationLabel,
    });
    setItinerary(built.days, built.items, polish);
  }

  async function runItinerary(polish: boolean) {
    const chosen = items
      .map((i) => resolveListing(i.slug, catalog))
      .filter((l): l is NonNullable<typeof l> => !!l);
    if (chosen.length === 0) {
      toast.error("Add listings first");
      return;
    }
    setBusy(polish ? "ai" : "generate");
    if (!polish) {
      window.setTimeout(() => {
        applyLocalItinerary(false);
        setBusy(null);
        setPane("itinerary");
        toast.success("Itinerary created");
      }, 250);
      return;
    }
    try {
      const slim = chosen.slice(0, 40).map((l) => ({
        slug: l.slug,
        name: l.name,
        kind: l.kind,
        area: l.area,
        category: l.category,
        description: (l.description || "").slice(0, 280),
        ...(Number.isFinite(l.lat) ? { lat: l.lat } : {}),
        ...(Number.isFinite(l.lng) ? { lng: l.lng } : {}),
        ...(l.duration ? { duration: l.duration } : {}),
      }));
      const result = await generateAiItinerary({
        data: {
          days,
          tripType,
          interests,
          locationLabel,
          items,
          listings: slim,
        },
      });
      if (result.ok && result.days.length) {
        setItinerary(attachTravel(result.days, catalog, origin), result.items, true);
        toast.success("AI itinerary ready");
      } else {
        applyLocalItinerary(true);
        toast.message("AI was busy — local itinerary ready");
      }
    } catch {
      applyLocalItinerary(true);
      toast.message("AI was busy — local itinerary ready");
    } finally {
      setBusy(null);
      setPane("itinerary");
    }
  }

  if (!hydrated) return <p className="py-16 text-center text-sm text-muted-foreground">Loading trip…</p>;

  if (!started && items.length === 0 && tempTrip.length === 0) {
    return <TripFormWizard />;
  }

  const budgetLabel = TRIP_BUDGETS.find((b) => b.slug === budget)?.label ?? budget;
  const typeLabel = TRIP_TYPES.find((t) => t.slug === tripType)?.label ?? tripType;
  const dateLabel = formatTripDates(start, end);

  return (
    <div className="min-w-0">
      <section className={cn("relative overflow-hidden rounded-2xl", pane === "map" ? "max-lg:hidden" : "block")}>
        <img src="/images/lighthouse.jpg" alt="" className="h-40 w-full object-cover sm:h-48" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
        <div className="absolute right-3 top-3 z-10">
          <Button variant="outline" size="sm" asChild className="bg-card/95 shadow-soft">
            <Link to="/plan">Edit selection</Link>
          </Button>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <h1 className="font-display text-xl font-semibold leading-snug sm:text-2xl">{title}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <MetaChip label="Size" value={typeLabel || "Open"} />
            <MetaChip label="Budget" value={budgetLabel || "Any"} />
            {code ? <MetaChip label="Code" value={code} /> : null}
            <MetaChip label="Location" value={locationLabel || "Pondicherry"} />
          </div>
          {dateLabel ? <p className="mt-2 text-xs text-muted-foreground">Date: {dateLabel}</p> : null}
        </div>
      </section>

      <div
        className={cn(
          "mt-4 grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.95fr)_minmax(0,0.9fr)] lg:items-stretch",
          pane === "map" && "max-lg:mt-0",
        )}
      >
        <section
          id="trip-panel-locations"
          role="tabpanel"
          aria-labelledby="trip-pane-locations"
          className={cn(
            "min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl bg-card p-3 ring-1 ring-border/70 sm:p-4 lg:max-h-[calc(100dvh-10rem)]",
            pane === "locations" ? "flex" : "hidden lg:flex",
          )}
        >
          <div className="shrink-0">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["interests", "Chosen interests"],
                ["saved", tempTrip.length ? `Saved (${tempTrip.length})` : "Saved"],
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
          {tab === "saved" && (
            <p className="mt-3 text-xs text-muted-foreground">
              Saved from listing cards. Tap Add to put a place on a day.
            </p>
          )}
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={tab === "saved" ? "Search saved…" : "Search listings…"}
            className="mt-3 h-10"
            aria-label="Search trip listings"
          />
          </div>
          <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {pool.map((listing) => {
                const assigned = items.find((i) => i.slug === listing.slug);
                return (
                  <article
                    key={listing.slug}
                    className="flex min-w-0 flex-col overflow-hidden rounded-xl bg-background ring-1 ring-border/70"
                  >
                    <Link to="/place/$slug" params={{ slug: listing.slug }} className="block">
                      <img src={listing.image} alt="" className="aspect-[4/3] w-full object-cover" />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col gap-2 p-2">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold leading-snug">{listing.name}</p>
                        <p className="truncate text-[11px] text-muted-foreground">{listing.kind}</p>
                      </div>
                      {assigned ? (
                        <div className="mt-auto flex gap-1.5">
                          <button
                            type="button"
                            className="inline-flex h-8 min-w-0 flex-1 items-center justify-center gap-1 rounded-full bg-muted px-2 text-[11px] font-semibold text-muted-foreground"
                            onClick={() => removeItem(listing.slug, assigned.day)}
                          >
                            <Check className="size-3.5" />
                            Remove
                          </button>
                          <button
                            type="button"
                            className="inline-flex h-8 shrink-0 items-center justify-center rounded-full bg-primary px-2.5 text-[11px] font-semibold text-primary-foreground"
                            onClick={() => addDay.open({ slug: listing.slug, name: listing.name, currentDay: assigned.day })}
                          >
                            Day {assigned.day}
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="mt-auto inline-flex h-8 w-full items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground"
                          onClick={() => addDay.open({ slug: listing.slug, name: listing.name })}
                        >
                          + Add
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
            {pool.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {tab === "saved" ? "Save listings from cards to see them here." : "No listings match."}
              </p>
            )}
          </div>
        </section>

        <section
          id="trip-panel-itinerary"
          role="tabpanel"
          aria-labelledby="trip-pane-itinerary"
          className={cn(
            "min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl bg-card p-3 ring-1 ring-border/70 sm:p-4 lg:max-h-[calc(100dvh-10rem)]",
            pane === "itinerary" ? "flex" : "hidden lg:flex",
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-semibold">Itinerary</h2>
            <div className="flex gap-1">
              {Array.from({ length: days }, (_, i) => i + 1).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDay(d)}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full text-xs font-semibold ring-1",
                    day === d ? "bg-primary text-primary-foreground ring-primary" : "ring-border",
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Day {day} · drag to reorder</p>
          <ol className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            {dayListings.map((listing, index) => {
              if (!listing) return null;
              const prev = dayListings[index - 1];
              const leg = index > 0 ? travelLeg(prev, listing) : null;
              return (
                <li key={listing.slug}>
                  {leg && (
                    <p className="mb-1 pl-10 text-[11px] text-muted-foreground">
                      {leg.minutes} min · {travelLabel(leg.km)}
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
                      "flex cursor-grab gap-2 rounded-xl bg-background p-2 ring-1 ring-border/70 active:cursor-grabbing",
                      drag === listing.slug && "opacity-60",
                      selectedSlug === listing.slug && "ring-primary",
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
            <p className="mt-8 text-center text-sm text-muted-foreground">Add listings from Saved for Day {day}.</p>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/plan">Edit selection</Link>
            </Button>
            <Button size="sm" disabled={busy != null} onClick={() => void runItinerary(false)}>
              <Wand2 className="size-3.5" />
              {busy === "generate" ? "Generating…" : itinerary ? "Regenerate itinerary" : "Generate itinerary"}
            </Button>
            <Button variant="secondary" size="sm" disabled={busy != null} onClick={() => void runItinerary(true)}>
              <Sparkles className="size-3.5" />
              {busy === "ai" ? "Writing with AI…" : "AI generator"}
            </Button>
          </div>
          {busy && (
            <p className="mt-3 text-sm text-muted-foreground">
              {busy === "ai" ? "Asking Gemini to shape the days…" : "Generating itinerary… please wait."}
            </p>
          )}
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
          {wpUrl ? (
            <a href={wpUrl} className="mt-3 block text-xs text-primary hover:underline" target="_blank" rel="noreferrer">
              Open on {WP_ORIGIN.replace("https://", "")}
            </a>
          ) : null}
        </section>

        <section
          id="trip-panel-map"
          role="tabpanel"
          aria-labelledby="trip-pane-map"
          className={cn(
            "min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl bg-card p-0 ring-1 ring-border/70 lg:max-h-[calc(100dvh-10rem)]",
            pane === "map" ? "flex max-lg:min-h-[calc(100dvh-8.5rem)]" : "hidden lg:flex",
          )}
        >
          <ListingMap
            listings={dayListings.filter((l): l is NonNullable<typeof l> => !!l)}
            selected={selectedSlug}
            onSelect={setSelectedSlug}
            className="h-full min-h-[22rem] rounded-none ring-0 sm:h-full"
          />
        </section>
      </div>

      <TripPaneBar pane={pane} onChange={setPane} badge={items.length} />
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
    <span className="inline-flex items-center gap-1 rounded-full bg-card/90 px-2.5 py-1 text-[11px] ring-1 ring-border/70">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </span>
  );
}
