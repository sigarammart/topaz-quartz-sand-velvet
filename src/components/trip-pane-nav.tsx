import { BookOpen, FileText, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export type TripPane = "locations" | "itinerary" | "map";

const PANES = [
  { id: "locations" as const, label: "Locations", icon: MapPin },
  { id: "itinerary" as const, label: "Itinerary", icon: FileText },
  { id: "map" as const, label: "Map", icon: BookOpen },
];

export function TripPaneBar({
  pane,
  onChange,
  badge,
}: {
  pane: TripPane;
  onChange: (pane: TripPane) => void;
  badge: number;
}) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
      aria-label="Trip views"
    >
      <ul className="grid grid-cols-3 items-center gap-2 px-3 py-2" role="tablist">
        {PANES.map((item) => {
          const active = pane === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                role="tab"
                id={`trip-pane-${item.id}`}
                aria-label={item.id === "itinerary" && badge > 0 ? `${item.label}, ${badge} places` : item.label}
                aria-selected={active}
                aria-controls={`trip-panel-${item.id}`}
                onClick={() => onChange(item.id)}
                className={cn(
                  "relative flex h-12 w-full items-center justify-center rounded-2xl text-xs font-semibold transition-colors",
                  active ? "flex-row gap-2 bg-primary text-primary-foreground" : "flex-col gap-0.5 text-muted-foreground",
                )}
              >
                <span className="relative">
                  <item.icon className="size-5" />
                  {item.id === "itinerary" && badge > 0 ? (
                    <span
                      aria-hidden="true"
                      className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-0.5 text-[10px] font-bold leading-none text-hero"
                    >
                      {badge > 99 ? "99+" : badge}
                    </span>
                  ) : null}
                </span>
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
