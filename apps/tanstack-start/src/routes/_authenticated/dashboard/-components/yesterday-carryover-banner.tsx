import { useState } from "react";
import { ArrowUp, TriangleAlert } from "lucide-react";

import { Button } from "@stepsnaps/ui/button";
import { Spinner } from "@stepsnaps/ui/spinner";

import { LoadingButton } from "~/components/loading-button";
import { today, yesterday } from "~/lib/date";
import { useMoveTodosToToday } from "../-hooks/use-move-todos-to-today";
import { useTodos } from "../-hooks/use-todos";

export function YesterdayCarryoverBanner() {
  const { data: yesterdayTodos } = useTodos(yesterday());
  const moveTodos = useMoveTodosToToday();
  const [reviewing, setReviewing] = useState(false);

  const unfinished = (yesterdayTodos ?? []).filter((t) => !t.completed);
  if (unfinished.length === 0) return null;

  const carryAll = () =>
    moveTodos.mutate({ ids: unfinished.map((t) => t.id), today: today() });

  return (
    <div className="flex flex-col gap-3 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-medium">
          <TriangleAlert className="size-4 shrink-0 text-amber-500" />
          {unfinished.length} unfinished{" "}
          {unfinished.length === 1 ? "item" : "items"} from yesterday
        </p>
        <div className="flex shrink-0 gap-2">
          <LoadingButton
            size="sm"
            onClick={carryAll}
            disabled={moveTodos.isPending}
            loading={moveTodos.isPending}
          >
            Carry all over
          </LoadingButton>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setReviewing((r) => !r)}
          >
            {reviewing ? "Hide" : "Review"}
          </Button>
        </div>
      </div>

      {reviewing && (
        <ul className="flex flex-col gap-1.5">
          {unfinished.map((todo) => (
            <li
              key={todo.id}
              className="bg-card flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-sm"
            >
              <span className="truncate">{todo.title}</span>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() =>
                  moveTodos.mutate({ ids: [todo.id], today: today() })
                }
                disabled={moveTodos.isPending}
                aria-label={`Move "${todo.title}" to today`}
              >
                {moveTodos.isPending ? <Spinner /> : <ArrowUp />}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
