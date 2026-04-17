import { useState } from "react";

import { Button } from "@stepsnaps/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@stepsnaps/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@stepsnaps/ui/field";
import { Input } from "@stepsnaps/ui/input";
import { RadioGroup, RadioGroupItem } from "@stepsnaps/ui/radio-group";
import { Spinner } from "@stepsnaps/ui/spinner";

import { useCreateStep } from "../-hooks/use-create-step";
import { useUpdateStep } from "../-hooks/use-update-step";

interface ContentProps {
  step: {
    id: string;
    name: string;
    type: "numeric" | "text";
    isPredefined: boolean;
    goalValue: string | null;
  } | null;
  onOpenChange: (open: boolean) => void;
}

interface Props extends ContentProps {
  open: boolean;
}

type StepType = "numeric" | "text";

export function StepFormDialog({ open, step, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <StepFormDialogContent step={step} onOpenChange={onOpenChange} />
      </DialogContent>
    </Dialog>
  );
}

function StepFormDialogContent({ step, onOpenChange }: ContentProps) {
  const isEdit = step !== null;
  const [name, setName] = useState(isEdit ? step.name : "");
  const [type, setType] = useState<StepType>(isEdit ? step.type : "numeric");
  const [goalValue, setGoalValue] = useState(
    isEdit && step.goalValue !== null ? step.goalValue : "",
  );

  const create = useCreateStep({
    onSuccess: () => {
      setName("");
      setType("numeric");
      setGoalValue("");
      onOpenChange(false);
    },
  });

  const update = useUpdateStep({
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  const mutation = isEdit ? update : create;

  const parsedGoal =
    type === "numeric" && goalValue.trim() !== "" ? Number(goalValue) : null;

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (isEdit) {
      update.mutate({
        id: step.id,
        name: name.trim(),
        type,
        goalValue: parsedGoal,
      });
    } else {
      create.mutate({ name: name.trim(), type, goalValue: parsedGoal });
    }
  };

  const nameInputId = isEdit ? "edit-step-name" : "step-name";

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{isEdit ? "Edit Step" : "Add Custom Step"}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? step.isPredefined
              ? "Update the daily goal for this step."
              : "Update the name, type, or goal of this step."
            : "Create a new step to track in your daily snaps."}
        </DialogDescription>
      </DialogHeader>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={nameInputId}>Name</FieldLabel>
          <Input
            id={nameInputId}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isEdit ? undefined : "e.g., Leetcode Problems"}
            maxLength={256}
            disabled={isEdit && step.isPredefined}
          />
        </Field>
        <Field>
          <FieldLabel>Type</FieldLabel>
          <RadioGroup
            value={type}
            onValueChange={(v: StepType) => setType(v)}
            className="flex gap-4"
            disabled={isEdit && step.isPredefined}
          >
            <Field orientation="horizontal">
              <RadioGroupItem value="numeric" id="numeric" />
              <FieldLabel htmlFor="numeric">Numeric</FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <RadioGroupItem value="text" id="text" />
              <FieldLabel htmlFor="text">Text</FieldLabel>
            </Field>
          </RadioGroup>
        </Field>
        {type === "numeric" && (
          <Field>
            <FieldLabel htmlFor="step-goal">Daily goal</FieldLabel>
            <Input
              id="step-goal"
              type="number"
              min={0}
              step="any"
              value={goalValue}
              onChange={(e) => setGoalValue(e.target.value)}
              placeholder="Optional"
            />
          </Field>
        )}
      </FieldGroup>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline" type="button">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={mutation.isPending || !name.trim()}>
          {mutation.isPending && <Spinner />}
          {isEdit ? "Save" : "Add Step"}
        </Button>
      </DialogFooter>
    </form>
  );
}
