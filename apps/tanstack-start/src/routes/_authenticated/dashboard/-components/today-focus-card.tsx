import type { FormEvent } from "react";
import { useState } from "react";
import { ListTodo, Plus } from "lucide-react";

import { Button } from "@stepsnaps/ui/button";
import { Input } from "@stepsnaps/ui/input";

import { SimpleCard } from "~/components/simple-card";
import { dayjs, today } from "~/lib/date";
import { useCreateTodo } from "../-hooks/use-create-todo";
import { useTodos } from "../-hooks/use-todos";
import { TodoItem } from "./todo-item";
import { YesterdayCarryoverBanner } from "./yesterday-carryover-banner";

export function TodayFocusCard() {
  const date = today();
  const { data: todos } = useTodos(date);
  const createTodo = useCreateTodo();
  const [title, setTitle] = useState("");

  const items = todos ?? [];

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    createTodo.mutate(
      { date, title: trimmed },
      { onSuccess: () => setTitle("") },
    );
  };

  return (
    <SimpleCard
      title={
        <>
          <ListTodo className="text-primary size-5" />
          Today's Focus
        </>
      }
      description={dayjs().format("dddd, MMMM D")}
      className="w-full max-w-lg"
      titleClassName="flex items-center gap-2 text-2xl font-bold"
      contentClassName="flex flex-col gap-4"
    >
      <YesterdayCarryoverBanner />

      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a focus for today…"
          maxLength={256}
          aria-label="New to-do title"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!title.trim() || createTodo.isPending}
          aria-label="Add to-do"
        >
          <Plus />
        </Button>
      </form>

      {items.length === 0 ? (
        <p className="text-muted-foreground py-6 text-center text-sm">
          No focus items yet — add your first one above.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </ul>
      )}
    </SimpleCard>
  );
}
