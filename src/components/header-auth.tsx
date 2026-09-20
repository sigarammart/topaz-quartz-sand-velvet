import { Link } from "@tanstack/react-router";
import { LogIn } from "lucide-react";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/lib/use-hydrated";
import { useSession } from "@/store/session";

export function HeaderAuth() {
  const { user, isPending } = useCurrentUserState();
  const hydrated = useHydrated();
  const wpUser = useSession((s) => s.user);

  if (isPending) {
    return <div className="size-8 shrink-0 animate-pulse rounded-full bg-muted" aria-hidden />;
  }

  if (user) {
    return (
      <div className="max-w-[11rem] overflow-hidden sm:max-w-none [&_span.text-sm.font-medium]:hidden sm:[&_span.text-sm.font-medium]:inline">
        <UserButton />
      </div>
    );
  }

  if (hydrated && wpUser) {
    return (
      <Button variant="ghost" size="sm" asChild>
        <Link to="/account">{wpUser.name.split(" ")[0]}</Link>
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="sm" asChild>
      <Link to="/login">
        <LogIn />
        <span className="hidden sm:inline">Sign in</span>
      </Link>
    </Button>
  );
}
