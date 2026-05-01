import type { RouterOutputs } from "@stepsnaps/api";
import { Badge } from "@stepsnaps/ui/badge";
import { Button } from "@stepsnaps/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@stepsnaps/ui/card";

export type JourneyData = RouterOutputs["journey"]["list"][number];

interface Props {
  journey: JourneyData;
  onEdit: () => void;
}

export function JourneyCard({ journey, onEdit }: Props) {
  const start = new Date(journey.startDate);
  const end = journey.endDate ? new Date(journey.endDate) : new Date();
  const duration =
    Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {journey.companyName ?? "Journey"}
          <Badge
            variant={journey.status === "active" ? "default" : "secondary"}
          >
            {journey.status}
          </Badge>
        </CardTitle>
        <CardDescription>
          {journey.startDate} &mdash; {journey.endDate ?? "present"} &middot;{" "}
          {duration} day
          {duration !== 1 && "s"}
        </CardDescription>
        <CardAction>
          {journey.status === "completed" && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              Edit Details
            </Button>
          )}
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {journey.offerDetails && (
          <p className="text-sm">{journey.offerDetails}</p>
        )}
      </CardContent>
    </Card>
  );
}
