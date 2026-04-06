import { useState } from "react";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

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

export const Route = createFileRoute("/_authed/dashboard")({
  loader: ({ context }) => {
    const { trpc, queryClient } = context;
    void queryClient.prefetchQuery(trpc.journey.active.queryOptions());
  },
  component: DashboardPage,
});

function DashboardPage() {
  const trpc = useTRPC();
  const { data: activeJourney } = useSuspenseQuery(
    trpc.journey.active.queryOptions(),
  );

  return (
    <main className="container py-8">
      <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>
      {activeJourney ? (
        <ActiveJourneyCard journey={activeJourney} />
      ) : (
        <StartJourneyCard />
      )}
    </main>
  );
}

function StartJourneyCard() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const startJourney = useMutation(
    trpc.journey.start.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.journey.pathFilter());
        toast.success("Journey started!");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>No active journey</CardTitle>
        <CardDescription>
          Start a new journey to begin tracking your daily hiring progress.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={() => {
            const today = new Date().toISOString().slice(0, 10);
            startJourney.mutate({ startDate: today });
          }}
          disabled={startJourney.isPending}
        >
          {startJourney.isPending ? "Starting..." : "Start Journey"}
        </Button>
      </CardContent>
    </Card>
  );
}

function ActiveJourneyCard(props: {
  journey: {
    id: string;
    startDate: string;
    status: string;
    companyName: string | null;
    offerDetails: string | null;
  };
}) {
  const { journey } = props;
  const [showFinishDialog, setShowFinishDialog] = useState(false);

  const startDate = new Date(journey.startDate);
  const today = new Date();
  const dayCount =
    Math.floor(
      (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    ) + 1;

  return (
    <>
      <Card className="max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Active Journey</CardTitle>
            <Badge variant="default">Day {dayCount}</Badge>
          </div>
          <CardDescription>Started {journey.startDate}</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <SnapButton />
          <Button
            variant="destructive"
            onClick={() => setShowFinishDialog(true)}
          >
            Finish Journey
          </Button>
        </CardContent>
      </Card>

      <FinishJourneyDialog
        open={showFinishDialog}
        onOpenChange={setShowFinishDialog}
      />
    </>
  );
}

function SnapButton() {
  const navigate = useNavigate();
  return (
    <Button onClick={() => navigate({ to: "/snap/new" })}>
      Log Today's Snap
    </Button>
  );
}

function FinishJourneyDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [companyName, setCompanyName] = useState("");
  const [offerDetails, setOfferDetails] = useState("");

  const finishJourney = useMutation(
    trpc.journey.finish.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.journey.pathFilter());
        props.onOpenChange(false);
        toast.success("Journey completed! Congrats!");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );

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
            {finishJourney.isPending ? "Finishing..." : "Finish Journey"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
