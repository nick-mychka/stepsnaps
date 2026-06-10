import { Link } from "@tanstack/react-router";
import { Target } from "lucide-react";

import { Badge } from "@stepsnaps/ui/badge";
import { Button } from "@stepsnaps/ui/button";

import { SimpleCard } from "~/components/simple-card";
import { SimpleEmpty } from "~/components/simple-empty";
import { dayjs } from "~/lib/date";
import { useActiveChallenges } from "./-hooks/use-active-challenges";
import { formatSchedule } from "./-lib/weekdays";

function formatDate(date: string) {
  return dayjs(date).format("MMM D, YYYY");
}

export function ChallengesPage() {
  const { data: challenges } = useActiveChallenges();

  return (
    <main className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Challenges</h1>
        <Button asChild>
          <Link to="/challenges/new">New Challenge</Link>
        </Button>
      </div>

      {challenges ? (
        challenges.length === 0 ? (
          <SimpleEmpty
            icon={<Target />}
            title="No active challenges"
            description="Commit to a habit and track your consistency day by day."
          >
            <Button asChild>
              <Link to="/challenges/new">Start Your First Challenge</Link>
            </Button>
          </SimpleEmpty>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {challenges.map((challenge) => (
              <SimpleCard
                key={challenge.id}
                title={challenge.name}
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
              >
                {challenge.description && (
                  <p className="text-muted-foreground line-clamp-3 text-sm">
                    {challenge.description}
                  </p>
                )}
              </SimpleCard>
            ))}
          </div>
        )
      ) : (
        <div className="flex items-center justify-center py-12">
          <span className="text-muted-foreground text-sm">Loading...</span>
        </div>
      )}
    </main>
  );
}
