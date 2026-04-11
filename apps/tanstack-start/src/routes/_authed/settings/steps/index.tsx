import { useState } from "react";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@stepsnaps/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@stepsnaps/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@stepsnaps/ui/dialog";
import { Input } from "@stepsnaps/ui/input";
import { Label } from "@stepsnaps/ui/label";
import { toast } from "@stepsnaps/ui/toast";

import { useTRPC } from "~/lib/trpc";
import { AddStepDialog } from "./-components/add-step-dialog";
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
            <AddStepDialog />
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
                  onToggleActive={() =>
                    toggleActive.mutate({ id: step.id })
                  }
                  editDialog={
                    !step.isPredefined ? (
                      <EditStepDialog step={step} />
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


function EditStepDialog(props: {
  step: { id: string; name: string; type: "numeric" | "text" };
}) {
  const { step } = props;
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(step.name);
  const [type, setType] = useState<"numeric" | "text">(step.type);

  const update = useMutation(
    trpc.stepDefinition.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.stepDefinition.pathFilter());
        toast.success("Step updated!");
        setOpen(false);
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    update.mutate({ id: step.id, name: name.trim(), type });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) {
          setName(step.name);
          setType(step.type);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Step</DialogTitle>
            <DialogDescription>
              Update the name or type of this step.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-step-name">Name</Label>
              <Input
                id="edit-step-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={256}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Type</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="edit-step-type"
                    value="numeric"
                    checked={type === "numeric"}
                    onChange={() => setType("numeric")}
                  />
                  Numeric
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="edit-step-type"
                    value="text"
                    checked={type === "text"}
                    onChange={() => setType("text")}
                  />
                  Text
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={update.isPending || !name.trim()}>
              {update.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
