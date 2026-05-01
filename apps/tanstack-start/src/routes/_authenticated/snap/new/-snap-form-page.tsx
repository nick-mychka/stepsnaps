import { Link } from "@tanstack/react-router";

import { Button } from "@stepsnaps/ui/button";

import { SimpleEmpty } from "~/components/simple-empth";
import { SnapForm } from "./-components/snap-form";
import { useActiveJourney } from "./-hooks/use-active-journey";

export function SnapFormPage() {
  const { data: activeJourney } = useActiveJourney();

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

  return <SnapForm journeyId={activeJourney.id} />;
}
