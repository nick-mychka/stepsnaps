import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";

import { Avatar, AvatarFallback } from "@stepsnaps/ui/avatar";
import { Button } from "@stepsnaps/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@stepsnaps/ui/dropdown-menu";

import { authClient } from "~/auth/client";
import { Logo } from "~/component/logo";

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
        <div className="container mx-auto flex h-16 items-center justify-between">
          <button
            className="text-lg font-bold tracking-tight"
            onClick={() => navigate({ to: "/dashboard" })}
          >
            <Logo />
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
              onClick={() => navigate({ to: "/progress" })}
            >
              Progress
            </Button>
            <span className="text-muted-foreground text-sm">
              {session.user.name}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarFallback>{session.user.name[0]}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => navigate({ to: "/settings/steps" })}
                  >
                    Steps
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate({ to: "/journey/history" })}
                  >
                    History
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate({ to: "/teams" })}>
                    Teams
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
