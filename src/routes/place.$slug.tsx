import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Accessibility,
  Check,
  Clock3,
  ExternalLink,
  Loader2,
  MapPin,
  Navigation,
  LocateFixed,
  Phone,
  Ticket,
  Timer,
  Users,
  X,
} from "lucide-react";
import { AddToTrip } from "@/components/add-to-trip";
import { ListingCard } from "@/components/listing-card";
import { PhotoGallery } from "@/components/photo-gallery";
import { OpenNowBadge } from "@/components/open-now-badge";
import { GoogleReviews } from "@/components/google-reviews";
import { SaveButton } from "@/components/save-button";
import { Stars } from "@/components/stars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getListing } from "@/data/listings";
import { CATEGORY_META } from "@/lib/types";
import type { Listing } from "@/lib/types";
import { fetchWpListing } from "@/lib/wp-api";
import { exploreSearchForTerm } from "@/lib/filters";
import { listingPhotos } from "@/lib/media";
import { catalogListing, catalogNearby, useCatalog } from "@/store/catalog";
import { useGeo } from "@/store/geo";
import { formatDistance, listingDistanceKm, haversineKm } from "@/lib/geo";
import { decodeEntities, cn } from "@/lib/utils";
import { preferListeoAddress, websiteHref } from "@/lib/listeo";
import { filterListingGroups, orderListingGroups, profileFromSlugs } from "@/lib/listing-layouts";

export const Route = createFileRoute("/place/$slug")({
  component: PlacePage,
});

const DETAIL_TTL = 30 * 60 * 1000;
const RECENTLY_VIEWED_KEY = "xplore-pondy-recently-viewed";
const MAX_RECENTLY_VIEWED = 20;
const detailCache = new Map<string, { at: number; listing: Listing }>();

function placeKey(slug: string) {
  return `xp-place-v2:${slug}`;
}

function cachedDetail(slug: string) {
  const hit = detailCache.get(slug);
  if (hit) {
    if (Date.now() - hit.at > DETAIL_TTL) detailCache.delete(slug);
    else return hit.listing;
  }
  if (typeof sessionStorage === "undefined") return undefined;
  try {
    const raw = sessionStorage.getItem(placeKey(slug));
    if (!raw) return undefined;
    const saved = JSON.parse(raw) as { at: number; listing: Listing };
    if (!saved?.listing || Date.now() - saved.at > DETAIL_TTL) return undefined;
    detailCache.set(slug, saved);
    return saved.listing;
  } catch {
    return undefined;
  }
}

function rememberDetail(slug: string, listing: Listing) {
  const saved = { at: Date.now(), listing };
  detailCache.set(slug, saved);
  try {
    sessionStorage.setItem(placeKey(slug), JSON.stringify(saved));
  } catch {
    /* quota */
  }
}

