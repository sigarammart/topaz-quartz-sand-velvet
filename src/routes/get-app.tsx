import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, MapPinned, Smartphone, WifiOff } from "lucide-react";
import { AndroidInstallGuide } from "@/components/install-app";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/get-app")({ component: GetAppPage });

function GetAppPage() {
  return (
    <div className="mx-auto max-w-lg">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Android app</p>
      <h1 className="mt-1 font-display text-3xl font-semibold">Xplore Pondy on your phone</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Same listings, trip form, and map — installed like an app from Chrome. No Play Store wait.
      </p>

      <div className="mt-6 overflow-hidden rounded-2xl">
        <img src="/images/promenade.jpg" alt="" className="h-40 w-full object-cover" />
      </div>

      <AndroidInstallGuide className="mt-6" />

      <ul className="mt-8 space-y-3 text-sm">
        <li className="flex gap-3">
          <Smartphone className="mt-0.5 size-4 text-primary" />
          Opens full-screen from the home screen
        </li>
        <li className="flex gap-3">
          <MapPinned className="mt-0.5 size-4 text-primary" />
          Near-me distance, map pins, and your trip days stay on the device
        </li>
        <li className="flex gap-3">
          <WifiOff className="mt-0.5 size-4 text-primary" />
          Saved places and the itinerary work even if the signal drops
        </li>
        <li className="flex gap-3">
          <Compass className="mt-0.5 size-4 text-primary" />
          Live catalog still syncs from xplorepondy.com
        </li>
      </ul>

      <Button asChild variant="outline" className="mt-8 w-full">
        <Link to="/">Back to explore</Link>
      </Button>
    </div>
  );
}
