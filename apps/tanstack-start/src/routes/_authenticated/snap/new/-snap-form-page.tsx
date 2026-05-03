import { Link } from "@tanstack/react-router";

import { Button } from "@stepsnaps/ui/button";

import { SimpleEmpty } from "~/components/simple-empty";
import { dayjs, today } from "~/lib/date";
import { Route } from ".";
import { SnapForm } from "./-components/snap-form";
import { useActiveJourney } from "./-hooks/use-active-journey";

export function SnapFormPage() {
  const { data: activeJourney } = useActiveJourney();
  const { date: dateParam } = Route.useSearch();

  if (!activeJourney) {
    return (
      <main className="container mx-auto py-8">
        <SimpleEmpty
          title="No Active Journey"
          description="Start a journey from the dashboard to begin logging snaps."
        >
          <Button asChild>
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        </SimpleEmpty>
      </main>
    );
  }

  const targetDate = dateParam ?? today();
  const isFuture = dayjs(targetDate).isAfter(today(), "day");
  const isBeforeJourney = dayjs(targetDate).isBefore(
    activeJourney.startDate,
    "day",
  );

  if (isFuture || isBeforeJourney) {
    return (
      <main className="container mx-auto py-8">
        <SimpleEmpty
          title="Invalid snap date"
          description={
            isFuture
              ? "You can't snap a future date."
              : "That date is before your journey started."
          }
        >
          <Button asChild>
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        </SimpleEmpty>
      </main>
    );
  }

  return <SnapForm journeyId={activeJourney.id} date={targetDate} />;
}
