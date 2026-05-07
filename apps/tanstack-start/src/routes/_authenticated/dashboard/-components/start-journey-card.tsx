import { LoadingButton } from "~/components/loading-button";
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
      <LoadingButton
        onClick={() => {
          startJourney.mutate({ startDate: today() });
        }}
        disabled={startJourney.isPending}
        loading={startJourney.isPending}
      >
        Start Journey
      </LoadingButton>
    </SimpleCard>
  );
}
