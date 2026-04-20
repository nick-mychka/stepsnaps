import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "@stepsnaps/ui/toast";

import { useTRPC } from "~/lib/trpc";

export function useDeleteInterview() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.interview.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.interview.pathFilter());
        await queryClient.invalidateQueries(trpc.jobApplication.pathFilter());
        toast.success("Interview deleted.");
      },
      onError: (err) => toast.error(err.message),
    }),
  );
}
