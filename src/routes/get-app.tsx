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

      <div className="mt-8 rounded-2xl bg-card p-4 text-sm ring-1 ring-border/70">
        <p className="font-semibold">Show Install on xplorepondy.com</p>
        <p className="mt-1 text-muted-foreground">
          Visitors on the main site see this bar. Paste the script into WordPress (Elementor HTML, footer, or WPCode):
        </p>
        <div className="mt-3 flex items-center gap-2.5 rounded-[18px] bg-foreground px-2.5 py-2 text-background">
          <img src="/icon-192.png" alt="" className="size-10 rounded-xl bg-logo-bg object-cover" />
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] uppercase tracking-[0.14em] text-background/60">Xplore Pondy</span>
            <span className="block text-sm font-semibold">Install XP App</span>
          </span>
          <span className="rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground">Install</span>
        </div>
        <code className="mt-3 block overflow-x-auto rounded-xl bg-background px-3 py-2 text-[12px]">
          {'<script src="https://app.xplorepondy.com/xp-install.js" defer></script>'}
        </code>
        <Button asChild className="mt-3 w-full">
          <a href="/xp-app-install.zip" download="xp-app-install.zip">
            Download WordPress plugin
          </a>
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          WordPress → Plugins → Add New → Upload Plugin → Activate. The bar then appears on xplorepondy.com.
        </p>
      </div>

      <Button asChild variant="outline" className="mt-8 w-full">
        <Link to="/">Back to explore</Link>
      </Button>
    </div>
  );
}
