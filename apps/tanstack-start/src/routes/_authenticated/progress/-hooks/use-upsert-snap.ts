import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "@stepsnaps/ui/toast";

import { useTRPC } from "~/lib/trpc";

export function useUpsertSnap(opts: { onSuccess?: () => void } = {}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.snap.upsert.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.snap.pathFilter());
        toast.success("Snap updated!");
        opts.onSuccess?.();
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );
}
