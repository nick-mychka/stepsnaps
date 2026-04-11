import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
import { toast } from "@stepsnaps/ui/toast";

import { useTRPC } from "~/lib/trpc";

export function EditStepDialog(props: {
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
