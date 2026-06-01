import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "@stepsnaps/ui/toast";

import { useTRPC } from "~/lib/trpc";

export function useMoveTodosToToday() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.todo.moveToToday.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.todo.pathFilter());
      },
      onError: (err) => toast.error(err.message),
    }),
  );
}
