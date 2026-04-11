import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@stepsnaps/ui/card";
import { toast } from "@stepsnaps/ui/toast";

import { useTRPC } from "~/lib/trpc";
import { StepFormDialog } from "./-components/step-form-dialog";
import { StepListItem } from "./-components/step-list-item";

export const Route = createFileRoute("/_authed/settings/steps/")({
  loader: ({ context }) => {
    const { trpc, queryClient } = context;
    void queryClient.prefetchQuery(trpc.stepDefinition.list.queryOptions());
  },
  component: StepsSettingsPage,
});

function StepsSettingsPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: steps } = useSuspenseQuery(
    trpc.stepDefinition.list.queryOptions(),
  );

  const toggleActive = useMutation(
    trpc.stepDefinition.toggleActive.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.stepDefinition.pathFilter());
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const reorder = useMutation(
    trpc.stepDefinition.reorder.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.stepDefinition.pathFilter());
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const swapAndReorder = (a: number, b: number) => {
    const ids = steps.map((s) => s.id);
    const reordered = ids.map((id, i) =>
      i === a ? ids[b] : i === b ? ids[a] : id,
    ) as string[];
    reorder.mutate({ ids: reordered });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    swapAndReorder(index - 1, index);
  };

  const handleMoveDown = (index: number) => {
    if (index === steps.length - 1) return;
    swapAndReorder(index, index + 1);
  };

  return (
    <main className="container mx-auto py-8">
      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="mb-4">Step Definitions</CardTitle>
              <CardDescription>
                Customize the steps you track in your daily snaps. Changes only
                affect future snaps.
              </CardDescription>
            </div>
            <StepFormDialog mode="add" />
          </div>
        </CardHeader>
        <CardContent>
          {steps.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No step definitions yet. Start a journey to get predefined steps,
              or add a custom step above.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {steps.map((step, index) => (
                <StepListItem
                  key={step.id}
                  step={step}
                  index={index}
                  total={steps.length}
                  isReordering={reorder.isPending}
                  isToggling={toggleActive.isPending}
                  onMoveUp={() => handleMoveUp(index)}
                  onMoveDown={() => handleMoveDown(index)}
                  onToggleActive={() => toggleActive.mutate({ id: step.id })}
                  editDialog={
                    !step.isPredefined ? (
                      <StepFormDialog mode="edit" step={step} />
                    ) : undefined
                  }
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
