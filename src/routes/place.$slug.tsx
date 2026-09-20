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
import { formatDistance, listingDistanceKm } from "@/lib/geo";
import { decodeEntities } from "@/lib/utils";

export const Route = createFileRoute("/place/$slug")({
  component: PlacePage,
});

const DETAIL_TTL = 10 * 60 * 1000;
const detailCache = new Map<string, { at: number; listing: Listing }>();

function cachedDetail(slug: string) {
  const hit = detailCache.get(slug);
  if (!hit) return undefined;
  if (Date.now() - hit.at > DETAIL_TTL) {
    detailCache.delete(slug);
    return undefined;
  }
  return hit.listing;
}

function mergeListing(base?: Listing | null, extra?: Listing | null): Listing | null {
  if (!extra) return base ?? null;
  if (!base) return extra;
  return {
    ...base,
    ...extra,
    description: extra.description || base.description,
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
    address: extra.address || base.address,
    lat: extra.lat ?? base.lat,
    lng: extra.lng ?? base.lng,
    tags: extra.tags.length ? extra.tags : base.tags,
    bestFor: extra.bestFor.length ? extra.bestFor : base.bestFor,
    cafeTypes: extra.cafeTypes?.length ? extra.cafeTypes : base.cafeTypes,
    accessibility: extra.accessibility?.length ? extra.accessibility : base.accessibility,
    taxonomies: extra.taxonomies?.length ? extra.taxonomies : base.taxonomies,
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

  useEffect(() => {
    let cancelled = false;
    const cached = cachedDetail(slug);
    setFetched({ slug, listing: cached });
    if (cached) return;
    const url = catalogListing(slug, useCatalog.getState().items)?.siteUrl;
    void fetchWpListing({ data: { slug, url } })
      .then((row) => {
        if (cancelled) return;
        if (row) {
          detailCache.set(slug, { at: Date.now(), listing: row });
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
  if (!listing) {
    if (extra === undefined || status === "loading" || status === "idle") {
      return <PlaceLoading />;
    }
    throw notFound();
  }
  const km = listingDistanceKm(origin, listing);
  const nearby = catalogNearby(listing.slug, items);
  const maps =
    listing.lat && listing.lng
      ? `https://www.google.com/maps/dir/?api=1&destination=${listing.lat},${listing.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((listing.address || listing.name) + " Pondicherry")}`;
  const embed =
    listing.lat && listing.lng
      ? `https://www.google.com/maps?q=${listing.lat},${listing.lng}&z=16&output=embed`
      : "";
  const taxonomies = listing.taxonomies ?? [];
  const cafeTypes = listing.cafeTypes ?? [];
  const accessibility = listing.accessibility ?? [];
  const itinerary = listing.itinerary ?? [];
  const faqs = listing.faqs ?? [];
  const menuImages = listing.menuImages ?? [];
  const metaGroups = listing.metaGroups ?? [];
  const photos = listingPhotos(listing);
  const tel = listing.phone?.replace(/[^\d+]/g, "") ?? "";
  const metaTitles = new Set(metaGroups.map((g) => g.title.toLowerCase()));
  const showCafeTypes = cafeTypes.length > 0 && !metaTitles.has("cafe type");
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

          <div className="mt-3 flex flex-wrap gap-2 lg:hidden">
            <AddToTrip slug={listing.slug} name={listing.name} wpId={listing.wpId} />
            <Button variant="outline" size="sm" asChild className="h-10">
              <a href={maps} target="_blank" rel="noreferrer">
                <Navigation />
                Directions
              </a>
            </Button>
            {tel && (
              <Button variant="outline" size="sm" asChild className="h-10">
                <a href={`tel:${tel}`}>
                  <Phone />
                  Call
                </a>
              </Button>
            )}
            <a
              href={listing.siteUrl}
              target="_blank"
              rel="noreferrer"
              className="flex h-10 items-center gap-1.5 px-2 text-xs font-medium text-primary hover:underline"
            >
              Website
              <ExternalLink className="size-3.5" />
            </a>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-foreground/90">{listing.description}</p>

          {(listing.hours || listing.duration || listing.entry || listing.groupSize) && (
            <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {listing.hours && <Info label="Hours" value={listing.hours} icon={Clock3} />}
              {listing.duration && <Info label="Time needed" value={listing.duration} icon={Timer} />}
              {listing.entry && <Info label="Entry" value={listing.entry} icon={Ticket} />}
              {listing.groupSize && <Info label="Group size" value={listing.groupSize} icon={Users} />}
            </dl>
          )}

          {(listing.weeklyHours?.length ?? 0) > 0 && (
            <section className="mt-5">
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
                return (
                  <section key={group.title}>
                    <h2 className="text-sm font-semibold">{group.title}</h2>
                    {scored ? (
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
                    ) : (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {group.items.map((item) => (
                          <Badge key={item.label} className="text-[11px]">
                            {item.label}
                          </Badge>
                        ))}
                      </div>
                    )}
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

          {accessibility.length > 0 && (
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

          {taxonomies.length > 0 && (
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
              <a
                href={listing.siteUrl}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 items-center justify-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                View on xplorepondy.com
                <ExternalLink className="size-3.5" />
              </a>
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
        </aside>
      </div>

      {nearby.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-lg font-semibold">Nearby & related</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {nearby.map((l) => (
              <ListingCard key={l.slug} listing={l} layout="compact" />
            ))}
          </div>
        </section>
      )}
    </article>
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
