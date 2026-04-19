import { useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useNavigate,
} from "@tanstack/react-router";

import { authClient } from "~/auth/client";
import { Logo } from "~/component/logo";
import { PageLoader } from "~/component/page-loader";
import { SidePanel } from "~/component/side-panel";
import { dayjs } from "~/lib/date";
import { useTRPC } from "~/lib/trpc";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.fetchQuery(
      context.trpc.auth.getSession.queryOptions(),
    );
    if (!session) {
      throw redirect({ to: "/" });
    }
    return { session };
  },
  component: AuthedLayout,
  pendingComponent: PageLoader,
});

function AuthedLayout() {
  const { session } = Route.useRouteContext();
  const navigate = useNavigate();
  const trpc = useTRPC();
  const { data: activeJourney } = useQuery(trpc.journey.active.queryOptions());

  async function handleSignOut() {
    await authClient.signOut();
    await navigate({ to: "/", replace: true });
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header — full width */}
      <header className="border-b">
        <div className="flex h-16 items-center justify-between px-6">
          <Link to="/dashboard" className="text-xl font-bold tracking-tight">
            <Logo />
          </Link>
          <div className="border-primary border-l-2 pl-3">
            <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
              {dayjs().format("dddd, MMMM D, YYYY")}
            </p>
          </div>
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
