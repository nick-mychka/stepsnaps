import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "@stepsnaps/ui/toast";

import { useTRPC } from "~/lib/trpc";

export function useUpdateStep(options?: { onSuccess?: () => void }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.stepDefinition.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.stepDefinition.pathFilter());
        toast.success("Step updated!");
        options?.onSuccess?.();
      },
      onError: (err) => toast.error(err.message),
    }),
  );
}
