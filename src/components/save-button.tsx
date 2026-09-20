import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/lib/use-hydrated";
import { useAppLoggedIn } from "@/lib/app-session";
import { useAuthModal } from "@/store/auth-modal";
import { useTrip } from "@/store/trip";

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
  const { loggedIn, isPending } = useAppLoggedIn();
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
        toast.success(added ? `Bookmarked ${name}` : `Removed ${name} from bookmarks`);
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
