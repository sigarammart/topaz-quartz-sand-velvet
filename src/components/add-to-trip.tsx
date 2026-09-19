import { CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { AddDayModal, useAddDayModal } from "@/components/add-day-modal";
import { Button } from "@/components/ui/button";
import { useTrip } from "@/store/trip";

export function AddToTrip({ slug, name }: { slug: string; name: string }) {
  const days = useTrip((s) => s.days);
  const addToDay = useTrip((s) => s.addToDay);
  const addDay = useAddDayModal();

  return (
    <>
      <Button className="flex-1" onClick={() => addDay.open({ slug, name })}>
        <CalendarPlus />
        Add to trip
      </Button>
      <AddDayModal
        pending={addDay.pending}
        days={days}
        onClose={addDay.close}
        onChoose={(d) => {
          const payload = addDay.confirm(d);
          if (!payload) return;
          addToDay(payload.slug, d);
          toast.success(`Added to day ${d}`);
        }}
      />
    </>
  );
}
