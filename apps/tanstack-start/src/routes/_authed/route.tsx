import { useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
} from "@tanstack/react-router";
import { Footprints, History, LogOut, Users } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@stepsnaps/ui/avatar";
import { Button } from "@stepsnaps/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@stepsnaps/ui/dropdown-menu";
import { ThemeToggle } from "@stepsnaps/ui/theme";

import { authClient } from "~/auth/client";
import { Logo } from "~/component/logo";
import { PageLoader } from "~/component/page-loader";
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

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between">
          <button
            className="text-xl font-bold tracking-tight"
            onClick={() => navigate({ to: "/dashboard" })}
          >
            <Logo />
          </button>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard">Dashboard</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/snap/new">Snap</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/progress">Progress</Link>
            </Button>
            {activeJourney && (
              <Button variant="ghost" size="sm" asChild>
                <Link to="/applications">Applications</Link>
              </Button>
            )}
            <span className="text-muted-foreground text-sm">
              {session.user.name}
            </span>
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarImage
                      src={session.user.image ?? undefined}
                      alt={session.user.name}
                    />
                    <AvatarFallback>{session.user.name[0]}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link to="/settings/steps">
                      <Footprints />
                      Steps
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/journey/history">
                      <History />
                      History
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/teams">
                      <Users />
                      Teams
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={async () => {
                      await authClient.signOut();
                      await navigate({ to: "/", replace: true });
                    }}
                  >
                    <LogOut />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
