import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "@stepsnaps/ui/toast";

import { useTRPC } from "~/lib/trpc";

export function useCreateApplication(options?: { onSuccess?: () => void }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.jobApplication.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.jobApplication.pathFilter());
        await queryClient.invalidateQueries(trpc.source.pathFilter());
        toast.success("Application added!");
        options?.onSuccess?.();
      },
      onError: (err) => toast.error(err.message),
    }),
  );
}
