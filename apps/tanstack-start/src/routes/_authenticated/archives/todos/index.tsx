import { createFileRoute } from "@tanstack/react-router";

import { TodoHistoryPage } from "./-todo-history-page";

export const Route = createFileRoute("/_authenticated/archives/todos/")({
  component: TodoHistoryPage,
});
