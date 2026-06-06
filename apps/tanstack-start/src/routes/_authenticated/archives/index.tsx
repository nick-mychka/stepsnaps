import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/archives/")({
  beforeLoad: () => {
    throw redirect({ to: "/archives/todos" });
  },
});