function mergeListing(base?: Listing | null, extra?: Listing | null): Listing | null {
  if (!extra) return base ?? null;
  if (!base) return extra;
  return {
    ...base,
    ...extra,
    name: extra.name || base.name,
    description: (extra.description?.length ?? 0) >= (base.description?.length ?? 0) ? extra.description : extra.description || base.description,
    rating: extra.rating || base.rating,
    reviews: extra.reviews || base.reviews,
    hours: extra.hours || base.hours,
    openNow: extra.openNow ?? base.openNow,
    weeklyHours: extra.weeklyHours?.length ? extra.weeklyHours : base.weeklyHours,
    distance: extra.distance || base.distance,
    duration: extra.duration || base.duration,
    entry: extra.entry || base.entry,
    price: extra.price || base.price,
    phone: extra.phone || base.phone,
    website: extra.website || base.website,
    googlePlaceId: extra.googlePlaceId || base.googlePlaceId,
    address: preferListeoAddress(extra.address, base.address),
    lat: extra.lat ?? base.lat,
    lng: extra.lng ?? base.lng,
    tags: extra.tags.length ? extra.tags : base.tags,
    bestFor: extra.bestFor.length ? extra.bestFor : base.bestFor,
    cafeTypes: extra.cafeTypes?.length ? extra.cafeTypes : base.cafeTypes,
    accessibility: extra.accessibility?.length ? extra.accessibility : base.accessibility,
    taxonomies: extra.taxonomies?.length ? extra.taxonomies : base.taxonomies,
    categorySlugs: extra.categorySlugs?.length ? extra.categorySlugs : base.categorySlugs,
    itinerary: extra.itinerary?.length ? extra.itinerary : base.itinerary,
    faqs: extra.faqs?.length ? extra.faqs : base.faqs,
    menuImages: extra.menuImages?.length ? extra.menuImages : base.menuImages,
    metaGroups: extra.metaGroups?.length ? extra.metaGroups : base.metaGroups,
    metaFacets: extra.metaFacets?.length ? extra.metaFacets : base.metaFacets,
    gallery: extra.gallery?.length ? extra.gallery : base.gallery,
    mustTry: extra.mustTry?.length ? extra.mustTry : base.mustTry,
    featured: extra.featured ?? base.featured,
    image: extra.image || base.image,
  };
}

function listingHasDetails(listing: Listing) {
  return Boolean(
    (listing.metaGroups?.length ?? 0) > 0 ||
      (listing.taxonomies?.length ?? 0) > 0 ||
      (listing.cafeTypes?.length ?? 0) > 0 ||
      (listing.accessibility?.length ?? 0) > 0 ||
      (listing.faqs?.length ?? 0) > 0 ||
      (listing.itinerary?.length ?? 0) > 0 ||
      (listing.weeklyHours?.length ?? 0) > 0,
  );
}

