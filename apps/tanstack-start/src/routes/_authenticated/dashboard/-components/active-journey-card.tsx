import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { CalendarDays, CheckCircle2, Flame } from "lucide-react";

import { Button } from "@stepsnaps/ui/button";
import { DropdownMenuItem } from "@stepsnaps/ui/dropdown-menu";

import { ActionsMenu } from "~/components/actions-menu";
import { SimpleCard } from "~/components/simple-card";
import { dayjs, yesterday } from "~/lib/date";
import { useJourneySnaps } from "../-hooks/use-journey-snaps";
import { FinishJourneyDialog } from "./finish-journey-dialog";

export function ActiveJourneyCard({
  journey,
}: {
  journey: {
    id: string;
    startDate: string;
    status: string;
    companyName: string | null;
    offerDetails: string | null;
  };
}) {
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const { data: snaps } = useJourneySnaps(journey.id);

  const yesterdayInJourney = dayjs(journey.startDate).isSameOrBefore(
    yesterday(),
    "day",
  );
  const yesterdaySnapped = snaps.some((s) => s.date === yesterday());
  const showYesterdayLink = yesterdayInJourney && !yesterdaySnapped;

  return (
    <>
      <SimpleCard
        title={
          <>
            <Flame className="size-5 text-orange-400" />
            Active Journey
          </>
        }
        description={
          <>Started {dayjs(journey.startDate).format("MMMM D, YYYY")}</>
        }
        actionSlot={
          <ActionsMenu>
            <DropdownMenuItem onSelect={() => setShowFinishDialog(true)}>
              <CheckCircle2 />
              Finish Journey
            </DropdownMenuItem>
          </ActionsMenu>
        }
        footer={
          <div className="flex w-full flex-col gap-3">
            <Button size="lg" className="w-full" asChild>
              <Link to="/snap/new">Log Today's Snap</Link>
            </Button>
            {showYesterdayLink && (
              <Link
                to="/snap/new"
                search={{ date: yesterday() }}
                className="text-muted-foreground hover:text-foreground text-center text-sm hover:underline"
              >
                Forgot to take a snap of yesterday's progress?
              </Link>
            )}
          </div>
        }
        className="w-full max-w-md"
        headerClassName="gap-1"
        titleClassName="flex items-center gap-2 text-xl font-bold"
        actionSlotClassName="-mr-4"
        contentClassName="flex flex-col items-center gap-2 py-2"
      >
        <CalendarDays className="text-muted-foreground" />
        <p className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">
          Day
        </p>
        <p className="text-7xl leading-none font-black tracking-tight">
          {dayjs().diff(journey.startDate, "day") + 1}
        </p>
        <p className="text-muted-foreground text-sm">of your journey</p>
      </SimpleCard>

      <FinishJourneyDialog
        open={showFinishDialog}
        onOpenChange={setShowFinishDialog}
      />
    </>
  );
}
