import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import { KeyRound, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WP_APP_PASSWORD_URL, wpLogin } from "@/lib/wp-api";
import { useHydrated } from "@/lib/use-hydrated";
import { useSession } from "@/store/session";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const hydrated = useHydrated();
  const user = useSession((s) => s.user);
  const lastUsername = useSession((s) => s.lastUsername);
  const setSession = useSession((s) => s.setSession);
  const setLastUsername = useSession((s) => s.setLastUsername);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && user) void navigate({ to: "/account" });
  }, [hydrated, user, navigate]);

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
      });
      toast.success(`Signed in as ${result.user.name}`);
      void navigate({ to: "/account" });
    } catch {
      setError("Could not reach WordPress. Check the connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        WordPress account
      </p>
      <h1 className="mt-1 font-display text-3xl font-semibold">Sign in to Xplore Pondy</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Same username as xplorepondy.com. Directory browsing stays open without an account — sign in
        to see your listings and saved trips.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="username">WordPress username</Label>
          <Input
            id="username"
            name="username"
            autoComplete="username"
            required
            defaultValue={hydrated ? lastUsername : ""}
            placeholder="your-wp-username"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Application password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
          />
        </div>
        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
        )}
        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          <LockKeyhole />
          {pending ? "Checking WordPress…" : "Sign in"}
        </Button>
      </form>

      <div className="mt-8 rounded-xl bg-card p-5 ring-1 ring-border/70">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <KeyRound className="size-4 text-primary" />
          How to get an application password
        </p>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          <li>Sign in to the xplorepondy.com WordPress dashboard.</li>
          <li>Open Users → Profile, then scroll to Application Passwords.</li>
          <li>Create one named “Xplore Pondy App” and paste it here.</li>
        </ol>
        <a
          href={WP_APP_PASSWORD_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex text-sm font-medium text-primary hover:underline"
        >
          Create one on xplorepondy.com
        </a>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Credentials go only to your WordPress site to verify the account. This app does not store
        the password.
      </p>
      <p className="mt-6 text-center text-sm">
        <Link to="/" className="text-muted-foreground hover:text-foreground">
          Continue without signing in
        </Link>
      </p>
    </div>
  );
}
