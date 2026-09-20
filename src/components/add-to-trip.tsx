import type { MouseEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CalendarCheck, CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/lib/use-hydrated";
import { useCatalog } from "@/store/catalog";
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

  function onClick(e?: MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();
    const added = toggle(slug, wpId ?? catalogId ?? mappedId);
    if (added) {
      toast.success(`Saved ${name} for your trip`, {
        description: "It’s in Trip → Saved. Tap Add there to put it on a day.",
        action: {
          label: "Open Saved",
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
        onClick={onClick}
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
    <Button className={cn("flex-1", className)} onClick={() => onClick()}>
      {active ? <CalendarCheck /> : <CalendarPlus />}
      {active ? "In trip list" : "Add to trip"}
    </Button>
  );
}
