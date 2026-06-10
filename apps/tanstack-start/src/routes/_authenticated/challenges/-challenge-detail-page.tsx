import { getRouteApi, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Flame } from "lucide-react";

import { Badge } from "@stepsnaps/ui/badge";
import { Button } from "@stepsnaps/ui/button";

import { SimpleCard } from "~/components/simple-card";
import { buildGrid } from "~/lib/challenge/grid";
import { computeChallengeStats } from "~/lib/challenge/stats";
import { dayjs, today, yesterday } from "~/lib/date";
import { ChallengeGrid } from "./-components/challenge-grid";
import { useChallenge } from "./-hooks/use-challenge";
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

  return (
    <main className="container mx-auto py-8">
      <Button variant="ghost" size="sm" className="mb-4" asChild>
        <Link to="/challenges">
          <ArrowLeft />
          Challenges
        </Link>
      </Button>

      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">{challenge.name}</h1>
          <Badge variant="secondary">
            {formatSchedule(challenge.scheduledDays)}
          </Badge>
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

      <div className="grid gap-4 sm:grid-cols-2">
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
                  : challenge.endDate && clientToday > challenge.endDate
                    ? "This challenge has ended."
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
    </main>
  );
}
