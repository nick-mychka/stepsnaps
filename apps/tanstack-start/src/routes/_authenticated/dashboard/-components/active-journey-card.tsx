import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { CalendarDays, CheckCircle2, Flame } from "lucide-react";

import { Button } from "@stepsnaps/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@stepsnaps/ui/card";
import { DropdownMenuItem } from "@stepsnaps/ui/dropdown-menu";

import { ActionsMenu } from "~/components/actions-menu";
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
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <Flame className="size-5 text-orange-400" />
            Active Journey
          </CardTitle>
          <CardDescription>
            Started {dayjs(journey.startDate).format("MMMM D, YYYY")}
          </CardDescription>
          <CardAction>
            <ActionsMenu>
              <DropdownMenuItem onSelect={() => setShowFinishDialog(true)}>
                <CheckCircle2 />
                Finish Journey
              </DropdownMenuItem>
            </ActionsMenu>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-2 pt-10 pb-6">
          <CalendarDays className="text-muted-foreground size-7" />
          <p className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">
            Day
          </p>
          <p className="text-[7rem] leading-none font-black tracking-tight">
            {dayjs().diff(journey.startDate, "day") + 1}
          </p>
          <p className="text-muted-foreground text-sm">of your journey</p>
        </CardContent>
        <CardFooter className="pt-4 pb-6">
          <Button size="lg" className="w-full" asChild>
            <Link to="/snap/new">Log Today's Snap</Link>
          </Button>
        </CardFooter>
      </Card>

      <FinishJourneyDialog
        open={showFinishDialog}
        onOpenChange={setShowFinishDialog}
      />
    </>
  );
}
