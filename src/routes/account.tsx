import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Bookmark, CalendarDays, Clock3, LogOut, MapPin, RefreshCw } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { ListingCard } from "@/components/listing-card";
import { Button } from "@/components/ui/button";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { signOut } from "@/lib/auth/client";
import { hasGateSessionMarker } from "@/lib/auth/gate-session-marker";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { fetchWpAuthorContent, fetchWpBookmarks, fetchWpTripStore, fetchWpUserTrips, type WpTrip } from "@/lib/wp-api";
import { useHydrated } from "@/lib/use-hydrated";
import { useSession } from "@/store/session";
import { resolveListing, useCatalog } from "@/store/catalog";
import { useTrip } from "@/store/trip";

export const Route = createFileRoute("/account")({ component: AccountPage });

function TripList({ trips, loading }: { trips: WpTrip[]; loading: boolean }) {
  if (loading) return <p className="mt-3 text-sm text-muted-foreground">Loading trips…</p>;
  if (trips.length === 0) {
    return (
      <p className="mt-3 text-sm text-muted-foreground">
        No trips yet.{" "}
        <Link to="/trip" className="font-medium text-primary hover:underline">
          Plan a trip
        </Link>{" "}
        and published user_trip posts from xplorepondy.com will appear here.
      </p>
    );
  }
  return (
    <ul className="mt-4 space-y-2">
      {trips.map((t) => (
        <li key={t.slug}>
          {typeof t.id === "number" ? (
            <Link
              to="/trip"
              search={{ wpId: t.id }}
              className="flex items-center justify-between gap-3 rounded-xl bg-card px-4 py-3 ring-1 ring-border/70 hover:bg-muted"
            >
              <span>
                <span className="block font-medium">{t.title}</span>
                {t.date && <span className="text-xs text-muted-foreground">{t.date}</span>}
              </span>
              <ArrowRight className="size-4 shrink-0 text-primary" />
            </Link>
          ) : (
            <a
              href={t.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between gap-3 rounded-xl bg-card px-4 py-3 ring-1 ring-border/70 hover:bg-muted"
            >
              <span>
                <span className="block font-medium">{t.title}</span>
                {t.date && <span className="text-xs text-muted-foreground">{t.date}</span>}
              </span>
              <ArrowRight className="size-4 shrink-0 text-primary" />
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}

const RECENTLY_VIEWED_KEY = "xplore-pondy-recently-viewed";
const MAX_RECENTLY_VIEWED = 20;

type AccountTab = "saved" | "bookmarks" | "trips" | "viewed";

const ACCOUNT_TABS: { id: AccountTab; label: string; icon: typeof CalendarDays }[] = [
  { id: "saved", label: "Saved", icon: CalendarDays },
  { id: "bookmarks", label: "Bookmarks", icon: Bookmark },
  { id: "trips", label: "Created Trips", icon: CalendarDays },
  { id: "viewed", label: "Recently Viewed", icon: Clock3 },
];

function ActivityListingGrid({
  title,
  ids,
  fallbackSlugs,
  catalog,
  wpIdsBySlug,
  emptyText,
  action,
}: {
  title: string;
  ids: number[];
  fallbackSlugs: string[];
  catalog: ReturnType<typeof useCatalog.getState>["items"];
  wpIdsBySlug: Record<string, number>;
  emptyText: string;
  action: ReactNode;
}) {
  const byId = new Map(catalog.map((listing) => [listing.wpId, listing]));
  const remote = ids.map((id) => byId.get(id)).filter((l): l is NonNullable<typeof l> => !!l);
  const local = fallbackSlugs
    .map((slug) => {
      const hit = resolveListing(slug, catalog);
      if (hit) return hit;
      const id = wpIdsBySlug[slug];
      return typeof id === "number" ? byId.get(id) : undefined;
    })
    .filter((l): l is NonNullable<typeof l> => !!l);
  const shown = [...remote, ...local.filter((l) => !remote.some((r) => r.slug === l.slug))];

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        {shown.length > 0 && action}
      </div>
      {shown.length === 0 ? (
        <div className="mt-4 rounded-xl bg-card p-8 text-center ring-1 ring-border/70">
          <MapPin className="mx-auto size-7 text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">{emptyText}</p>
          <div className="mt-4">{action}</div>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((listing) => <ListingCard key={listing.slug} listing={listing} />)}
        </div>
      )}
    </div>
  );
}

function AccountPage() {
  const hydrated = useHydrated();
  const navigate = useNavigate();
  const { user: googleUser, isPending } = useCurrentUserState();
  const user = useSession((s) => s.user);
  const myListings = useSession((s) => s.myListings);
  const myTrips = useSession((s) => s.myTrips);
  const method = useSession((s) => s.method);
  const setSession = useSession((s) => s.setSession);
  const clearSession = useSession((s) => s.clearSession);
  const tripTitle = useTrip((s) => s.title);
  const tripStarted = useTrip((s) => s.started);
  const tempTrip = useTrip((s) => s.tempTrip);
  const savedSlugs = useTrip((s) => s.saved);
  const wpIdsBySlug = useTrip((s) => s.wpIdsBySlug);
  const catalog = useCatalog((s) => s.items);
  const [refreshing, setRefreshing] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [recentTrips, setRecentTrips] = useState<WpTrip[]>([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AccountTab>("trips");
  const [remoteSavedIds, setRemoteSavedIds] = useState<number[]>([]);
  const [remoteBookmarkIds, setRemoteBookmarkIds] = useState<number[]>([]);
  const [recentViewedSlugs, setRecentViewedSlugs] = useState<string[]>([]);
  const gateSession = typeof document !== "undefined" && hasGateSessionMarker();

  useEffect(() => {
    if (!hydrated) return;
    try {
      const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) {
        setRecentViewedSlugs(parsed.filter((slug): slug is string => typeof slug === "string").slice(0, MAX_RECENTLY_VIEWED));
      }
    } catch {
      setRecentViewedSlugs([]);
    }
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const email = googleUser?.primaryEmail ?? user?.email ?? "";
    if (!email) return;
    let cancelled = false;
    void Promise.all([
      fetchWpTripStore({ data: { email } }),
      fetchWpBookmarks({ data: { email } }),
    ]).then(([savedResult, bookmarkResult]) => {
      if (cancelled) return;
      setRemoteSavedIds(savedResult.ok ? savedResult.listingIds : []);
      setRemoteBookmarkIds(bookmarkResult.ok ? bookmarkResult.bookmarkIds : []);
    }).catch(() => {
      if (!cancelled) {
        setRemoteSavedIds([]);
        setRemoteBookmarkIds([]);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [hydrated, googleUser?.primaryEmail, user?.email]);

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    setTripsLoading(true);
    void (async () => {
      try {
        if (user?.id) {
          const result = await fetchWpAuthorContent({ data: { authorId: user.id } });
          if (cancelled) return;
          setSession({
            user,
            myListings: result.myListings,
            myTrips: result.myTrips,
            method: method ?? "application-password",
          });
        }
        const tripEmail = googleUser?.primaryEmail ?? user?.email ?? "";
        if (tripEmail) {
          const recent = await fetchWpUserTrips({ data: { email: tripEmail } });
          if (!cancelled) setRecentTrips(recent.trips);
        } else if (!cancelled) {
          setRecentTrips([]);
        }
      } catch {
        /* keep whatever we already have */
      } finally {
        if (!cancelled) setTripsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrated, user?.id, user?.email, googleUser?.primaryEmail]);

  if (isPending || !hydrated) {
    return <div className="py-16 text-center text-sm text-muted-foreground">Loading account…</div>;
  }

  if (!googleUser && !user) return <RedirectToSignIn />;

  const name = googleUser?.displayName ?? user?.name ?? "Traveller";
  const email = googleUser?.primaryEmail ?? user?.email;
  const avatar = googleUser?.profileImageUrl ?? user?.avatar;

  async function refresh() {
    if (!user) return;
    setRefreshing(true);
    try {
      const result = await fetchWpAuthorContent({ data: { authorId: user.id } });
      setSession({
        user,
        myListings: result.myListings,
        myTrips: result.myTrips,
        method: method ?? "application-password",
      });
      toast.success("Account updated from WordPress");
    } catch {
      toast.error("Could not refresh from WordPress");
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Account</p>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {avatar ? (
            <img src={avatar} alt="" className="size-16 rounded-full object-cover" />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
              {name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="font-display text-3xl font-semibold">{name}</h1>
            <p className="text-sm text-muted-foreground">
              {googleUser ? "Signed in with Google" : `@${user?.slug}`}
              {email ? ` · ${email}` : ""}
            </p>
            {user?.roles && user.roles.length > 0 && (
              <p className="mt-1 text-xs uppercase tracking-wide text-primary">{user.roles.join(" · ")}</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {user && (
            <Button variant="outline" onClick={() => void refresh()} disabled={refreshing}>
              <RefreshCw className={refreshing ? "animate-spin" : ""} />
              Refresh
            </Button>
          )}
          {!gateSession && (
            <Button
              variant="outline"
              disabled={signingOut}
              onClick={() => {
                setSigningOut(true);
                clearSession();
                if (googleUser) {
                  void signOut()
                    .then(() => navigate({ to: "/" }))
                    .catch(() => setSigningOut(false));
                } else {
                  void navigate({ to: "/" });
                }
              }}
            >
              <LogOut />
              {signingOut ? "Signing out…" : "Sign out"}
            </Button>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-xl bg-card p-5 ring-1 ring-border/70">
        <h2 className="font-display text-lg font-semibold">
          {googleUser ? "Google account" : "Connected to xplorepondy.com"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {googleUser
            ? "Your trips and saved places stay on this device and follow this Google sign-in."
            : `Signed in with ${method === "application-password" ? "an application password" : "your WordPress login"}.`}
        </p>
        {tripStarted && (
          <Button asChild className="mt-4" variant="outline">
            <Link to="/trip">{tripTitle || "Open current trip"}</Link>
          </Button>
        )}
      </div>

      {user && (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold">Your listings</h2>
          {myListings.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No listings are attached to this WordPress user. Published directory listings still appear under Explore for everyone.
            </p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myListings.map((l) => <ListingCard key={l.slug} listing={l} />)}
            </div>
          )}
        </section>
      )}

      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold">Your activity</h2>

        <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-card p-2 ring-1 ring-border/70 sm:grid-cols-4">
          {ACCOUNT_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {activeTab === "saved" && (
          <ActivityListingGrid
            title="Saved places"
            ids={remoteSavedIds}
            fallbackSlugs={tempTrip}
            catalog={catalog}
            wpIdsBySlug={wpIdsBySlug}
            emptyText="No places saved to your trip yet."
            action={
              <Button asChild variant="outline" size="sm">
                <Link to="/explore">Explore places</Link>
              </Button>
            }
          />
        )}

        {activeTab === "bookmarks" && (
          <ActivityListingGrid
            title="Bookmarked places"
            ids={remoteBookmarkIds}
            fallbackSlugs={savedSlugs}
            catalog={catalog}
            wpIdsBySlug={wpIdsBySlug}
            emptyText="No bookmarks yet."
            action={
              <Button asChild variant="outline" size="sm">
                <Link to="/explore">Explore places</Link>
              </Button>
            }
          />
        )}

        {activeTab === "trips" && (
          <div className="mt-5">
            <TripList
              trips={myTrips.length ? myTrips : recentTrips}
              loading={tripsLoading && myTrips.length === 0 && recentTrips.length === 0}
            />
          </div>
        )}

        {activeTab === "viewed" && (
          <ActivityListingGrid
            title="Recently viewed"
            ids={[]}
            fallbackSlugs={recentViewedSlugs}
            catalog={catalog}
            wpIdsBySlug={wpIdsBySlug}
            emptyText="Places you view will appear here."
            action={
              <Button asChild variant="outline" size="sm">
                <Link to="/explore">Explore places</Link>
              </Button>
            }
          />
        )}
      </section>

      <p className="mt-10 text-sm">
        <Link to="/explore" className="font-medium text-primary hover:underline">
          Browse the live directory
        </Link>
      </p>
    </div>
  );
}
