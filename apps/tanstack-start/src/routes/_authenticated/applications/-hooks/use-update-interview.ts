import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "@stepsnaps/ui/toast";

import { useTRPC } from "~/lib/trpc";

export function useUpdateInterview(options?: { onSuccess?: () => void }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.interview.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.interview.pathFilter());
        await queryClient.invalidateQueries(trpc.jobApplication.pathFilter());
        toast.success("Interview updated!");
        options?.onSuccess?.();
      },
      onError: (err) => toast.error(err.message),
    }),
  );
}
