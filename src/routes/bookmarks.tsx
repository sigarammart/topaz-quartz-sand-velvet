import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, Map as MapIcon, X } from "lucide-react";
import { ListingCard } from "@/components/listing-card";
import { ListingMap } from "@/components/listing-map";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useHydrated } from "@/lib/use-hydrated";
import { fetchWpBookmarks } from "@/lib/wp-api";
import { useAppLoggedIn } from "@/lib/app-session";
import { resolveListing, useCatalog } from "@/store/catalog";
import { useAuthModal } from "@/store/auth-modal";
import { useTrip } from "@/store/trip";

export const Route = createFileRoute("/bookmarks")({ component: SavedPage });

function SavedPage() {
  const hydrated = useHydrated();
  const saved = useTrip((s) => s.saved);
  const wpIds = useTrip((s) => s.wpIdsBySlug);
  const items = useCatalog((s) => s.items);
  const [remoteBookmarkIds, setRemoteBookmarkIds] = useState<number[]>([]);
  const { wpUser, grokUser } = useAppLoggedIn();
  const accountEmail = wpUser?.email || grokUser?.primaryEmail || "";
  const showLogin = useAuthModal((s) => s.show);
  const { loggedIn, isPending } = useAppLoggedIn();
  useEffect(() => {
    if (!hydrated || !loggedIn || !accountEmail) return;
    let cancelled = false;

    void fetchWpBookmarks({ data: { email: accountEmail } }).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setRemoteBookmarkIds(result.bookmarkIds);
      } else {
        setRemoteBookmarkIds([]);
      }
    }).catch(() => {
      if (!cancelled) setRemoteBookmarkIds([]);
    });

    return () => {
      cancelled = true;
    };
  }, [hydrated, loggedIn, accountEmail]);

  const listings = hydrated
    ? saved
        .map((slug) => {
          const hit = resolveListing(slug, items);
          if (hit) return hit;
          const id = wpIds?.[slug];
          return id ? items.find((row) => row.wpId === id) : undefined;
        })
        .filter((l): l is NonNullable<typeof l> => l != null)
    : [];

  const remoteListings = remoteBookmarkIds
    .map((id) => items.find((row) => row.wpId === id))
    .filter((l): l is NonNullable<typeof l> => !!l);

  const extraFromMeta = remoteListings.filter(
    (l) => !listings.some((row) => row.slug === l.slug),
  );
  const shown = [...listings, ...extraFromMeta];

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Bookmark</p>
      <h1 className="mt-1 font-display text-3xl font-semibold">Your Pondy bookmarks</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Places you bookmark here are synced with your xplorepondy.com account.
      </p>

      {isPending ? (
        <p className="mt-16 text-center text-sm text-muted-foreground">Loading bookmarks…</p>
      ) : !loggedIn ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <Bookmark className="size-8 text-primary" />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Sign in with your xplorepondy.com account to see and add bookmarks.
          </p>
          <Button className="mt-5" onClick={() => showLogin({ reason: "bookmark", next: "/bookmarks" })}>
            Sign in to bookmark
          </Button>
        </div>
      ) : shown.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <Bookmark className="size-8 text-primary" />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Nothing bookmarked yet. Tap the bookmark icon on a place, café, or stay.
          </p>
          <Button asChild className="mt-5">
            <Link to="/explore">Start exploring</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((l) => (
            <ListingCard key={l.slug} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}