import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { Button } from "@stepsnaps/ui/button";

import { authClient } from "~/auth/client";
import { BackgroundV9 } from "~/component/journey-background";
import { Logo } from "~/component/logo";
import { PageLoader } from "~/component/page-loader";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session, isPending } = authClient.useSession();
  const navigate = useNavigate();

  if (isPending) return <PageLoader />;

  if (session) {
    void navigate({ to: "/dashboard", replace: true });
    return null;
  }

  async function handleGoogleSignIn() {
    const res = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
    if (res.data?.url) {
      await navigate({ href: res.data.url, replace: true });
    }
  }

  return (
    <>
      <BackgroundV9 />
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-10 rounded-2xl border border-white/15 bg-white/8 px-20 py-16 shadow-2xl backdrop-blur-xl dark:bg-black/25">
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-5xl font-extrabold tracking-tight">
              <Logo />
            </h1>
            <p className="text-muted-foreground">
              Track your daily hiring journey
            </p>
          </div>
          <Button size="lg" onClick={handleGoogleSignIn}>
            Sign in with Google
          </Button>
        </div>
      </main>
    </>
  );
}
