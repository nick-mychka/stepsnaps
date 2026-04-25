import { computeStreak } from "~/lib/streak";
import { useJourneySnaps } from "../-hooks/use-journey-snaps";
import { StreakCard } from "./streak-card";

export function StatsRow({ journeyId }: { journeyId: string }) {
  const { data: snaps } = useJourneySnaps(journeyId);
  const streak = computeStreak(snaps.map((s) => s.date));

  return <StreakCard days={streak} />;
}
