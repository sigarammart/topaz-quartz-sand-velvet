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
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { fetchWpTripStore, fetchWpUserTripState, syncWpUserTrip, updateWpTripStore, WP_ORIGIN } from "@/lib/wp-api";
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
import { elasticSearch } from "@/lib/es-search";
import { cn } from "@/lib/utils";
import type { Listing } from "@/lib/types";
import { useGeo } from "@/store/geo";
import { resolveListing, useCatalog } from "@/store/catalog";
import { useHydrated } from "@/lib/use-hydrated";
import { useAppLoggedIn } from "@/lib/app-session";
import { useAuthModal } from "@/store/auth-modal";
import { jetTempWriteAll } from "@/lib/jet-store";
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
  const { loggedIn, isPending, wpUser, grokUser } = useAppLoggedIn();
  const accountEmail = wpUser?.email || grokUser?.primaryEmail || "";
  const showLogin = useAuthModal((s) => s.show);
  const { tab: tabParam } = Route.useSearch();
  const catalog = useCatalog((s) => s.items);
  const started = useTrip((s) => s.started);
  const title = useTrip((s) => s.title);
  const code = useTrip((s) => s.code);
  const wpId = useTrip((s) => s.wpId);
  const days = useTrip((s) => s.days);
  const locations = useTrip((s) => s.locations);
  const fromPlace = useTrip((s) => s.fromPlace);
  const fromLat = useTrip((s) => s.fromLat);
  const fromLng = useTrip((s) => s.fromLng);
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
  const reorderSelected = useTrip((s) => s.reorderSelected);
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
  const [editSelection, setEditSelection] = useState(false);
  const addDay = useAddDayModal();
  const seeded = useRef(false);
  const tabSeeded = useRef(false);
  const tripStoreSynced = useRef("");
  const tripSyncReady = useRef(false);
  const tripSyncSignature = useRef("");
  const tripRemoteHydrated = useRef<number | null>(null);

  useEffect(() => {
    if (!hydrated || !loggedIn || !accountEmail || !wpId || catalog.length === 0) return;
    if (tripRemoteHydrated.current === wpId) return;

    tripRemoteHydrated.current = wpId;

    void fetchWpUserTripState({
      data: { email: accountEmail, wpId },
    }).then((result) => {
      if (!result.ok) {
        tripRemoteHydrated.current = null;
        return;
      }

      const byWpId = new Map<number, Listing>();
      for (const listing of catalog) {
        if (typeof listing.wpId === "number") byWpId.set(listing.wpId, listing);
      }

      const remoteItems = result.items
        .map((item) => {
          const listing = byWpId.get(item.listingId);
          return listing ? { slug: listing.slug, day: item.day } : null;
        })
        .filter((item): item is { slug: string; day: number } => !!item);

      const remoteItinerary = Array.isArray(result.itinerary) ? result.itinerary : [];

      useTrip.setState({
        started: true,
        code: result.code || useTrip.getState().code,
        interests: result.interests.length ? result.interests : useTrip.getState().interests,
        items: remoteItems,
        itinerary: remoteItinerary as typeof itinerary,
        itineraryPolished: remoteItinerary.length > 0,
      });

      tripSyncReady.current = true;
      tripSyncSignature.current = JSON.stringify({
        wpId,
        code: result.code || useTrip.getState().code,
        interests: result.interests.length ? result.interests : useTrip.getState().interests,
        items: remoteItems.map((item) => ({
          listingId: byWpId.get(
            catalog.find((listing) => listing.slug === item.slug)?.wpId ?? 0,
          )?.wpId,
          day: item.day,
        })),
        itinerary: remoteItinerary,
      });
    }).catch(() => {
      tripRemoteHydrated.current = null;
    });
  }, [hydrated, loggedIn, accountEmail, wpId, catalog]);

  useEffect(() => {
    if (!hydrated || !loggedIn || !accountEmail || !wpId || catalog.length === 0) return;

    const selected = [...new Set([...items.map((item) => item.slug), ...tempTrip])]
      .map((slug) => resolveListing(slug, catalog))
      .filter((listing): listing is NonNullable<typeof listing> => !!listing && typeof listing.wpId === "number");

    const syncItems = selected.map((listing) => {
      const assigned = items.find((item) => item.slug === listing.slug);
      return {
        listingId: listing.wpId!,
        day: assigned?.day ?? 1,
      };
    });

    const signature = JSON.stringify({
      wpId,
      code,
      locations,
      fromPlace,
      fromLat,
      fromLng,
      budget,
      tripType,
      datesKnown: useTrip.getState().datesKnown,
      start,
      end,
      months: useTrip.getState().months,
      days,
      interests,
      items: syncItems,
      itinerary,
    });

    if (!tripSyncReady.current || tripSyncSignature.current === signature) return;

    const timer = window.setTimeout(() => {
      void syncWpUserTrip({
        data: {
          email: accountEmail,
          wpId,
          code,
          locations,
          fromPlace,
          fromLat,
          fromLng,
          budget,
          tripType,
          datesKnown: useTrip.getState().datesKnown,
          start,
          end,
          months: useTrip.getState().months,
          days,
          interests,
          items: syncItems,
          itinerary: itinerary ?? [],
        },
      }).then((result) => {
        if (!result.ok) {
          toast.error(result.error || "Could not sync your trip to xplorepondy.com.");
          return;
        }
        tripSyncSignature.current = signature;
      }).catch(() => {
        toast.error("Could not sync your trip to xplorepondy.com.");
      });
    }, 700);

    return () => window.clearTimeout(timer);
  }, [
    hydrated,
    loggedIn,
    accountEmail,
    wpId,
    code,
    locations,
    fromPlace,
    fromLat,
    fromLng,
    budget,
    tripType,
    start,
    end,
    days,
    catalog,
    items,
    tempTrip,
    interests,
    itinerary,
  ]);

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

  useEffect(() => {
    if (!hydrated || !loggedIn || !accountEmail || catalog.length === 0) return;
    if (tripStoreSynced.current === accountEmail) return;
    tripStoreSynced.current = accountEmail;

    void fetchWpTripStore({ data: { email: accountEmail } }).then((result) => {
      if (!result.ok) return;

      const byWpId = new Map<number, Listing>();
      for (const listing of catalog) {
        if (typeof listing.wpId === "number") byWpId.set(listing.wpId, listing);
      }

      const resolved = result.listingIds
        .map((id) => byWpId.get(id))
        .filter((listing): listing is Listing => !!listing);

      const nextTempTrip = resolved.map((listing) => listing.slug);
      const nextWpIds: Record<string, number> = {};
      for (const listing of resolved) {
        if (typeof listing.wpId === "number") nextWpIds[listing.slug] = listing.wpId;
      }

      useTrip.setState({
        tempTrip: nextTempTrip,
        wpIdsBySlug: {
          ...(useTrip.getState().wpIdsBySlug ?? {}),
          ...nextWpIds,
        },
      });
      jetTempWriteAll(result.listingIds);
      tripSyncReady.current = true;
    }).catch(() => {
      tripSyncReady.current = true;
    });
  }, [hydrated, loggedIn, accountEmail, catalog.length]);

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
      return elasticSearch(rows, q);
    }
    let rows = catalog;
    if (tab === "interests") rows = catalog.filter((l) => listingMatchesInterest(l, activeChip));
    if (q.trim()) rows = elasticSearch(rows, q);
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

  if (!hydrated || isPending) return <p className="py-16 text-center text-sm text-muted-foreground">Loading trip…</p>;

  if (!loggedIn) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Trip</p>
        <h1 className="mt-1 font-display text-3xl font-semibold">Sign in to plan a trip</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add places from listings and keep your itinerary with your xplorepondy.com account.
        </p>
        <Button className="mt-5" onClick={() => showLogin({ reason: "trip", next: "/trip" })}>
          Sign in
        </Button>
      </div>
    );
  }

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
            <Link to="/plan" search={{ edit: true }}>Edit trip details</Link>
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
            "min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl bg-card p-3 ring-1 ring-border/70 sm:p-4",
            "max-h-[calc(100dvh-11rem)] lg:max-h-[calc(100dvh-10rem)]",
            pane === "itinerary" ? "flex max-lg:min-h-[min(70dvh,calc(100dvh-11rem))]" : "hidden lg:flex",
          )}
        >
          <div className="shrink-0">
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
            <p className="mt-1 text-xs text-muted-foreground">Selected listings — drag to reorder by preference</p>
          </div>
          <div className="mt-3 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
          <ol className="space-y-2">
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPane("itinerary");
                setEditSelection(true);
              }}
            >
              Edit selection
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
          </div>
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
      <SelectedListingsSheet
        open={editSelection}
        onOpenChange={setEditSelection}
        catalog={catalog}
        items={items}
        tempTrip={tempTrip}
        days={days}
        onReorder={(slugs) => {
          reorderSelected(slugs);
          const nextTempTrip = useTrip.getState().tempTrip;
          const listingIds = nextTempTrip
            .map((slug) => resolveListing(slug, catalog)?.wpId)
            .filter((id): id is number => typeof id === "number");

          if (accountEmail) {
            void updateWpTripStore({
              data: {
                email: accountEmail,
                operation: "replace",
                listingIds,
              },
            }).then((result) => {
              if (!result.ok) toast.error(result.error || "Could not save trip order.");
            }).catch(() => toast.error("Could not save trip order."));
          }
        }}
        onRemove={(slug) => {
          removeItem(slug);
          useTrip.getState().removeTempTrip(slug);
          const postId = resolveListing(slug, catalog)?.wpId;
          if (accountEmail && typeof postId === "number") {
            void updateWpTripStore({
              data: {
                email: accountEmail,
                operation: "remove",
                listingId: postId,
              },
            }).then((result) => {
              if (!result.ok) toast.error(result.error || "Could not remove the listing.");
            }).catch(() => toast.error("Could not remove the listing."));
          }
        }}
        onMoveDay={(slug, nextDay) => {
          addToDay(slug, nextDay);
          setDay(nextDay);
        }}
      />
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

