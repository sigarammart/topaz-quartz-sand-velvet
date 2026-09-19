import { Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/lib/use-hydrated";
import { useTrip } from "@/store/trip";

export function SaveButton({
  slug,
  name,
  className,
}: {
  slug: string;
  name: string;
  className?: string;
}) {
  const hydrated = useHydrated();
  const saved = useTrip((s) => s.saved.includes(slug));
  const toggle = useTrip((s) => s.toggleSaved);
  const on = hydrated && saved;

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `Remove ${name} from saved` : `Save ${name}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(slug);
        toast.success(on ? `Removed ${name}` : `Saved ${name}`);
      }}
      className={cn(
        "flex size-11 items-center justify-center rounded-full bg-card/90 text-foreground shadow-soft ring-1 ring-border/70 backdrop-blur-sm transition-colors",
        on && "text-destructive",
        className,
      )}
    >
      <Heart className={cn("size-4", on && "fill-destructive")} />
    </button>
  );
}
