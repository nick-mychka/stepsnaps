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
  DialogTrigger,
} from "@stepsnaps/ui/dialog";
import { Input } from "@stepsnaps/ui/input";
import { Label } from "@stepsnaps/ui/label";

import { useCreateStep } from "../-hooks/use-create-step";
import { useUpdateStep } from "../-hooks/use-update-step";

type StepFormDialogProps =
  | { mode: "add" }
  | {
      mode: "edit";
      step: { id: string; name: string; type: "numeric" | "text" };
    };

export function StepFormDialog(props: StepFormDialogProps) {
  const isEdit = props.mode === "edit";
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(isEdit ? props.step.name : "");
  const [type, setType] = useState<"numeric" | "text">(
    isEdit ? props.step.type : "numeric",
  );

  const create = useCreateStep({
    onSuccess: () => {
      setName("");
      setType("numeric");
      setOpen(false);
    },
  });

  const update = useUpdateStep({
    onSuccess: () => {
      setOpen(false);
    },
  });

  const mutation = isEdit ? update : create;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (isEdit) {
      update.mutate({ id: props.step.id, name: name.trim(), type });
    } else {
      create.mutate({ name: name.trim(), type });
    }
  };

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (v && isEdit) {
      setName(props.step.name);
      setType(props.step.type);
    }
  };

  const radioName = isEdit ? "edit-step-type" : "step-type";
  const nameInputId = isEdit ? "edit-step-name" : "step-name";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        ) : (
          <Button size="sm">Add Step</Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Edit Step" : "Add Custom Step"}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update the name or type of this step."
                : "Create a new step to track in your daily snaps."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={nameInputId}>Name</Label>
              <Input
                id={nameInputId}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isEdit ? undefined : "e.g., Leetcode Problems"}
                maxLength={256}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Type</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={radioName}
                    value="numeric"
                    checked={type === "numeric"}
                    onChange={() => setType("numeric")}
                  />
                  Numeric
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={radioName}
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
            <Button type="submit" disabled={mutation.isPending || !name.trim()}>
              {isEdit
                ? mutation.isPending
                  ? "Saving..."
                  : "Save"
                : mutation.isPending
                  ? "Adding..."
                  : "Add Step"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
