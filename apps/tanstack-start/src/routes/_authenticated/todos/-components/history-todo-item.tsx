import { ArrowUp, CheckCircle2, Circle, Trash2 } from "lucide-react";

import { cn } from "@stepsnaps/ui";
import { Button } from "@stepsnaps/ui/button";

import { today } from "~/lib/date";
import { useDeleteTodo } from "../../dashboard/-hooks/use-delete-todo";
import { useMoveTodosToToday } from "../../dashboard/-hooks/use-move-todos-to-today";

interface HistoryTodoItemProps {
  todo: { id: string; title: string; completed: boolean };
}

export function HistoryTodoItem({ todo }: HistoryTodoItemProps) {
  const deleteTodo = useDeleteTodo();
  const moveTodos = useMoveTodosToToday();

  return (
    <li className="bg-card flex items-center gap-2 rounded-md border px-3 py-2">
      {todo.completed ? (
        <CheckCircle2 className="text-primary size-5 shrink-0" />
      ) : (
        <Circle className="text-muted-foreground size-5 shrink-0" />
      )}

      <span
        className={cn(
          "flex-1 truncate text-sm",
          todo.completed && "text-muted-foreground line-through",
        )}
      >
        {todo.title}
      </span>

      {!todo.completed && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => moveTodos.mutate({ ids: [todo.id], today: today() })}
          disabled={moveTodos.isPending}
          className="shrink-0"
        >
          <ArrowUp />
          Move to today
        </Button>
      )}

      <Button
        size="icon-sm"
        variant="ghost"
        onClick={() => deleteTodo.mutate({ id: todo.id })}
        aria-label="Delete to-do"
        className="text-muted-foreground hover:text-destructive shrink-0"
      >
        <Trash2 />
      </Button>
    </li>
  );
}
