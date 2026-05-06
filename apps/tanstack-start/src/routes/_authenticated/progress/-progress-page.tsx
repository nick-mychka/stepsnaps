import { useState } from "react";
import { Link } from "@tanstack/react-router";

import { Button } from "@stepsnaps/ui/button";

import type { ViewMode } from "~/features/snap/types";
import { BackgroundV3 } from "~/components/journey-background";
import { SimpleCard } from "~/components/simple-card";
import { ViewToggle } from "~/features/snap/components/view-toggle";
import { ProgressView } from "./-components/progress-view";
import { useActiveJourney } from "./-hooks/use-active-journey";

export function ProgressPage() {
  const { data: activeJourney } = useActiveJourney();

  const [view, setView] = useState<ViewMode>("timeline");

  return (
    <>
      <BackgroundV3 />
      <main className="container mx-auto px-3 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Progress</h1>
          <ViewToggle view={view} onChange={setView} />
        </div>

        {!activeJourney ? (
          <SimpleCard
            className="max-w-lg"
            title="No Active Journey"
            description="Start a journey from the dashboard to view your progress."
          >
            <Button asChild>
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          </SimpleCard>
        ) : (
          <ProgressView activeJourney={activeJourney} view={view} />
        )}
      </main>
    </>
  );
}
