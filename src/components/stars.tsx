import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1 tabular-nums", className)}>
      <Star className="size-3.5 fill-star text-star" />
      <span className="text-sm font-medium">{value.toFixed(1)}</span>
    </span>
  );
}