function PlacePage() {
  const { slug } = Route.useParams();
  const items = useCatalog((s) => s.items);
  const status = useCatalog((s) => s.status);
  const catalogHit = catalogListing(slug, items) ?? getListing(slug);
  const [fetched, setFetched] = useState<{ slug: string; listing: Listing | null | undefined }>(() => ({
    slug,
    listing: cachedDetail(slug),
  }));
  const [relatedShown, setRelatedShown] = useState(6);
  const [relatedSort, setRelatedSort] = useState<"featured" | "package" | "near">("featured");

  useEffect(() => {
    let cancelled = false;
    const cached = cachedDetail(slug);
    setFetched({ slug, listing: cached });
    setRelatedShown(6);
    if (cached) return;
    const url = catalogListing(slug, useCatalog.getState().items)?.siteUrl;
    void fetchWpListing({ data: { slug, url } })
      .then((row) => {
        if (cancelled) return;
        if (row) {
          detailCache.set(slug, { at: Date.now(), listing: row });
          rememberDetail(slug, row);
          useCatalog.getState().patchListing(row);
        }
        setFetched({ slug, listing: row ?? null });
      })
      .catch(() => {
        if (!cancelled) setFetched({ slug, listing: null });
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const extra = fetched.slug === slug ? fetched.listing : cachedDetail(slug);
  const listing = mergeListing(catalogHit, extra ?? null);
  const origin = useGeo((s) => s.origin);
  const fromGps = useGeo((s) => s.source === "gps");
  const detailsLoading = extra === undefined;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
      const current = raw ? JSON.parse(raw) : [];
      const slugs = Array.isArray(current)
        ? current.filter((item): item is string => typeof item === "string")
        : [];
      const next = [slug, ...slugs.filter((item) => item !== slug)].slice(0, MAX_RECENTLY_VIEWED);
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
    } catch {
      /* ignore storage errors */
    }
  }, [slug]);

  if (!listing) {
    if (extra === undefined || status === "loading" || status === "idle") {
      return <PlaceLoading />;
    }
    throw notFound();
  }

  const km = listingDistanceKm(origin, listing);
  const maps =
    listing.lat && listing.lng
      ? `https://www.google.com/maps/dir/?api=1&destination=${listing.lat},${listing.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((listing.address || listing.name) + " Pondicherry")}`;
  const embed =
    listing.lat && listing.lng
      ? `https://www.google.com/maps?q=${listing.lat},${listing.lng}&z=16&output=embed`
      : "";
  const cafeTypes = listing.cafeTypes ?? [];
  const accessibility = listing.accessibility ?? [];
  const itinerary = listing.itinerary ?? [];
  const faqs = listing.faqs ?? [];
  const menuImages = listing.menuImages ?? [];
  const profile = profileFromSlugs([
    ...(listing.categorySlugs ?? []),
    ...(listing.taxonomies ?? []).flatMap((g) => g.terms.map((t) => t.slug)),
    listing.kind,
  ]);
  const metaGroups = profile
    ? filterListingGroups(profile, listing.metaGroups ?? [])
    : orderListingGroups(listing.category, listing.metaGroups ?? []);
  const photos = listingPhotos(listing);
  const tel = listing.phone?.replace(/[^\d+]/g, "") ?? "";
  const metaTitles = new Set(metaGroups.map((g) => g.title.toLowerCase()));
  const metaLabels = new Set(metaGroups.flatMap((g) => g.items.map((i) => i.label.toLowerCase())));
  const showCafeTypes = cafeTypes.length > 0 && !metaTitles.has("cafe type");
  const showAccessibility = accessibility.length > 0 && !metaTitles.has("accessibility");
  const taxonomies = (listing.taxonomies ?? [])
    .map((group) => ({
      ...group,
      terms: group.terms.filter(
        (term) => !metaLabels.has(term.name.toLowerCase()) && !metaTitles.has(group.label.toLowerCase()),
      ),
    }))
    .filter((group) => group.terms.length);
  const where = listing.address || listing.location;
  const showDetailsSkeleton = detailsLoading && !listingHasDetails(listing);

  return (
    <article aria-busy={detailsLoading}>
      <PhotoGallery images={photos} name={listing.name} layout="hero" />

      <div className="mt-4 lg:mt-5 lg:grid lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start lg:gap-6">
        <div>
          <Link
            to="/explore"
            search={{ cat: listing.category, q: "" }}
            className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary"
          >
            {CATEGORY_META[listing.category].label}
            {listing.kind ? ` · ${decodeEntities(listing.kind)}` : ""}
          </Link>
          <div className="mt-1 flex items-start justify-between gap-3">
            <h1 className="font-display text-2xl font-semibold leading-tight sm:text-[1.7rem]">{listing.name}</h1>
            <SaveButton slug={listing.slug} name={listing.name} wpId={listing.wpId} className="shrink-0 lg:hidden" />
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {listing.rating > 0 && (
              <span className="flex items-center gap-1.5">
                <Stars value={listing.rating} />
                <span className="tabular-nums">{listing.reviews.toLocaleString()} reviews</span>
              </span>
            )}
            <OpenNowBadge listing={listing} />
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" />
              {km != null ? formatDistance(km, fromGps) : where}
              {km != null && where ? ` · ${where}` : ""}
            </span>
            {detailsLoading && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-foreground">
                <Loader2 className="size-3 animate-spin" />
                Loading details
              </span>
            )}
          </div>
          {listing.price && <p className="mt-1.5 text-sm font-medium">{listing.price}</p>}

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:hidden">
            <AddToTrip slug={listing.slug} name={listing.name} wpId={listing.wpId} className="w-full" />
            <Button variant="outline" size="sm" asChild className="h-10 w-full">
              <a href={maps} target="_blank" rel="noreferrer">
                <Navigation />
                Directions
              </a>
            </Button>
            {tel && (
              <Button variant="outline" size="sm" asChild className="h-10 w-full">
                <a href={`tel:${tel}`}>
                  <Phone />
                  Call
                </a>
              </Button>
            )}
            {listing.website && (
              <Button variant="outline" size="sm" asChild className="h-10 w-full">
                <a href={websiteHref(listing.website)} target="_blank" rel="noreferrer">
                  <ExternalLink />
                  Website
                </a>
              </Button>
            )}
          </div>

          <ListingBody text={listing.description} />

          {(listing.hours || listing.duration || listing.entry || listing.groupSize) && (
            <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {listing.hours && <Info label="Hours" value={listing.hours} icon={Clock3} />}
              {listing.duration && <Info label="Time needed" value={listing.duration} icon={Timer} />}
              {listing.entry && <Info label="Entry" value={listing.entry} icon={Ticket} />}
              {listing.groupSize && <Info label="Group size" value={listing.groupSize} icon={Users} />}
            </dl>
          )}

          {showDetailsSkeleton && <DetailsLoading />}

          {detailsLoading && listingHasDetails(listing) && (
            <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground" aria-live="polite">
              <Loader2 className="size-3.5 animate-spin text-primary" />
              Refreshing amenities and listing tags…
            </p>
          )}

          {metaGroups.length > 0 && (
            <div className="mt-5 space-y-5">
              {metaGroups.map((group) => {
                const scored = group.items.some((i) => i.included !== undefined);
                const asFacts =
                  /^features$/i.test(group.title) ||
                  group.items.some((i) => i.label.includes(": ") && i.label.length > 36);
                return (
                  <section key={group.title}>
                    <h2 className="text-sm font-semibold">{group.title}</h2>
                    {group.text ? (
                      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/90">{group.text}</p>
                    ) : null}
                    {group.items.length > 0 && asFacts ? (
                      <dl className="mt-2 space-y-2">
                        {group.items.map((item) => {
                          const split = item.label.match(/^([^:]{2,40}):\s*(.+)$/);
                          return (
                            <div key={item.label} className="rounded-lg bg-card px-2.5 py-1.5 text-sm ring-1 ring-border/70">
                              {split ? (
                                <>
                                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                    {split[1]}
                                  </dt>
                                  <dd className="mt-0.5">{split[2]}</dd>
                                </>
                              ) : (
                                <dd>{item.label}</dd>
                              )}
                            </div>
                          );
                        })}
                      </dl>
                    ) : group.items.length > 0 && scored ? (
                      <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                        {group.items.map((item) => (
                          <li
                            key={item.label}
                            className="flex items-start gap-2 rounded-lg bg-card px-2.5 py-1.5 text-sm ring-1 ring-border/70"
                          >
                            {item.included === false ? (
                              <X className="mt-0.5 size-3.5 shrink-0 text-destructive" />
                            ) : (
                              <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                            )}
                            <span className={item.included === false ? "text-muted-foreground" : ""}>{item.label}</span>
                          </li>
                        ))}
                      </ul>
                    ) : group.items.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {group.items.map((item) => (
                          <Badge key={item.label} className="text-[11px]">
                            {item.label}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </section>
                );
              })}
            </div>
          )}

          {showCafeTypes && (
            <section className="mt-5">
              <h2 className="text-sm font-semibold">Cafe type</h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {cafeTypes.map((t) => (
                  <Badge key={t} className="text-[11px]">
                    {t}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {showAccessibility && (
            <section className="mt-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Accessibility className="size-3.5 text-primary" />
                Accessibility
              </h2>
              <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                {accessibility.map((item) => (
                  <li key={item} className="rounded-lg bg-card px-2.5 py-1.5 text-sm ring-1 ring-border/70">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {taxonomies.length > 0 && !profile && (
            <section className="mt-5">
              <h2 className="text-sm font-semibold">Listing details</h2>
              <div className="mt-3 space-y-3">
                {taxonomies.map((group) => (
                  <div key={group.key}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {group.label}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {group.terms.map((term) => (
                        <Link key={term.slug} to="/explore" search={exploreSearchForTerm(group.key, term.slug)}>
                          <Badge tone="outline" className="text-[11px]">
                            {term.name}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <GoogleReviews placeId={listing.googlePlaceId} name={listing.name} address={listing.address || listing.location} />

          {listing.bestFor.length > 0 && (
            <section className="mt-5">
              <h2 className="text-sm font-semibold">Best for</h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {listing.bestFor.map((t) => (
                  <Badge key={t} className="text-[11px]">
                    {t}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {listing.mustTry && listing.mustTry.length > 0 && (
            <div className="mt-5 rounded-xl bg-card p-4 ring-1 ring-border/70">
              <h2 className="text-sm font-semibold">Must try</h2>
              <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-sm text-muted-foreground">
                {listing.mustTry.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          )}

          {menuImages.length > 0 && (
            <section className="mt-5">
              <h2 className="text-sm font-semibold">Menu</h2>
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                {menuImages.map((src) => (
                  <img
                    key={src}
                    src={src}
                    alt=""
                    className="h-32 w-24 shrink-0 rounded-lg object-cover ring-1 ring-border/70"
                  />
                ))}
              </div>
            </section>
          )}

          {itinerary.length > 0 && (
            <section className="mt-5">
              <h2 className="text-sm font-semibold">Itinerary</h2>
              <ol className="mt-2 space-y-2">
                {itinerary.map((stop, i) => (
                  <li key={`${stop.title}-${i}`} className="rounded-xl bg-card p-3 ring-1 ring-border/70">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-primary">
                      {[stop.day, stop.time].filter(Boolean).join(" · ") || `Stop ${i + 1}`}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold">{stop.title}</p>
                    {stop.description && <p className="mt-0.5 text-xs text-muted-foreground">{stop.description}</p>}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {faqs.length > 0 && (
            <section className="mt-5">
              <h2 className="text-sm font-semibold">FAQs</h2>
              <div className="mt-2 space-y-2">
                {faqs.map((faq) => (
                  <div key={faq.question} className="rounded-xl bg-card p-3 ring-1 ring-border/70">
                    <p className="text-sm font-medium">{faq.question}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="mt-5 space-y-3 lg:sticky lg:top-20 lg:mt-0">
          <div className="hidden rounded-2xl bg-card p-4 shadow-soft ring-1 ring-border/70 lg:block">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Plan this stop</p>
                <p className="mt-0.5 text-sm font-semibold">{listing.name}</p>
              </div>
              <SaveButton slug={listing.slug} name={listing.name} wpId={listing.wpId} />
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <AddToTrip slug={listing.slug} name={listing.name} wpId={listing.wpId} />
              <Button variant="outline" size="sm" asChild className="h-10 w-full">
                <a href={maps} target="_blank" rel="noreferrer">
                  <Navigation />
                  Directions
                </a>
              </Button>
              {tel && (
                <Button variant="outline" size="sm" asChild className="h-10 w-full">
                  <a href={`tel:${tel}`}>
                    <Phone />
                    {listing.phone}
                  </a>
                </Button>
              )}
              {listing.website && (
                <Button variant="outline" size="sm" asChild className="h-10 w-full">
                  <a href={websiteHref(listing.website)} target="_blank" rel="noreferrer">
                    <ExternalLink />
                    Website
                  </a>
                </Button>
              )}
            </div>
            {(listing.hours || where) && (
              <dl className="mt-3 space-y-1.5 border-t border-border pt-3 text-xs">
                {listing.hours && (
                  <div className="flex gap-2">
                    <Clock3 className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    <div>
                      <dt className="text-muted-foreground">Hours</dt>
                      <dd className="font-medium">{listing.hours}</dd>
                    </div>
                  </div>
                )}
                {where && (
                  <div className="flex gap-2">
                    <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    <div>
                      <dt className="text-muted-foreground">Address</dt>
                      <dd className="font-medium">{where}</dd>
                    </div>
                  </div>
                )}
              </dl>
            )}
          </div>
          {(listing.website || tel || listing.address) && (
            <section className="rounded-2xl bg-card p-4 shadow-soft ring-1 ring-border/70">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Contact / Address
              </h2>
              <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl ring-1 ring-border/70">
                {listing.website && (
                  <li>
                    <a
                      href={websiteHref(listing.website)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm hover:bg-muted/50"
                    >
                      <span>
                        <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Website
                        </span>
                        <span className="mt-0.5 block truncate font-medium">{listing.website.replace(/^https?:\/\//, "")}</span>
                      </span>
                      <ExternalLink className="size-3.5 shrink-0 text-primary" />
                    </a>
                  </li>
                )}
                {tel && (
                  <li>
                    <a href={`tel:${tel}`} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm hover:bg-muted/50">
                      <span>
                        <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Phone number
                        </span>
                        <span className="mt-0.5 block font-medium">{listing.phone}</span>
                      </span>
                      <Phone className="size-3.5 shrink-0 text-primary" />
                    </a>
                  </li>
                )}
                {listing.address && (
                  <li>
                    <a
                      href={maps}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-start justify-between gap-3 px-3 py-2.5 text-sm hover:bg-muted/50"
                    >
                      <span>
                        <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Google Maps address
                        </span>
                        <span className="mt-0.5 block font-medium leading-snug">{listing.address}</span>
                      </span>
                      <Navigation className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    </a>
                  </li>
                )}
              </ul>
            </section>
          )}
          {embed && (
            <div className="overflow-hidden rounded-2xl ring-1 ring-border/70">
              <iframe
                title={`Map of ${listing.name}`}
                src={embed}
                className="h-48 w-full lg:h-52"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}
          {(listing.weeklyHours?.length ?? 0) > 0 && (
            <section>
              <h2 className="text-sm font-semibold">Hours</h2>
              <ul className="mt-2 divide-y divide-border overflow-hidden rounded-xl bg-card text-sm ring-1 ring-border/70">
                {listing.weeklyHours!.map((row) => (
                  <li key={row.day} className="flex items-baseline justify-between gap-3 px-3 py-1.5">
                    <span className="font-medium">{row.day}</span>
                    <span className="text-right text-xs text-muted-foreground">{row.slots.join(", ")}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <a
            href={listing.siteUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1.5 py-1 text-xs font-medium text-primary hover:underline"
          >
            View on xplorepondy.com
            <ExternalLink className="size-3.5" />
          </a>
        </aside>
      </div>

      <NearbyCategories current={listing} items={items} />

    </article>
  );
}

function nearbyCategory(listing: Listing): "cafes" | "restaurants" | "attractions" | "activities" | "stays" | null {
  const values = [
    listing.kind,
    listing.category,
    ...(listing.categorySlugs ?? []),
    ...(listing.taxonomies ?? []).flatMap((group) => [
      group.key,
      group.label,
      ...group.terms.flatMap((term) => [term.slug, term.name]),
    ]),
  ]
    .map((value) => decodeEntities(value).toLowerCase().replace(/[^a-z0-9]+/g, " "))
    .join(" ");

  if (listing.category === "stay" || /hotel|resort|guest house|guesthouse|hostel|homestay|cottage|camp site|campsite|bed breakfast|boutique hotel|farm stay|serviced apartment/.test(values)) {
    return "stays";
  }
  if (/cafe|coffee shop|bakery|pizzeria|dessert|ice cream|food cart/.test(values)) return "cafes";
  if (/restaurant|resto pub|resto bar|pub|lounge|mess|home food|cloud kitchen/.test(values)) return "restaurants";
  if (listing.category === "activities") return "activities";
  if (listing.category === "places") return "attractions";
  return null;
}

function NearbyCategories({ current, items }: { current: Listing; items: Listing[] }) {
  const [tab, setTab] = useState<"related" | "cafes" | "restaurants" | "attractions" | "activities" | "stays">("related");

  const categories = [
    { id: "related" as const, label: "Related" },
    { id: "cafes" as const, label: "Cafes" },
    { id: "restaurants" as const, label: "Restaurants" },
    { id: "attractions" as const, label: "Attractions" },
    { id: "activities" as const, label: "Activities" },
    { id: "stays" as const, label: "Stays" },
  ];

  const rows = items
    .filter((item) => item.slug !== current.slug)
    .map((item) => ({
      item,
      distance: current.lat != null && current.lng != null && item.lat != null && item.lng != null
        ? haversineKm({ lat: current.lat, lng: current.lng }, { lat: item.lat, lng: item.lng })
        : undefined,
      category: nearbyCategory(item),
    }))
    .filter((row) => {
      if (row.distance == null || row.distance > 15) return false;
      if (tab === "related") return row.item.category === current.category;
      return row.category === tab;
    })
    .sort((a, b) => (a.distance! - b.distance!) || (b.item.rating - a.item.rating))
    .slice(0, 8);

  if (current.lat == null || current.lng == null) return null;

  return (
    <section className="mt-8" aria-label="Nearby places">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">Nearby places</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Explore more around this listing</p>
        </div>
      </div>

      <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setTab(category.id)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              tab === category.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {category.label}
          </button>
        ))}
      </div>

      {rows.length > 0 ? (
        <div className="mt-3 flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:none]">
          {rows.map(({ item }) => (
            <div key={item.slug} className="w-[15.5rem] shrink-0 snap-start">
              <ListingCard listing={item} layout="compact" />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-3 rounded-xl bg-card p-4 text-xs text-muted-foreground ring-1 ring-border/70">
          No {tab === "related" ? "related listings" : categories.find((category) => category.id === tab)?.label.toLowerCase()} found within 15 km.
        </div>
      )}
    </section>
  );
}

function ListingBody({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  if (!text.trim()) return null;
  const long = text.length > 480;
  const shown = open || !long ? text : `${text.slice(0, 420).replace(/\s+\S*$/, "")}…`;
  return (
    <div className="mt-4">
      <div className="space-y-2 text-sm leading-relaxed text-foreground/90">
        {shown.split(/\n{2,}/).map((p, i) => (
          <p key={i} className="whitespace-pre-line">
            {p}
          </p>
        ))}
      </div>
      {long ? (
        <button type="button" className="mt-1.5 text-xs font-semibold text-primary hover:underline" onClick={() => setOpen((v) => !v)}>
          {open ? "Read less" : "Read more"}
        </button>
      ) : null}
    </div>
  );
}

function PlaceLoading() {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 py-16" role="status" aria-live="polite">
      <Loader2 className="size-7 animate-spin text-primary" />
      <p className="text-sm font-medium">Loading place…</p>
      <p className="text-xs text-muted-foreground">Photos, amenities and listing tags are on the way</p>
    </div>
  );
}

function DetailsLoading() {
  return (
    <section className="mt-5 rounded-xl bg-card p-4 ring-1 ring-border/70" aria-live="polite" aria-busy="true">
      <div className="flex items-center gap-2.5">
        <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
        <div>
          <p className="text-sm font-semibold">Loading listing details</p>
          <p className="text-xs text-muted-foreground">Amenities, hours and tags are coming in…</p>
        </div>
      </div>
      <div className="mt-3 space-y-3">
        <div>
          <div className="h-2.5 w-24 animate-pulse rounded bg-muted" />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="h-6 w-16 animate-pulse rounded-full bg-muted" />
            ))}
          </div>
        </div>
        <div>
          <div className="h-2.5 w-28 animate-pulse rounded bg-muted" />
          <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <span key={i} className="h-8 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Info({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Clock3;
}) {
  return (
    <div className="rounded-xl bg-card p-2.5 ring-1 ring-border/70">
      <dt className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </dt>
      <dd className="mt-0.5 text-xs font-medium">{value}</dd>
    </div>
  );
}
