import { useState } from "react";

import { authClient } from "~/auth/client";
import { ActiveJourneyCard } from "./-components/active-journey-card";
import { BackgroundPicker, BG_VARIANTS } from "./-components/background-picker";
import { StartJourneyCard } from "./-components/start-journey-card";
import { StatsRow } from "./-components/stats-row";
import { TodayFocusCard } from "./-components/today-focus-card";
import { useActiveJourney } from "./-hooks/use-active-journey";
import { getGreeting } from "./-utils/get-greeting";

export function DashboardPage() {
  const { data: activeJourney } = useActiveJourney();
  const { data: session } = authClient.useSession();
  const [activeBg, setActiveBg] =
    useState<(typeof BG_VARIANTS)[number]["id"]>(10);

  const greeting = getGreeting(session?.user.name ?? "", session?.user.id);

  const ActiveBg =
    BG_VARIANTS.find((v) => v.id === activeBg)?.Component ??
    BG_VARIANTS[0].Component;

  return (
    <>
      <ActiveBg />
      <main className="px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{greeting}</h1>
        </div>
        <div className="flex grow justify-between gap-8">
          <div className="flex grow flex-col gap-6">
            {activeJourney && <StatsRow journeyId={activeJourney.id} />}
            {activeJourney ? (
              <ActiveJourneyCard journey={activeJourney} />
            ) : (
              <StartJourneyCard />
            )}
          </div>

          <TodayFocusCard />
        </div>
        <BackgroundPicker activeBg={activeBg} onChange={setActiveBg} />
      </main>
    </>
  );
}
