import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";

export type PendingAdd = {
  slug: string;
  name: string;
  currentDay?: number;
};

export function useAddDayModal() {
  const [pending, setPending] = useState<PendingAdd | null>(null);
  const pendingRef = useRef<PendingAdd | null>(null);
  pendingRef.current = pending;

  return {
    pending,
    isOpen: pending != null,
    open: (payload: PendingAdd) => setPending(payload),
    close: () => setPending(null),
    confirm: (day: number) => {
      const payload = pendingRef.current;
      setPending(null);
      return payload ? { ...payload, day } : null;
    },
  };
}

export function AddDayModal({
  pending,
  days,
  onClose,
  onChoose,
}: {
  pending: PendingAdd | null;
  days: number;
  onClose: () => void;
  onChoose: (day: number) => void;
}) {
  const open = pending != null;
  const moving = pending?.currentDay != null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      const n = Number(e.key);
      if (n >= 1 && n <= days) {
        e.preventDefault();
        onChoose(n);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, days, onClose, onChoose]);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-modal="true"
          className="fixed left-1/2 top-1/2 z-50 w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-card p-5 shadow-soft outline-none"
        >
          <Dialog.Title className="font-display text-lg font-semibold">
            {moving ? "Move to which day?" : "Add to which day?"}
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-muted-foreground">
            {pending?.name}
            {moving ? ` · currently day ${pending.currentDay}` : ""}
          </Dialog.Description>
          <div className="mt-4 flex flex-col gap-2">
            {Array.from({ length: days }, (_, i) => i + 1).map((d) => (
              <Button
                key={d}
                variant={d === pending?.currentDay ? "secondary" : "default"}
                className="h-11 w-full"
                onClick={() => onChoose(d)}
              >
                {moving ? "Move to" : "Add to"} day {d}
              </Button>
            ))}
          </div>
          <button
            type="button"
            className="mt-3 h-10 w-full text-sm text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            Cancel
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
