import type { MouseEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CalendarCheck, CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/lib/use-hydrated";
import { useAppLoggedIn } from "@/lib/app-session";
import { useAuthModal } from "@/store/auth-modal";
import { useCatalog } from "@/store/catalog";
import { fetchWpListing, updateWpTripStore } from "@/lib/wp-api";
import { useTrip } from "@/store/trip";

export function AddToTrip({
  slug,
  name,
  wpId,
  variant = "full",
  className,
}: {
  slug: string;
  name: string;
  wpId?: number;
  variant?: "full" | "icon";
  className?: string;
}) {
  const hydrated = useHydrated();
  const navigate = useNavigate();
  const on = useTrip((s) => s.tempTrip.includes(slug));
  const toggle = useTrip((s) => s.toggleTempTrip);
  const catalogId = useCatalog((s) => s.items.find((l) => l.slug === slug)?.wpId);
  const mappedId = useTrip((s) => s.wpIdsBySlug?.[slug]);
  const active = hydrated && on;
  const wpUserCheck = useAppLoggedIn();
  const showLogin = useAuthModal((s) => s.show);
  const accountEmail = wpUserCheck.wpUser?.email || wpUserCheck.grokUser?.primaryEmail || "";
  const loggedIn = wpUserCheck.loggedIn;
  const postId = wpId ?? catalogId ?? mappedId;

  async function onClick(e?: MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();
    if (wpUserCheck.isPending) return;
    if (!loggedIn) {
      showLogin({ reason: "add-trip", slug, name, wpId: postId, next: "/trip" });
      return;
    }
    if (!accountEmail) {
      toast.error("Your signed-in account email is not available.");
      return;
    }

    let resolvedPostId = postId;
    if (!resolvedPostId) {
      const liveListing = await fetchWpListing({
        data: { slug },
      }).catch(() => null);
      resolvedPostId = liveListing?.wpId;
    }

    if (!resolvedPostId) {
      toast.error("This listing could not be linked to WordPress.");
      return;
    }

    const wasAdded = on;
    const operation = wasAdded ? "remove" : "add";
    const result = await updateWpTripStore({
      data: {
        email: accountEmail,
        operation,
        listingId: resolvedPostId,
      },
    });

    if (!result.ok) {
      toast.error(result.error || "Could not update your trip list.");
      return;
    }

    const added = !wasAdded;
    toggle(slug, resolvedPostId);
    if (added) {
      toast.success(`Saved ${name} for your trip`, {
        description: "It’s in Trip. Tap Add there to put it on a day.",
        action: {
          label: "Open Trip",
          onClick: () => {
            void navigate({ to: "/trip", search: { tab: "saved" } });
          },
        },
      });
    } else {
      toast.success(`Removed ${name} from the trip list`);
    }
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        aria-pressed={active}
        aria-label={active ? `Remove ${name} from trip list` : `Add ${name} to trip`}
        onClick={() => void onClick()}
        className={cn(
          "flex size-11 items-center justify-center rounded-full bg-card/90 text-foreground shadow-soft ring-1 ring-border/70 backdrop-blur-sm transition-colors hover:bg-card",
          active && "bg-primary text-primary-foreground ring-primary",
          className,
        )}
      >
        {active ? <CalendarCheck className="size-4" /> : <CalendarPlus className="size-4" />}
      </button>
    );
  }

  return (
    <Button className={cn("flex-1", className)} onClick={() => void onClick()}>
      {active ? <CalendarCheck /> : <CalendarPlus />}
      {active ? "In trip list" : "Add to trip"}
    </Button>
  );
}
