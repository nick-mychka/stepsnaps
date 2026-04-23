import { MoreVertical } from "lucide-react";

import { Button } from "@stepsnaps/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@stepsnaps/ui/dropdown-menu";

interface ActionsMenuProps {
  children: React.ReactNode;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  align?: React.ComponentProps<typeof DropdownMenuContent>["align"];
}

export function ActionsMenu({
  children,
  variant = "ghost",
  size = "icon",
  align = "end",
}: ActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>{children}</DropdownMenuContent>
    </DropdownMenu>
  );
}
