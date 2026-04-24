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
import { Spinner } from "@stepsnaps/ui/spinner";
import { useCloseApplication } from "../-hooks/use-close-application";
import { SimpleTooltip } from "~/components/simple-tooltip";

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
  const [closedReason, setClosedReason] = useState<
    "rejected" | "withdrawn" | "no_response" | "success"
  >("no_response");

  const closeApplication = useCloseApplication({
    onSuccess: () => {
      props.onOpenChange(false);
      setClosedReason("no_response");
    },
  });

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
