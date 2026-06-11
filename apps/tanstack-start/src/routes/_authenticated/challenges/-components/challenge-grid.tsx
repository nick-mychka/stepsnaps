import { cn } from "@stepsnaps/ui";

import type { CellState, GridMonth } from "~/lib/challenge/grid";

const CELL_STYLES: Record<CellState, string> = {
  completed: "bg-primary",
  missed: "bg-destructive/40",
  left: "bg-muted",
  "not-scheduled": "border-border/60 border bg-transparent",
};

const CELL_LABELS: Record<CellState, string> = {
  completed: "Completed",
  missed: "Missed",
  left: "Left",
  "not-scheduled": "Not scheduled",
};

const DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", "Sun"];

interface ChallengeGridProps {
  months: GridMonth[];
}

export function ChallengeGrid({ months }: ChallengeGridProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto pb-2">
        <div className="flex w-max gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs">&nbsp;</span>
            <div className="flex flex-col gap-[3px]">
              {DAY_LABELS.map((label, i) => (
                <span
                  key={i}
                  className="text-muted-foreground flex h-3 items-center text-[9px] leading-none"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          {months.map((month) => (
            <div key={month.key} className="flex flex-col gap-1.5">
              <span className="text-muted-foreground text-xs">
                {month.label}
              </span>
              <div className="flex gap-[3px]">
                {month.weeks.map((week, w) => (
                  <div key={w} className="flex flex-col gap-[3px]">
                    {week.map((cell, d) =>
                      cell ? (
                        <div
                          key={cell.date}
                          title={`${cell.date} · ${CELL_LABELS[cell.state]}`}
                          className={cn(
                            "size-3 rounded-[2px]",
                            CELL_STYLES[cell.state],
                          )}
                        />
                      ) : (
                        <div key={`blank-${d}`} className="size-3" />
                      ),
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-xs">
        {(Object.keys(CELL_STYLES) as CellState[]).map((state) => (
          <span key={state} className="flex items-center gap-1.5">
            <span className={cn("size-3 rounded-[2px]", CELL_STYLES[state])} />
            {CELL_LABELS[state]}
          </span>
        ))}
      </div>
    </div>
  );
}
