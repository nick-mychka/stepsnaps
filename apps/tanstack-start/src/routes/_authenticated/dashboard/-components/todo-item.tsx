import type { FormEvent } from "react";
import { useState } from "react";
import { CheckCircle2, Circle, Trash2 } from "lucide-react";

import { cn } from "@stepsnaps/ui";
import { Button } from "@stepsnaps/ui/button";
import { Input } from "@stepsnaps/ui/input";

import { useDeleteTodo } from "../-hooks/use-delete-todo";
import { useToggleTodo } from "../-hooks/use-toggle-todo";
import { useUpdateTodo } from "../-hooks/use-update-todo";

interface TodoItemProps {
  todo: { id: string; title: string; completed: boolean };
}

export function TodoItem({ todo }: TodoItemProps) {
  const toggleTodo = useToggleTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);

  const startEditing = () => {
    setDraft(todo.title);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraft(todo.title);
    setIsEditing(false);
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) {
      cancelEditing();
      return;
    }
    if (trimmed !== todo.title) {
      updateTodo.mutate({ id: todo.id, title: trimmed });
    }
    setIsEditing(false);
  };

  return (
    <li className="bg-card flex items-center gap-2 rounded-md border px-3 py-2">
      <button
        type="button"
        onClick={() =>
          toggleTodo.mutate({ id: todo.id, completed: !todo.completed })
        }
        aria-label={todo.completed ? "Mark as not done" : "Mark as done"}
        aria-pressed={todo.completed}
        className="text-muted-foreground hover:text-foreground shrink-0"
      >
        {todo.completed ? (
          <CheckCircle2 className="text-primary size-5" />
        ) : (
          <Circle className="size-5" />
        )}
      </button>

      {isEditing ? (
        <form onSubmit={handleSave} className="flex-1">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === "Escape") cancelEditing();
            }}
            autoFocus
            maxLength={256}
            aria-label="Edit to-do title"
            className="h-7"
          />
        </form>
      ) : (
        <button
          type="button"
          onClick={startEditing}
          className={cn(
            "flex-1 truncate text-left text-sm",
            todo.completed && "text-muted-foreground line-through",
          )}
        >
          {todo.title}
        </button>
      )}

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => deleteTodo.mutate({ id: todo.id })}
        aria-label="Delete to-do"
        className="text-muted-foreground hover:text-destructive shrink-0"
      >
        <Trash2 />
      </Button>
    </li>
  );
}
