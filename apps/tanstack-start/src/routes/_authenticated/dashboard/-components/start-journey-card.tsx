import { Button } from "@stepsnaps/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@stepsnaps/ui/card";
import { Spinner } from "@stepsnaps/ui/spinner";

import { today } from "~/lib/date";
import { useStartJourney } from "../-hooks/use-start-journey";

export function StartJourneyCard() {
  const startJourney = useStartJourney();

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
            startJourney.mutate({ startDate: today() });
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
