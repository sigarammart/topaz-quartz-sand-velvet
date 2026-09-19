import { useState } from "react";
import { CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTrip } from "@/store/trip";

export function AddToTrip({ slug, name }: { slug: string; name: string }) {
  const days = useTrip((s) => s.days);
  const addToDay = useTrip((s) => s.addToDay);
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="flex-1">
          <CalendarPlus />
          Add to trip
        </Button>
      </SheetTrigger>
      <SheetContent title={`Add ${name}`}>
        <p className="mb-4 text-sm text-muted-foreground">Choose a day in your itinerary.</p>
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: days }, (_, i) => i + 1).map((day) => (
            <Button
              key={day}
              variant="outline"
              onClick={() => {
                addToDay(slug, day);
                toast.success(`Added to day ${day}`);
                setOpen(false);
              }}
            >
              Day {day}
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
