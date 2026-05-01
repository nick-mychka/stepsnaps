import { useState } from "react";
import { Link } from "@tanstack/react-router";

import { Button } from "@stepsnaps/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@stepsnaps/ui/card";

import { BackgroundV3 } from "~/components/journey-background";
import { ChartView } from "./-components/chart-view";
import { TimelineView } from "./-components/timeline-view";
import { useActiveJourney } from "./-hooks/use-active-journey";

type ViewMode = "timeline" | "chart";

export function ProgressPage() {
  const { data: activeJourney } = useActiveJourney();

  const [view, setView] = useState<ViewMode>("timeline");

  if (!activeJourney) {
    return (
      <main className="container mx-auto py-8">
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>No Active Journey</CardTitle>
            <CardDescription>
              Start a journey from the dashboard to view your progress.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <>
      <BackgroundV3 />
      <main className="container mx-auto py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Progress</h1>
          <div className="flex gap-1 rounded-lg border p-1">
            <Button
              variant={view === "timeline" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("timeline")}
            >
              Timeline
            </Button>
            <Button
              variant={view === "chart" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("chart")}
            >
              Chart
            </Button>
          </div>
        </div>

        {view === "timeline" ? (
          <TimelineView journeyId={activeJourney.id} />
        ) : (
          <ChartView
            journeyId={activeJourney.id}
            startDate={activeJourney.startDate}
            endDate={activeJourney.endDate}
          />
        )}
      </main>
    </>
  );
}
