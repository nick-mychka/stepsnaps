import { Link } from "@tanstack/react-router";

import { Badge } from "@stepsnaps/ui/badge";

import { SimpleCard } from "~/components/simple-card";
import { dayjs } from "~/lib/date";
import { ChallengeStatusBadge } from "../../challenges/-components/challenge-status-badge";
import { formatSchedule } from "../../challenges/-lib/weekdays";
import { usePastChallenges } from "./-hooks/use-past-challenges";

function formatDate(date: string) {
  return dayjs(date).format("MMM D, YYYY");
}

export function ChallengeHistoryPage() {
  const { data: challenges } = usePastChallenges();

  return (
    <div className="px-8 py-8">
      <h1 className="mb-6 text-xl font-bold">Challenge History</h1>
      {challenges ? (
        challenges.length === 0 ? (
          <p className="text-muted-foreground">
            No finished challenges yet. Completed and stopped challenges land
            here.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {challenges.map((challenge) => (
              <Link
                key={challenge.id}
                to="/challenges/$challengeId"
                params={{ challengeId: challenge.id }}
                className="rounded-xl transition-opacity hover:opacity-80"
              >
                <SimpleCard
                  title={
                    <span className="flex items-center gap-3">
                      {challenge.name}
                      <ChallengeStatusBadge status={challenge.status} />
                    </span>
                  }
                  description={
                    <>
                      {formatDate(challenge.startDate)} —{" "}
                      {challenge.endDate
                        ? formatDate(challenge.endDate)
                        : "open-ended"}
                    </>
                  }
                  actionSlot={
                    <Badge variant="secondary">
                      {formatSchedule(challenge.scheduledDays)}
                    </Badge>
                  }
                />
              </Link>
            ))}
          </div>
        )
      ) : (
        <p className="text-muted-foreground text-sm">Loading...</p>
      )}
    </div>
  );
}
