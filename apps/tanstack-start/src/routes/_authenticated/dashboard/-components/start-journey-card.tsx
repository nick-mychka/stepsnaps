import { Button } from "@stepsnaps/ui/button";
import { Spinner } from "@stepsnaps/ui/spinner";

import { SimpleCard } from "~/components/simple-card";
import { today } from "~/lib/date";
import { useStartJourney } from "../-hooks/use-start-journey";

export function StartJourneyCard() {
  const startJourney = useStartJourney();

  return (
    <SimpleCard
      className="max-w-md"
      title="No active journey"
      description="Start a new journey to begin tracking your daily hiring progress."
    >
      <Button
        onClick={() => {
          startJourney.mutate({ startDate: today() });
        }}
        disabled={startJourney.isPending}
      >
        {startJourney.isPending && <Spinner />}
        Start Journey
      </Button>
    </SimpleCard>
  );
}
