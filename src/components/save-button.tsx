import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/lib/use-hydrated";
import { useAppLoggedIn } from "@/lib/app-session";
import { useAuthModal } from "@/store/auth-modal";
import { useTrip } from "@/store/trip";
import { resolveListing, useCatalog } from "@/store/catalog";
import { syncWpBookmarks } from "@/lib/wp-api";

export function SaveButton({
  slug,
  name,
  wpId,
  className,
}: {
  slug: string;
  name: string;
  wpId?: number;
  className?: string;
}) {
  const hydrated = useHydrated();
  const saved = useTrip((s) => s.saved.includes(slug));
  const toggle = useTrip((s) => s.toggleSaved);
  const { loggedIn, isPending, wpUser, grokUser } = useAppLoggedIn();
  const catalog = useCatalog((s) => s.items);
  const showLogin = useAuthModal((s) => s.show);
  const on = hydrated && saved;

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `Remove ${name} from bookmarks` : `Bookmark ${name}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isPending) return;
        if (!loggedIn) {
          showLogin({ reason: "bookmark", slug, name, wpId, next: "/saved" });
          return;
        }
        const added = toggle(slug, wpId);
        const email = wpUser?.email || grokUser?.primaryEmail || "";
        const savedSlugs = useTrip.getState().saved;
        const bookmarkIds = savedSlugs
          .map((savedSlug) => resolveListing(savedSlug, catalog)?.wpId)
          .filter((id): id is number => typeof id === "number");

        if (email) {
          void syncWpBookmarks({
            data: {
              email,
              bookmarkIds,
            },
          }).then((result) => {
            if (!result.ok) {
              toast.error(result.error || "Bookmark could not be synced with xplorepondy.com.");
              return;
            }
            toast.success(added ? `Bookmarked ${name}` : `Removed ${name} from bookmarks`);
          }).catch(() => {
            toast.error("Bookmark could not be synced with xplorepondy.com.");
          });
        } else {
          toast.success(added ? `Bookmarked ${name}` : `Removed ${name} from bookmarks`);
        }
      }}
      className={cn(
        "flex size-11 items-center justify-center rounded-full bg-card/90 text-foreground shadow-soft ring-1 ring-border/70 backdrop-blur-sm transition-colors",
        on && "text-primary",
        className,
      )}
    >
      <Bookmark className={cn("size-4", on && "fill-primary")} />
    </button>
  );
}
