import { Link } from "@tanstack/react-router";
import { Check, Target } from "lucide-react";

import { Button } from "@stepsnaps/ui/button";

import { SimpleCard } from "~/components/simple-card";
import { today } from "~/lib/date";
import { useTodayCheckIns } from "../-hooks/use-today-check-ins";
import { useToggleCompletion } from "../../challenges/-hooks/use-toggle-completion";

/**
 * Today's pending challenge check-ins, markable inline. Renders nothing when
 * no active challenge is scheduled today.
 */
export function ChallengeCheckInsCard() {
  const { data: checkIns } = useTodayCheckIns();
  const toggleCompletion = useToggleCompletion();

  if (!checkIns || checkIns.length === 0) return null;

  const clientToday = today();

  return (
    <SimpleCard
      title={
        <>
          <Target className="text-primary size-5" />
          Challenges
        </>
      }
      actionSlot={
        <Link to="/challenges" className="text-primary text-sm hover:underline">
          View All
        </Link>
      }
      className="w-full max-w-lg"
      titleClassName="flex items-center gap-2 text-2xl font-bold"
      actionSlotClassName="py-1"
    >
      <ul className="flex flex-col gap-2">
        {checkIns.map((checkIn) => (
          <li
            key={checkIn.id}
            className="flex items-center justify-between gap-4"
          >
            <Link
              to="/challenges/$challengeId"
              params={{ challengeId: checkIn.id }}
              className="truncate text-sm font-medium hover:underline"
            >
              {checkIn.name}
            </Link>
            <Button
              variant={checkIn.completed ? "default" : "outline"}
              size="sm"
              className="shrink-0"
              disabled={toggleCompletion.isPending}
              onClick={() =>
                toggleCompletion.mutate({
                  challengeId: checkIn.id,
                  date: clientToday,
                  today: clientToday,
                  completed: !checkIn.completed,
                })
              }
            >
              {checkIn.completed && <Check />}
              {checkIn.completed ? "Done" : "Mark done"}
            </Button>
          </li>
        ))}
      </ul>
    </SimpleCard>
  );
}
