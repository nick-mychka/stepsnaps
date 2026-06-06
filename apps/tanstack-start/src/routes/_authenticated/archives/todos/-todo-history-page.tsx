import { dayjs, today } from "~/lib/date";
import { HistoryTodoItem } from "./-components/history-todo-item";
import { usePastTodos } from "./-hooks/use-past-todos";

export function TodoHistoryPage() {
  const { data: todos, isPending } = usePastTodos(today());
  const items = todos ?? [];

  // listPast already orders by date desc, so groups come out newest-first.
  const groups: { date: string; todos: typeof items }[] = [];
  for (const todo of items) {
    const last = groups.at(-1);
    if (last?.date === todo.date) {
      last.todos.push(todo);
    } else {
      groups.push({ date: todo.date, todos: [todo] });
    }
  }

  return (
    <div className="px-8 py-8">
      <h1 className="mb-6 text-xl font-bold">To-Do History</h1>
      {isPending ? null : items.length === 0 ? (
        <p className="text-muted-foreground">
          No past to-dos yet. Items you add on the dashboard show up here once
          the day rolls over.
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map((group) => (
            <section key={group.date}>
              <h2 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
                {dayjs(group.date).format("dddd, MMMM D, YYYY")}
              </h2>
              <ul className="flex max-w-lg flex-col gap-2">
                {group.todos.map((todo) => (
                  <HistoryTodoItem key={todo.id} todo={todo} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
