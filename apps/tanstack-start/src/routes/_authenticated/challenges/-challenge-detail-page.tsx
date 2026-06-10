import { useState } from "react";
import { getRouteApi, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Flame, OctagonX } from "lucide-react";

import { Badge } from "@stepsnaps/ui/badge";
import { Button } from "@stepsnaps/ui/button";

import { LoadingButton } from "~/components/loading-button";
import { SimpleCard } from "~/components/simple-card";
import { SimpleDialog, SimpleDialogContent } from "~/components/simple-dialog";
import { buildGrid } from "~/lib/challenge/grid";
import { computeChallengeStats } from "~/lib/challenge/stats";
import { effectiveStatus } from "~/lib/challenge/status";
import { dayjs, today, yesterday } from "~/lib/date";
import { ChallengeGrid } from "./-components/challenge-grid";
import { ChallengeStatusBadge } from "./-components/challenge-status-badge";
import { useChallenge } from "./-hooks/use-challenge";
import { useStopChallenge } from "./-hooks/use-stop-challenge";
import { useToggleCompletion } from "./-hooks/use-toggle-completion";
import { formatSchedule } from "./-lib/weekdays";

const route = getRouteApi("/_authenticated/challenges/$challengeId/");

interface CheckInRowProps {
  label: string;
  date: string;
  completed: boolean;
  isPending: boolean;
  onToggle: (completed: boolean) => void;
}

function CheckInRow({
  label,
  date,
  completed,
  isPending,
  onToggle,
}: CheckInRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground ml-2 text-sm">
          {dayjs(date).format("ddd, MMM D")}
        </span>
      </div>
      <Button
        variant={completed ? "default" : "outline"}
        size="sm"
        disabled={isPending}
        onClick={() => onToggle(!completed)}
      >
        {completed && <Check />}
        {completed ? "Done" : "Mark done"}
      </Button>
    </div>
  );
}

export function ChallengeDetailPage() {
  const { challengeId } = route.useParams();
  const { data: challenge } = useChallenge(challengeId);
  const toggleCompletion = useToggleCompletion();
  const navigate = useNavigate();
  const [stopDialogOpen, setStopDialogOpen] = useState(false);
  const stopChallenge = useStopChallenge({
    onSuccess: () => void navigate({ to: "/challenges" }),
  });

  if (!challenge) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="text-muted-foreground text-sm">Loading...</span>
      </div>
    );
  }

  const clientToday = today();
  const clientYesterday = yesterday();

  const isCheckable = (date: string) =>
    challenge.scheduledDays.includes(dayjs(date).day()) &&
    date >= challenge.startDate &&
    (!challenge.endDate || date <= challenge.endDate);

  const isCompleted = (date: string) =>
    challenge.completions.some((c) => c.date === date);

  const toggle = (date: string, completed: boolean) =>
    toggleCompletion.mutate({
      challengeId: challenge.id,
      date,
      today: clientToday,
      completed,
    });

  const logicInput = {
    startDate: challenge.startDate,
    endDate: challenge.endDate,
    scheduledDays: challenge.scheduledDays,
    completedDates: challenge.completions.map((c) => c.date),
    today: clientToday,
  };
  const gridMonths = buildGrid(logicInput);
  const stats = computeChallengeStats(logicInput);
  const status = effectiveStatus({
    status: challenge.status,
    endDate: challenge.endDate,
    today: clientToday,
  });
  const isActive = status === "active";

  return (
    <main className="container mx-auto py-8">
      <Button variant="ghost" size="sm" className="mb-4" asChild>
        <Link to="/challenges">
          <ArrowLeft />
          Challenges
        </Link>
      </Button>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{challenge.name}</h1>
            <Badge variant="secondary">
              {formatSchedule(challenge.scheduledDays)}
            </Badge>
            {!isActive && <ChallengeStatusBadge status={status} />}
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            {dayjs(challenge.startDate).format("MMM D, YYYY")} —{" "}
            {challenge.endDate
              ? dayjs(challenge.endDate).format("MMM D, YYYY")
              : "open-ended"}
          </p>
          {challenge.description && (
            <p className="text-muted-foreground mt-3 max-w-2xl whitespace-pre-wrap">
              {challenge.description}
            </p>
          )}
        </div>

        {isActive && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStopDialogOpen(true)}
          >
            <OctagonX />
            Stop challenge
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {isActive && (
          <SimpleCard title="Check-in">
            <div className="flex flex-col gap-3">
              {isCheckable(clientToday) ? (
                <CheckInRow
                  label="Today"
                  date={clientToday}
                  completed={isCompleted(clientToday)}
                  isPending={toggleCompletion.isPending}
                  onToggle={(completed) => toggle(clientToday, completed)}
                />
              ) : (
                <p className="text-muted-foreground text-sm">
                  {clientToday < challenge.startDate
                    ? "This challenge hasn't started yet."
                    : "Today isn't a scheduled day. Rest up!"}
                </p>
              )}
              {isCheckable(clientYesterday) && (
                <CheckInRow
                  label="Yesterday"
                  date={clientYesterday}
                  completed={isCompleted(clientYesterday)}
                  isPending={toggleCompletion.isPending}
                  onToggle={(completed) => toggle(clientYesterday, completed)}
                />
              )}
            </div>
          </SimpleCard>
        )}

        <SimpleCard title="Progress">
          <div className="flex flex-col gap-2">
            <p className="flex items-center gap-1.5 text-2xl font-bold">
              <Flame
                className={
                  stats.streak > 0 ? "text-primary" : "text-muted-foreground"
                }
              />
              {stats.streak}
              <span className="text-muted-foreground text-sm font-normal">
                day streak
              </span>
            </p>
            <p className="text-muted-foreground text-sm">
              {stats.completedCount} of {stats.elapsedScheduled} scheduled days
              done
            </p>
            {stats.percentComplete !== null && (
              <p className="text-muted-foreground text-sm">
                {stats.percentComplete}% of the challenge complete
              </p>
            )}
          </div>
        </SimpleCard>
      </div>

      <div className="mt-4">
        <SimpleCard title="Activity">
          <ChallengeGrid months={gridMonths} />
        </SimpleCard>
      </div>

      <SimpleDialog open={stopDialogOpen} onOpenChange={setStopDialogOpen}>
        <SimpleDialogContent
          title="Stop this challenge?"
          description="Stopping is permanent — the challenge moves to your archives with its full history, and no further check-ins are possible."
          footer={
            <>
              <Button
                variant="ghost"
                onClick={() => setStopDialogOpen(false)}
                disabled={stopChallenge.isPending}
              >
                Keep going
              </Button>
              <LoadingButton
                variant="destructive"
                loading={stopChallenge.isPending}
                onClick={() =>
                  stopChallenge.mutate({
                    id: challenge.id,
                    today: clientToday,
                  })
                }
              >
                Stop challenge
              </LoadingButton>
            </>
          }
        >
          <span />
        </SimpleDialogContent>
      </SimpleDialog>
    </main>
  );
}
