import { useState } from "react";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CalendarDays, CheckCircle2, Flame } from "lucide-react";

import { cn } from "@stepsnaps/ui";
import { Button } from "@stepsnaps/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
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
import { DropdownMenuItem } from "@stepsnaps/ui/dropdown-menu";
import { Input } from "@stepsnaps/ui/input";
import { Label } from "@stepsnaps/ui/label";
import { Spinner } from "@stepsnaps/ui/spinner";
import { Textarea } from "@stepsnaps/ui/textarea";
import { toast } from "@stepsnaps/ui/toast";

import { authClient } from "~/auth/client";
import { ActionsMenu } from "~/components/actions-menu";
import {
  BackgroundV1,
  BackgroundV2,
  BackgroundV3,
  BackgroundV4,
  BackgroundV5,
  BackgroundV6,
  BackgroundV8,
  BackgroundV10,
  BackgroundV11,
  BackgroundV12,
  BackgroundV13,
} from "~/components/journey-background";
import { dayjs } from "~/lib/date";
import { computeStreak } from "~/lib/streak";
import { useTRPC } from "~/lib/trpc";

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  const firstName = name.split(" ")[0];
  if (!firstName) return "Welcome back 👋";
  if (hour >= 5 && hour < 12) return `Good Morning, ${firstName} 🌤️`;
  if (hour >= 12 && hour < 18) return `Good Afternoon, ${firstName} ☀️`;
  return `Good Evening, ${firstName} 🌙`;
}

export const Route = createFileRoute("/_authenticated/dashboard")({
  loader: ({ context }) => {
    const { trpc, queryClient } = context;
    void queryClient.prefetchQuery(trpc.journey.active.queryOptions());
  },
  component: DashboardPage,
});

const BG_VARIANTS = [
  { id: 1 as const, label: "Thorny Path", Component: BackgroundV1 },
  { id: 2 as const, label: "Network", Component: BackgroundV2 },
  { id: 3 as const, label: "Ribbons", Component: BackgroundV3 },
  { id: 4 as const, label: "Hex Grid", Component: BackgroundV4 },
  { id: 5 as const, label: "Symbiosis", Component: BackgroundV5 },
  { id: 6 as const, label: "Circuit Board", Component: BackgroundV6 },
  // { id: 7 as const, label: "Flow Field", Component: BackgroundV7 },
  { id: 8 as const, label: "Word Scatter", Component: BackgroundV8 },
  { id: 10 as const, label: "Orbital Rings", Component: BackgroundV10 },
  { id: 11 as const, label: "Topographic", Component: BackgroundV11 },
  { id: 12 as const, label: "Deep Thorny Path", Component: BackgroundV12 },
  { id: 13 as const, label: "Deep Ribbons", Component: BackgroundV13 },
  // { id: 9 as const, label: "Deep Network", Component: BackgroundV9 },
];

function DashboardPage() {
  const trpc = useTRPC();
  const { data: activeJourney } = useSuspenseQuery(
    trpc.journey.active.queryOptions(),
  );
  const { data: session } = authClient.useSession();
  const [activeBg, setActiveBg] =
    useState<(typeof BG_VARIANTS)[number]["id"]>(10);

  const greeting = getGreeting(session?.user.name ?? "");

  const activeBgEntry = BG_VARIANTS.find((v) => v.id === activeBg);
  const ActiveBg = activeBgEntry ? activeBgEntry.Component : BackgroundV10;

  return (
    <>
      <ActiveBg />
      <main className="px-8 py-12">
        <div
          className={cn(
            "flex justify-between",
            activeJourney ? "mb-4" : "mb-16",
          )}
        >
          <h1 className="text-3xl font-bold">{greeting}</h1>
          {activeJourney && <StatsRow journeyId={activeJourney.id} />}
        </div>
        {activeJourney ? (
          <ActiveJourneyCard journey={activeJourney} />
        ) : (
          <StartJourneyCard />
        )}

        {/* ── Temporary background picker ── */}
        <div className="mt-10 max-w-xl">
          <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-widest uppercase">
            Choose background
          </p>
          <div className="grid grid-cols-4 gap-3">
            {BG_VARIANTS.map(({ id, label, Component }) => (
              <button
                key={id}
                onClick={() => setActiveBg(id)}
                className={[
                  "group flex flex-col gap-1.5 overflow-hidden rounded-lg border-2 p-0 transition-all",
                  activeBg === id
                    ? "border-primary shadow-primary/20 shadow-md"
                    : "border-border hover:border-muted-foreground/50",
                ].join(" ")}
              >
                {/* Mini preview */}
                <div className="bg-muted/30 relative h-16 w-full overflow-hidden">
                  <Component preview />
                </div>
                <p className="text-muted-foreground group-hover:text-foreground pb-2 text-center text-[10px] font-medium">
                  {label}
                </p>
              </button>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

// ─── Stats Row ────────────────────────────────────────────────────────────────

function StatsRow({ journeyId }: { journeyId: string }) {
  const trpc = useTRPC();
  const { data: snaps } = useSuspenseQuery(
    trpc.snap.list.queryOptions({ journeyId }),
  );
  const streak = computeStreak(snaps.map((s) => s.date));

  return <StreakCard days={streak} />;
}

function StreakCard({ days }: { days: number }) {
  return (
    <Card className="w-fit py-4">
      <CardContent className="flex items-center gap-4 px-5">
        <span className="text-3xl" aria-hidden>
          🔥
        </span>
        <div className="flex flex-col">
          <span className="text-3xl leading-none font-bold text-orange-400">
            {days}
          </span>
          <span className="text-muted-foreground text-sm">day streak</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Active Journey Card ──────────────────────────────────────────────────────

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
  const navigate = useNavigate();
  const [showFinishDialog, setShowFinishDialog] = useState(false);

  return (
    <>
      <Card className="max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Flame className="size-5 text-orange-400" />
            <CardTitle className="text-2xl font-bold">Active Journey</CardTitle>
          </div>
          <CardDescription>
            Started {dayjs(journey.startDate).format("MMMM D, YYYY")}
          </CardDescription>
          <CardAction>
            <ActionsMenu>
              <DropdownMenuItem onSelect={() => setShowFinishDialog(true)}>
                <CheckCircle2 />
                Finish Journey
              </DropdownMenuItem>
            </ActionsMenu>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-2 pt-10 pb-6">
          <CalendarDays className="text-muted-foreground size-7" />
          <p className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">
            Day
          </p>
          <p className="text-[7rem] leading-none font-black tracking-tight">
            {dayjs().diff(journey.startDate, "day") + 1}
          </p>
          <p className="text-muted-foreground text-sm">of your journey</p>
        </CardContent>
        <CardFooter className="pt-4 pb-6">
          <Button
            size="lg"
            className="w-full"
            onClick={() => void navigate({ to: "/snap/new" })}
          >
            Log Today's Snap
          </Button>
        </CardFooter>
      </Card>

      <FinishJourneyDialog
        open={showFinishDialog}
        onOpenChange={setShowFinishDialog}
      />
    </>
  );
}

// ─── Start Journey Card ───────────────────────────────────────────────────────

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
          {startJourney.isPending && <Spinner />}
          Start Journey
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Finish Journey Dialog ────────────────────────────────────────────────────

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
            {finishJourney.isPending && <Spinner />}
            Finish Journey
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
