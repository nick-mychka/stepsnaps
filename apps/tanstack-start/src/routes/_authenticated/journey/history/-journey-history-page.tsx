import { useState } from "react";

import { EditDetailsDialog } from "./-components/edit-details-dialog";
import { JourneyCard } from "./-components/journey-card";
import { useJourneys } from "./-hooks/use-journeys";

export function JourneyHistoryPage() {
  const { data: journeys } = useJourneys();

  const [selectedJourney, setSelectedJourney] = useState<
    (typeof journeys)[number] | null
  >(null);

  const closeEditDetailsDialog = () => {
    setSelectedJourney(null);
  };

  return (
    <>
      <main className="container mx-auto py-12">
        <h1 className="mb-6 text-3xl font-bold">Journey History</h1>
        {journeys.length === 0 ? (
          <p className="text-muted-foreground">
            No journeys yet. Start one from the dashboard!
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {journeys.map((journey) => (
              <JourneyCard
                key={journey.id}
                journey={journey}
                onEdit={() => {
                  setSelectedJourney(journey);
                }}
              />
            ))}
          </div>
        )}
      </main>
      {selectedJourney && (
        <EditDetailsDialog
          open={!!selectedJourney}
          journey={selectedJourney}
          onOpenChange={closeEditDetailsDialog}
        />
      )}
    </>
  );
}
