import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "@stepsnaps/ui/toast";

import { useTRPC } from "~/lib/trpc";

export function useUpsertSnap(options: {
  wasUpdate: boolean;
  onSuccess?: () => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.snap.upsert.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.snap.pathFilter());
        toast.success(options.wasUpdate ? "Snap updated!" : "Snap created!");
        options.onSuccess?.();
      },
      onError: (err) => toast.error(err.message),
    }),
  );
}
