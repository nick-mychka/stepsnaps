import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { CalendarDays, CheckCircle2, Flame } from "lucide-react";

import { Button } from "@stepsnaps/ui/button";
import { DropdownMenuItem } from "@stepsnaps/ui/dropdown-menu";

import { ActionsMenu } from "~/components/actions-menu";
import { SimpleCard } from "~/components/simple-card";
import { dayjs } from "~/lib/date";
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
          <Button size="lg" className="w-full" asChild>
            <Link to="/snap/new">Log Today's Snap</Link>
          </Button>
        }
        className="max-w-lg"
        titleClassName="flex items-center gap-2 text-2xl font-bold"
        contentClassName="flex flex-col items-center gap-2 pt-10 pb-6"
        footerClassName="pt-4 pb-6"
      >
        <CalendarDays className="text-muted-foreground size-7" />
        <p className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">
          Day
        </p>
        <p className="text-[7rem] leading-none font-black tracking-tight">
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
