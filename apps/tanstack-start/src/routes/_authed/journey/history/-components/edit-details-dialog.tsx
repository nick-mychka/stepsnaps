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
import { Field, FieldGroup, FieldLabel } from "@stepsnaps/ui/field";
import { Input } from "@stepsnaps/ui/input";
import { Spinner } from "@stepsnaps/ui/spinner";
import { Textarea } from "@stepsnaps/ui/textarea";

import type { JourneyData } from "./journey-card";
import { useUpdateJourneyDetails } from "../-hooks/use-update-journey-details";

interface ContentProps {
  journey: JourneyData;
  onOpenChange: (open: boolean) => void;
}

interface Props extends ContentProps {
  open: boolean;
}

export function EditDetailsDialog({ open, journey, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <EditDetailsDialogContent
          journey={journey}
          onOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}

function EditDetailsDialogContent({ journey, onOpenChange }: ContentProps) {
  const [companyName, setCompanyName] = useState(journey.companyName ?? "");
  const [offerDetails, setOfferDetails] = useState(journey.offerDetails ?? "");

  const updateDetails = useUpdateJourneyDetails({
    onSuccess: () => onOpenChange(false),
  });

  const handleSave = () => {
    updateDetails.mutate({
      id: journey.id,
      companyName: companyName.trim() || null,
      offerDetails: offerDetails.trim() || null,
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Journey Details</DialogTitle>
        <DialogDescription>
          Update the company name and offer details.
        </DialogDescription>
      </DialogHeader>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="editCompanyName">Company Name</FieldLabel>
          <Input
            id="editCompanyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="editOfferDetails">Offer Details</FieldLabel>
          <Textarea
            id="editOfferDetails"
            value={offerDetails}
            onChange={(e) => setOfferDetails(e.target.value)}
          />
        </Field>
      </FieldGroup>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={updateDetails.isPending}>
          {updateDetails.isPending && <Spinner />}
          Save
        </Button>
      </DialogFooter>
    </>
  );
}
