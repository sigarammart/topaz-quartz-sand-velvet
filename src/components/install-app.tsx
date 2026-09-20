import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Download, EllipsisVertical, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isAndroidUserAgent, isStandaloneDisplay, type BeforeInstallPromptEvent } from "@/lib/android";
import { cn } from "@/lib/utils";

export function useAppInstall() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [standalone, setStandalone] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setStandalone(isStandaloneDisplay());
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
      setStandalone(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!deferred) return false;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    setDeferred(null);
    if (outcome === "accepted") setInstalled(true);
    return outcome === "accepted";
  }

  return { deferred, standalone, installed, install, android: isAndroidUserAgent() };
}

export function InstallBanner() {
  const { deferred, standalone, installed, install } = useAppInstall();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setHidden(sessionStorage.getItem("xp-hide-install") === "1");
  }, []);

  if (standalone || installed || hidden || !deferred) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[4.5rem] z-30 px-3 md:bottom-4">
      <div className="pointer-events-auto mx-auto flex max-w-lg items-center gap-3 rounded-2xl bg-foreground px-3 py-2.5 text-background shadow-soft">
        <Smartphone className="size-5 shrink-0" />
        <p className="min-w-0 flex-1 text-sm">
          Install <span className="font-semibold">Xplore Pondy</span> on your phone
        </p>
        <Button
          size="sm"
          className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => void install()}
        >
          Install
        </Button>
        <button
          type="button"
          className="flex size-8 shrink-0 items-center justify-center rounded-full hover:bg-background/10"
          aria-label="Dismiss"
          onClick={() => {
            sessionStorage.setItem("xp-hide-install", "1");
            setHidden(true);
          }}
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}

export function InstallHeaderButton() {
  const { deferred, standalone, install } = useAppInstall();
  if (standalone) return null;
  if (deferred) {
    return (
      <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => void install()}>
        <Download className="size-4" />
        Install
      </Button>
    );
  }
  return (
    <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
      <Link to="/get-app">
        <Smartphone className="size-4" />
        App
      </Link>
    </Button>
  );
}

export function AndroidInstallGuide({ className }: { className?: string }) {
  const { deferred, standalone, install, android } = useAppInstall();

  if (standalone) {
    return (
      <p className={cn("rounded-xl bg-accent px-4 py-3 text-sm text-accent-foreground", className)}>
        You're in the app. It opens full-screen from your home screen.
      </p>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {deferred ? (
        <Button size="lg" className="w-full" onClick={() => void install()}>
          <Download />
          Install on this phone
        </Button>
      ) : (
        <ol className="space-y-3 text-sm">
          <li className="flex gap-3 rounded-xl bg-card p-3 ring-1 ring-border/70">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              1
            </span>
            <span>
              Open this site in <strong>Chrome</strong> on Android
              {android ? " — you're already there." : "."}
            </span>
          </li>
          <li className="flex gap-3 rounded-xl bg-card p-3 ring-1 ring-border/70">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              2
            </span>
            <span className="flex items-start gap-1">
              Tap the menu <EllipsisVertical className="mt-0.5 inline size-3.5" /> then <strong>Install app</strong> or{" "}
              <strong>Add to Home screen</strong>.
            </span>
          </li>
          <li className="flex gap-3 rounded-xl bg-card p-3 ring-1 ring-border/70">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              3
            </span>
            <span>Launch Xplore Pondy from your home screen — no browser chrome, bottom tabs, your trips saved on the phone.</span>
          </li>
        </ol>
      )}
    </div>
  );
}
