import { Link } from "@tanstack/react-router";
import { Road } from "lucide-react";

import { Button } from "@stepsnaps/ui/button";

import { BackgroundV3 } from "~/components/journey-background";
import { SimpleEmpty } from "~/components/simple-empty";
import { ActiveJourney } from "./-components/active-journey";
import { useActiveJourney } from "./-hooks/use-active-journey";

export function ProgressPage() {
  const { data: activeJourney } = useActiveJourney();

  return (
    <>
      <BackgroundV3 />
      <main className="container mx-auto px-3 py-8">
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
          <ActiveJourney activeJourney={activeJourney} />
        )}
      </main>
    </>
  );
}
