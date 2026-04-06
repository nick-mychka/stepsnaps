import { useState } from "react";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Badge } from "@stepsnaps/ui/badge";
import { Button } from "@stepsnaps/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@stepsnaps/ui/card";
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
import { Textarea } from "@stepsnaps/ui/textarea";
import { toast } from "@stepsnaps/ui/toast";

import { useTRPC } from "~/lib/trpc";

export const Route = createFileRoute("/_authed/journey/history")({
  loader: ({ context }) => {
    const { trpc, queryClient } = context;
    void queryClient.prefetchQuery(trpc.journey.list.queryOptions());
  },
  component: JourneyHistoryPage,
});

function JourneyHistoryPage() {
  const trpc = useTRPC();
  const { data: journeys } = useSuspenseQuery(trpc.journey.list.queryOptions());

  return (
    <main className="container py-8">
      <h1 className="mb-6 text-3xl font-bold">Journey History</h1>
      {journeys.length === 0 ? (
        <p className="text-muted-foreground">
          No journeys yet. Start one from the dashboard!
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {journeys.map((journey) => (
            <JourneyCard key={journey.id} journey={journey} />
          ))}
        </div>
      )}
    </main>
  );
}

interface JourneyData {
  id: string;
  startDate: string;
  endDate: string | null;
  status: "active" | "completed";
  companyName: string | null;
  offerDetails: string | null;
}

function JourneyCard(props: { journey: JourneyData }) {
  const { journey } = props;
  const [editOpen, setEditOpen] = useState(false);

  const start = new Date(journey.startDate);
  const end = journey.endDate ? new Date(journey.endDate) : new Date();
  const duration =
    Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return (
    <>
      <Card className="max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">
              {journey.companyName ?? "Journey"}
            </CardTitle>
            <Badge
              variant={journey.status === "active" ? "default" : "secondary"}
            >
              {journey.status}
            </Badge>
          </div>
          <CardDescription>
            {journey.startDate} &mdash; {journey.endDate ?? "present"} &middot;{" "}
            {duration} day
            {duration !== 1 && "s"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {journey.offerDetails && (
            <p className="text-sm">{journey.offerDetails}</p>
          )}
          {journey.status === "completed" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
            >
              Edit Details
            </Button>
          )}
        </CardContent>
      </Card>

      {journey.status === "completed" && (
        <EditDetailsDialog
          journey={journey}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}
    </>
  );
}

function EditDetailsDialog(props: {
  journey: JourneyData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [companyName, setCompanyName] = useState(
    props.journey.companyName ?? "",
  );
  const [offerDetails, setOfferDetails] = useState(
    props.journey.offerDetails ?? "",
  );

  const updateDetails = useMutation(
    trpc.journey.updateDetails.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.journey.pathFilter());
        props.onOpenChange(false);
        toast.success("Details updated");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Journey Details</DialogTitle>
          <DialogDescription>
            Update the company name and offer details.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="editCompanyName">Company Name</Label>
            <Input
              id="editCompanyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="editOfferDetails">Offer Details</Label>
            <Textarea
              id="editOfferDetails"
              value={offerDetails}
              onChange={(e) => setOfferDetails(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => props.onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              updateDetails.mutate({
                id: props.journey.id,
                companyName: companyName.trim() || null,
                offerDetails: offerDetails.trim() || null,
              });
            }}
            disabled={updateDetails.isPending}
          >
            {updateDetails.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
