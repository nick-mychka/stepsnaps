import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "@stepsnaps/ui/toast";

import { useTRPC } from "~/lib/trpc";

export function useDeleteSnap(opts: { onSuccess?: () => void } = {}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.snap.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.snap.pathFilter());
        toast.success("Snap deleted");
        opts.onSuccess?.();
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );
}
