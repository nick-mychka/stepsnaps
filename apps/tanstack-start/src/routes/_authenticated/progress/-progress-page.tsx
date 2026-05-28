import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Road } from "lucide-react";

import { Button } from "@stepsnaps/ui/button";

import type { ViewMode } from "~/features/progress";
import { BackgroundV3 } from "~/components/journey-background";
import { SimpleEmpty } from "~/components/simple-empty";
import { ViewToggle } from "~/features/progress";
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
          <SimpleEmpty
            icon={<Road />}
            title="No Active Journey"
            description="Start a journey from the dashboard to view your progress."
          >
            <Button asChild>
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          </SimpleEmpty>
        ) : (
          <ProgressView activeJourney={activeJourney} view={view} />
        )}
      </main>
    </>
  );
}
