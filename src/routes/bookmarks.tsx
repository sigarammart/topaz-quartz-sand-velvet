import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { ListingCard } from "@/components/listing-card";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/lib/use-hydrated";
import { useAppLoggedIn } from "@/lib/app-session";
import { resolveListing, useCatalog } from "@/store/catalog";
import { useAuthModal } from "@/store/auth-modal";
import { useSession } from "@/store/session";
import { useTrip } from "@/store/trip";

export const Route = createFileRoute("/bookmarks")({ component: SavedPage });

function SavedPage() {
  const hydrated = useHydrated();
  const saved = useTrip((s) => s.saved);
  const wpIds = useTrip((s) => s.wpIdsBySlug);
  const items = useCatalog((s) => s.items);
  const bookmarkIds = useSession((s) => s.bookmarkIds);
  const showLogin = useAuthModal((s) => s.show);
  const { loggedIn, isPending } = useAppLoggedIn();
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

  const extraFromMeta =
    hydrated && loggedIn
      ? bookmarkIds
          .map((id) => items.find((row) => row.wpId === id))
          .filter((l): l is NonNullable<typeof l> => !!l && !listings.some((row) => row.slug === l.slug))
      : [];
  const shown = [...listings, ...extraFromMeta];

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Bookmark</p>
      <h1 className="mt-1 font-display text-3xl font-semibold">Your Pondy bookmarks</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Places you bookmark here are the same JetEngine save-bookmark list as xplorepondy.com.
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