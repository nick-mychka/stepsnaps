import { useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
} from "@tanstack/react-router";

import { authClient } from "~/auth/client";
import { Logo } from "~/component/logo";
import { PageLoader } from "~/component/page-loader";
import { SidePanel } from "~/component/side-panel";
import { useTRPC } from "~/lib/trpc";

export const Route = createFileRoute("/_authed")({
  component: AuthedLayout,
});

function AuthedLayout() {
  const { data: session, isPending } = authClient.useSession();
  const navigate = useNavigate();
  const trpc = useTRPC();
  const { data: activeJourney } = useQuery(trpc.journey.active.queryOptions());

  if (isPending) return <PageLoader />;

  if (!session) {
    void navigate({ to: "/", replace: true });
    return null;
  }

  async function handleSignOut() {
    await authClient.signOut();
    await navigate({ to: "/", replace: true });
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header — full width */}
      <header className="border-b">
        <div className="flex h-16 items-center px-6">
          <Link to="/dashboard" className="text-xl font-bold tracking-tight">
            <Logo />
          </Link>
        </div>
      </header>

      {/* Body — sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        <SidePanel
          user={session.user}
          hasActiveJourney={!!activeJourney}
          onSignOut={handleSignOut}
        />
        <main className="min-w-0 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
