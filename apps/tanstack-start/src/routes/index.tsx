import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { Button } from "@stepsnaps/ui/button";

import { authClient } from "~/auth/client";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session, isPending } = authClient.useSession();
  const navigate = useNavigate();

  if (isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    );
  }

  if (session) {
    void navigate({ to: "/dashboard", replace: true });
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-5xl font-extrabold tracking-tight">StepSnaps</h1>
        <p className="text-muted-foreground text-lg">
          Track your daily hiring journey
        </p>
      </div>

      <Button
        size="lg"
        onClick={async () => {
          const res = await authClient.signIn.social({
            provider: "google",
            callbackURL: "/dashboard",
          });
          if (res.data?.url) {
            await navigate({ href: res.data.url, replace: true });
          }
        }}
      >
        Sign in with Google
      </Button>
    </main>
  );
}