function selectedSlugs(items: { slug: string; day: number }[], tempTrip: string[]) {
  return [...new Set([...items.map((i) => i.slug), ...tempTrip])];
}

function SelectedListingsSheet({
  open,
  onOpenChange,
  catalog,
  items,
  tempTrip,
  days,
  onReorder,
  onRemove,
  onMoveDay,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  catalog: Listing[];
  items: { slug: string; day: number }[];
  tempTrip: string[];
  days: number;
  onReorder: (slugs: string[]) => void;
  onRemove: (slug: string) => void;
  onMoveDay: (slug: string, day: number) => void;
}) {
  const [drag, setDrag] = useState<string | null>(null);
  const slugs = selectedSlugs(items, tempTrip);
  const bySlug = new Map(items.map((i) => [i.slug, i.day]));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" title="Selected listings" className="max-h-[88vh]">
        <p className="-mt-2 mb-3 text-sm text-muted-foreground">Drag to reorder by preference, or remove a place.</p>
        {slugs.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No listings added yet. Add places from Locations.</p>
        ) : (
          <ol className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
            {slugs.map((slug, index) => {
              const listing = resolveListing(slug, catalog);
              if (!listing) return null;
              const assignedDay = bySlug.get(slug);
              return (
                <li key={slug}>
                  <div
                    draggable
                    onDragStart={() => setDrag(slug)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (!drag || drag === slug) return;
                      const next = [...slugs];
                      const from = next.indexOf(drag);
                      const to = next.indexOf(slug);
                      if (from < 0 || to < 0) return;
                      next.splice(from, 1);
                      next.splice(to, 0, drag);
                      onReorder(next);
                      setDrag(null);
                    }}
                    className={cn(
                      "flex cursor-grab items-center gap-2 rounded-xl bg-background p-2 ring-1 ring-border/70 active:cursor-grabbing",
                      drag === slug && "opacity-60",
                    )}
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      {index + 1}
                    </span>
                    <img src={listing.image} alt="" className="size-12 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{listing.name}</p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {listing.kind}
                        {assignedDay ? ` · Day ${assignedDay}` : " · not on a day yet"}
                      </p>
                    </div>
                    {assignedDay ? (
                      <select
                        aria-label={`Day for ${listing.name}`}
                        value={assignedDay}
                        onChange={(e) => onMoveDay(slug, Number(e.target.value))}
                        className="h-8 rounded-md bg-muted px-1.5 text-[11px] font-semibold"
                      >
                        {Array.from({ length: days }, (_, i) => i + 1).map((d) => (
                          <option key={d} value={d}>
                            Day {d}
                          </option>
                        ))}
                      </select>
                    ) : null}
                    <GripVertical className="size-4 shrink-0 text-muted-foreground" />
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => onRemove(slug)}
                      aria-label={`Remove ${listing.name}`}
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </SheetContent>
    </Sheet>
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
