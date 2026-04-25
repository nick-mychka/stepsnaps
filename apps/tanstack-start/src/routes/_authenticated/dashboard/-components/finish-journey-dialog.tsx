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
import { Input } from "@stepsnaps/ui/input";
import { Label } from "@stepsnaps/ui/label";
import { Spinner } from "@stepsnaps/ui/spinner";
import { Textarea } from "@stepsnaps/ui/textarea";

import { useFinishJourney } from "../-hooks/use-finish-journey";

export function FinishJourneyDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [companyName, setCompanyName] = useState("");
  const [offerDetails, setOfferDetails] = useState("");

  const finishJourney = useFinishJourney({
    onSuccess: () => props.onOpenChange(false),
  });

  const handleSubmit = () => {
    finishJourney.mutate({
      companyName: companyName.trim() || undefined,
      offerDetails: offerDetails.trim() || undefined,
    });
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Finish Journey</DialogTitle>
          <DialogDescription>
            Congratulations! Optionally record the offer details.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              placeholder="e.g. Acme Corp"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="offerDetails">Offer Details</Label>
            <Textarea
              id="offerDetails"
              placeholder="e.g. Senior Engineer, $150k"
              value={offerDetails}
              onChange={(e) => setOfferDetails(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => props.onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={finishJourney.isPending}>
            {finishJourney.isPending && <Spinner />}
            Finish Journey
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
