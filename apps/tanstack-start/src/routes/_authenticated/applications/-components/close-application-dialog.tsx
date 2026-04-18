import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@stepsnaps/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@stepsnaps/ui/dialog";
import { Label } from "@stepsnaps/ui/label";
import { RadioGroup, RadioGroupItem } from "@stepsnaps/ui/radio-group";
import { Spinner } from "@stepsnaps/ui/spinner";
import { toast } from "@stepsnaps/ui/toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@stepsnaps/ui/tooltip";

import { useTRPC } from "~/lib/trpc";

const CLOSED_REASONS = [
  {
    value: "rejected" as const,
    label: "Rejected",
    description:
      "The company said no. They reviewed your application or interviewed you and decided not to move forward.",
  },
  {
    value: "withdrawn" as const,
    label: "Withdrawn",
    description:
      "You said no. You pulled out of the process (found another offer, lost interest, bad interview experience, etc.).",
  },
  {
    value: "no_response" as const,
    label: "No Response",
    description: "Silence. You applied, never heard back.",
  },
  {
    value: "success" as const,
    label: "Success",
    description: "You got the offer.",
  },
];

interface CloseApplicationDialogProps {
  applicationId: string | null;
  onOpenChange: (open: boolean) => void;
}

export function CloseApplicationDialog(props: CloseApplicationDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [closedReason, setClosedReason] = useState<
    "rejected" | "withdrawn" | "no_response" | "success"
  >("no_response");

  const closeApplication = useMutation(
    trpc.jobApplication.close.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.jobApplication.pathFilter());
        props.onOpenChange(false);
        setClosedReason("no_response");
        toast.success("Application closed.");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!props.applicationId) return;
    closeApplication.mutate({
      id: props.applicationId,
      closedReason,
    });
  };

  return (
    <Dialog open={!!props.applicationId} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Close Application</DialogTitle>
            <DialogDescription>
              Choose a reason for closing this application. It will move to your
              history.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <TooltipProvider>
              <RadioGroup
                value={closedReason}
                onValueChange={(v) =>
                  setClosedReason(
                    v as "rejected" | "withdrawn" | "no_response" | "success",
                  )
                }
              >
                {CLOSED_REASONS.map((reason) => (
                  <div key={reason.value} className="flex items-center gap-3">
                    <RadioGroupItem
                      value={reason.value}
                      id={`reason-${reason.value}`}
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Label
                          htmlFor={`reason-${reason.value}`}
                          className="cursor-pointer"
                        >
                          {reason.label}
                        </Label>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        {reason.description}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                ))}
              </RadioGroup>
            </TooltipProvider>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => props.onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={closeApplication.isPending}
            >
              {closeApplication.isPending && <Spinner />}
              Close Application
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
