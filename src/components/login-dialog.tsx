import { FormEvent, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Bookmark, CalendarPlus, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { useAppLoggedIn } from "@/lib/app-session";
import { wpLogin } from "@/lib/wp-api";
import { useAuthModal } from "@/store/auth-modal";
import { useCatalog } from "@/store/catalog";
import { useSession } from "@/store/session";
import { useTrip } from "@/store/trip";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.55-5.17 3.55-8.65Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.72-2.47 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.63H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.37l4-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.61 4.58 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.27 6.63l4 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

export function LoginDialog() {
  const open = useAuthModal((s) => s.open);
  const hide = useAuthModal((s) => s.hide);
  const reason = useAuthModal((s) => s.reason);
  const next = useAuthModal((s) => s.next);
  const slug = useAuthModal((s) => s.slug);
  const name = useAuthModal((s) => s.name);
  const wpId = useAuthModal((s) => s.wpId);
  const { grokUser } = useAppLoggedIn();
  const navigate = useNavigate();
  const setSession = useSession((s) => s.setSession);
  const lastUsername = useSession((s) => s.lastUsername);
  const setLastUsername = useSession((s) => s.setLastUsername);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oauthPending, setOauthPending] = useState<string | null>(null);

  const title = reason === "bookmark" ? "Sign in to bookmark" : "Sign in to plan a trip";
  const blurb =
    reason === "bookmark"
      ? "Bookmarks sync with your xplorepondy.com save-bookmark list."
      : "Sign in to add places to a trip and keep them across devices.";

  function finishAfterLogin(bookmarkIds: number[] = []) {
    const listings = useCatalog.getState().items;
    if (bookmarkIds.length) useTrip.getState().syncBookmarks(listings, bookmarkIds);
    else useTrip.getState().syncBookmarks(listings);
    if (slug && reason === "bookmark") {
      useTrip.getState().toggleSaved(slug, wpId);
      toast.success(`Bookmarked ${name || "listing"}`);
    } else if (slug && reason === "add-trip") {
      useTrip.getState().toggleTempTrip(slug, wpId);
      toast.success(`Added ${name || "listing"} to your trip`);
    }
    hide();
    if (next === "/trip" || reason === "trip" || reason === "add-trip") {
      void navigate({ to: "/trip" });
    } else if (next === "/saved" || reason === "bookmark") {
      void navigate({ to: "/saved" });
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const username = String(form.get("username") ?? "").trim();
    const password = String(form.get("password") ?? "");
    setPending(true);
    setError(null);
    setLastUsername(username);
    try {
      const result = await wpLogin({ data: { username, password } });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSession({
        user: result.user,
        myListings: result.myListings,
        myTrips: result.myTrips,
        method: result.method,
        bookmarkIds: result.bookmarkIds,
      });
      toast.success(`Signed in as ${result.user.name}`);
      finishAfterLogin(result.bookmarkIds);
    } catch {
      setError("Could not reach WordPress. Check the connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={(nextOpen) => (!nextOpen ? hide() : undefined)}>
      <SheetContent side="center" title={title} className="max-h-[90vh] overflow-y-auto">
        <p className="-mt-2 mb-4 text-sm text-muted-foreground">{blurb}</p>
        {authEnabled && !grokUser ? (
          <div className="space-y-2">
            {GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                type="button"
                variant={p.idp === "google" ? "outline" : "ghost"}
                className="w-full bg-background"
                disabled={oauthPending != null}
                onClick={() => {
                  setOauthPending(p.providerId);
                  const callback =
                    next || (reason === "trip" || reason === "add-trip" ? "/trip" : "/saved");
                  void signIn(p.providerId, { callbackURL: callback }).catch(() => setOauthPending(null));
                }}
              >
                {p.idp === "google" ? <GoogleMark /> : null}
                {oauthPending === p.providerId ? "Opening Google…" : `Continue with ${p.label}`}
              </Button>
            ))}
          </div>
        ) : null}

        <div className="my-4 flex items-center gap-3 text-[11px] uppercase tracking-wide text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          WordPress
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="modal-username">Username</Label>
            <Input
              id="modal-username"
              name="username"
              autoComplete="username"
              required
              defaultValue={lastUsername}
              placeholder="your-wp-username"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="modal-password">Password or application password</Label>
            <Input
              id="modal-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            <LockKeyhole />
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          {reason === "bookmark" ? <Bookmark className="size-3.5" /> : <CalendarPlus className="size-3.5" />}
          Your xplorepondy.com bookmarks and trips stay on your account.
        </p>
      </SheetContent>
    </Sheet>
  );
}
