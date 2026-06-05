import { useState } from "react";

import { Button } from "@stepsnaps/ui/button";
import { Field, FieldGroup, FieldLabel } from "@stepsnaps/ui/field";
import { Input } from "@stepsnaps/ui/input";
import { Textarea } from "@stepsnaps/ui/textarea";

import type { JourneyData } from "./journey-card";
import { LoadingButton } from "~/components/loading-button";
import { SimpleDialog, SimpleDialogContent } from "~/components/simple-dialog";
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
    <SimpleDialog open={open} onOpenChange={onOpenChange}>
      <EditDetailsDialogContent journey={journey} onOpenChange={onOpenChange} />
    </SimpleDialog>
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
    <SimpleDialogContent
      title="Edit Journey Details"
      description="Update the company name and offer details."
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <LoadingButton
            onClick={handleSave}
            disabled={updateDetails.isPending}
            loading={updateDetails.isPending}
          >
            Save
          </LoadingButton>
        </>
      }
    >
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
    </SimpleDialogContent>
  );
}
