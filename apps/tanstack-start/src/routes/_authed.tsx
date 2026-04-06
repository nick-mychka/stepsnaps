import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";

import { Button } from "@stepsnaps/ui/button";

import { authClient } from "~/auth/client";

export const Route = createFileRoute("/_authed")({
  component: AuthedLayout,
});

function AuthedLayout() {
  const { data: session, isPending } = authClient.useSession();
  const navigate = useNavigate();

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!session) {
    void navigate({ to: "/", replace: true });
    return null;
  }

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container flex h-14 items-center justify-between">
          <button
            className="text-lg font-bold tracking-tight"
            onClick={() => navigate({ to: "/dashboard" })}
          >
            StepSnaps
          </button>
          <nav className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: "/dashboard" })}
            >
              Dashboard
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: "/snap/new" })}
            >
              Snap
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: "/journey/history" })}
            >
              History
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: "/settings/steps" })}
            >
              Steps
            </Button>
            <span className="text-muted-foreground text-sm">
              {session.user.name}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await authClient.signOut();
                await navigate({ to: "/", replace: true });
              }}
            >
              Sign out
            </Button>
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
