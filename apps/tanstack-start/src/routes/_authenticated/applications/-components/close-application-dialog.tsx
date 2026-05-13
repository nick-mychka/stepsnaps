import { useState } from "react";

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

import { LoadingButton } from "~/components/loading-button";
import { SimpleTooltip } from "~/components/simple-tooltip";
import { useCloseApplication } from "../-hooks/use-close-application";

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
  onSuccess?: () => void;
}

export function CloseApplicationDialog({
  applicationId,
  onOpenChange,
  onSuccess,
}: CloseApplicationDialogProps) {
  const [closedReason, setClosedReason] = useState<
    "rejected" | "withdrawn" | "no_response" | "success"
  >("no_response");

  const closeApplication = useCloseApplication({
    onSuccess: () => {
      onOpenChange(false);
      setClosedReason("no_response");
      onSuccess?.();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicationId) return;
    closeApplication.mutate({
      id: applicationId,
      closedReason,
    });
  };

  return (
    <Dialog open={!!applicationId} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Close Application</DialogTitle>
          <DialogDescription>
            Choose a reason for closing this application. It will move to your
            history.
          </DialogDescription>
        </DialogHeader>
        <form
          id="close-application-form"
          className="py-4"
          onSubmit={handleSubmit}
        >
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
                <SimpleTooltip
                  content={reason.description}
                  side="right"
                  contentClassName="max-w-xs"
                >
                  <Label
                    htmlFor={`reason-${reason.value}`}
                    className="cursor-pointer"
                  >
                    {reason.label}
                  </Label>
                </SimpleTooltip>
              </div>
            ))}
          </RadioGroup>
        </form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            form="close-application-form"
            variant="destructive"
            disabled={closeApplication.isPending}
            loading={closeApplication.isPending}
          >
            Close Application
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
