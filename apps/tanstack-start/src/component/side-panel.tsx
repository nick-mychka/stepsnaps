import { Link } from "@tanstack/react-router";
import {
  Aperture,
  Archive,
  ChartSpline,
  Footprints,
  LayoutDashboard,
  LogOut,
  NotebookText,
  Users,
} from "lucide-react";

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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@stepsnaps/ui/tooltip";

interface SidePanelProps {
  user: { name: string; image?: string | null };
  hasActiveJourney: boolean;
  onSignOut: () => void;
}

function NavIcon({
  to,
  label,
  icon: Icon,
}: {
  to: string;
  label: string;
  icon: React.ElementType;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" className="group" asChild>
          <Link to={to} activeProps={{ className: "[&>svg]:text-primary" }}>
            <Icon className="group-hover:text-primary size-5 transition-colors" />
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

export function SidePanel({
  user,
  hasActiveJourney,
  onSignOut,
}: SidePanelProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <aside className="border-border bg-background flex w-16 flex-col items-center border-r py-8">
        {/* Top — nav icons */}
        <div className="flex flex-col items-center gap-3">
          <NavIcon to="/dashboard" label="Dashboard" icon={LayoutDashboard} />
          <NavIcon to="/snap/new" label="Snap" icon={Aperture} />
          {hasActiveJourney && (
            <NavIcon
              to="/applications"
              label="Applications"
              icon={NotebookText}
            />
          )}
          <NavIcon to="/progress" label="Progress" icon={ChartSpline} />
        </div>

        {/* Bottom — theme + account */}
        <div className="mt-auto flex flex-col items-center gap-6">
          <Tooltip>
            <TooltipTrigger asChild>
              <ThemeToggle />
            </TooltipTrigger>
            <TooltipContent side="right">Toggle theme</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="size-7">
                      <AvatarImage
                        src={user.image ?? undefined}
                        alt={user.name}
                      />
                      <AvatarFallback className="text-xs">
                        {user.name[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="end" className="w-36">
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link to="/settings/steps">
                        <Footprints />
                        Steps
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/journey/history">
                        <Archive />
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
                    <DropdownMenuItem variant="destructive" onClick={onSignOut}>
                      <LogOut />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipTrigger>
            <TooltipContent side="right">{user.name}</TooltipContent>
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}
