import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { ListTodo, Road } from "lucide-react";

import { cn } from "@stepsnaps/ui";

export const Route = createFileRoute("/_authenticated/archives")({
  component: ArchivesLayout,
});

const MENU_ITEMS = [
  { to: "/archives/todos", label: "To-Dos", icon: ListTodo },
  { to: "/archives/journeys", label: "Journeys", icon: Road },
] as const;

function ArchivesLayout() {
  return (
    <div className="flex h-full">
      <aside className="border-border w-56 shrink-0 border-r p-4">
        <nav className="flex flex-col gap-1">
          {MENU_ITEMS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="text-muted-foreground hover:bg-accent flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors"
              activeProps={{
                className: cn("bg-accent text-foreground"),
              }}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
