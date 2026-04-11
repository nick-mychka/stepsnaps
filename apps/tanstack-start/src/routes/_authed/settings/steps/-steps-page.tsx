import { useState } from "react";

import { Button } from "@stepsnaps/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@stepsnaps/ui/card";

import { StepFormDialog } from "./-components/step-form-dialog";
import { StepListItem } from "./-components/step-list-item";
import { useReorderSteps } from "./-hooks/use-reorder-steps";
import { useStepDefinitions } from "./-hooks/use-step-definitions";
import { useToggleStep } from "./-hooks/use-toggle-step";

export function StepsPage() {
  const { data: steps } = useStepDefinitions();
  const toggleActive = useToggleStep();
  const reorder = useReorderSteps();

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<
    (typeof steps)[number] | null
  >(null);

  const swapAndReorder = (a: number, b: number) => {
    const ids = steps.map((step) => step.id);
    const reordered = ids
      .map((id, i) => {
        if (i === a) return ids[b];
        if (i === b) return ids[a];
        return id;
      })
      .filter((id) => id !== undefined);
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
    <>
      <main className="container mx-auto py-12">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="mb-4">Step Definitions</CardTitle>
            <CardDescription>
              Customize the steps you track in your daily snaps. <br />
              Changes only affect future snaps.
            </CardDescription>
            <CardAction>
              <Button size="sm" onClick={() => setDialogOpen(true)}>
                Add Step
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {steps.length === 0 ? (
              <div className="bg-accent rounded-lg py-6 text-center text-sm">
                <h6 className="mb-2">No step definitions yet.</h6>
                <p className="text-muted-foreground">
                  Start a journey to get predefined steps, or add a custom step
                  above.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {steps.map((step, index) => (
                  <StepListItem
                    key={step.id}
                    step={step}
                    isFirst={index === 0}
                    isLast={index === steps.length - 1}
                    isReordering={reorder.isPending}
                    isToggling={toggleActive.isPending}
                    onMoveUp={() => handleMoveUp(index)}
                    onMoveDown={() => handleMoveDown(index)}
                    onToggleActive={() => toggleActive.mutate({ id: step.id })}
                    onEdit={() => {
                      setSelectedStep(step);
                      setDialogOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <StepFormDialog
        open={isDialogOpen}
        step={selectedStep}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
