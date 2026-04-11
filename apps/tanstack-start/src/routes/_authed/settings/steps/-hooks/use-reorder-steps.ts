import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "@stepsnaps/ui/toast";

import { useTRPC } from "~/lib/trpc";

export function useReorderSteps() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.stepDefinition.reorder.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.stepDefinition.pathFilter());
      },
      onError: (err) => toast.error(err.message),
    }),
  );
}
