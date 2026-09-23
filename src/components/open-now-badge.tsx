import { useEffect } from "react";
import type { Listing } from "@/lib/types";
import { openNowBadge } from "@/lib/hours";
import { cn } from "@/lib/utils";
import { queueOpenNow } from "@/store/catalog";

/** Mirrors WP `[open_now_badge]` on listing cards. */
export function OpenNowBadge({
  listing,
  className,
  compact = false,
}: {
  listing: Listing;
  className?: string;
  compact?: boolean;
}) {
  const badge = openNowBadge(listing);
  useEffect(() => {
    if (!badge) queueOpenNow(listing.slug);
  }, [listing.slug, badge]);
  if (!badge) return null;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
        badge.open ? "bg-open text-white" : "bg-closed text-white",
        compact && "max-w-[12rem] truncate",
        className,
      )}
      title={badge.label}
    >
      {badge.label}
    </span>
  );
}