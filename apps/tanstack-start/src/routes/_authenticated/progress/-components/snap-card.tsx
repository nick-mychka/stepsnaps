import { BookCheck, SquarePen, Trash2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@stepsnaps/ui/card";
import { DropdownMenuItem } from "@stepsnaps/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@stepsnaps/ui/tooltip";

import type { SnapWithValues } from "../-types";
import { ActionsMenu } from "~/components/actions-menu";
import { dayjs } from "~/lib/date";

export function SnapCard(props: {
  snap: SnapWithValues;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { snap, onEdit, onDelete } = props;

  // Sort values by step definition sort order
  const sortedValues = [...snap.values].sort(
    (a, b) => a.stepDefinition.sortOrder - b.stepDefinition.sortOrder,
  );

  const hasValues = sortedValues.some(
    (v) => v.numericValue !== null || v.textValue !== null,
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {dayjs(snap.date).format("ddd, MMM D, YYYY")}
          </CardTitle>
          <div className="flex gap-1">
            <ActionsMenu>
              <DropdownMenuItem onSelect={onEdit}>
                <SquarePen />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onDelete}>
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </ActionsMenu>
          </div>
        </div>
      </CardHeader>
      {hasValues && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {sortedValues.map((sv) => {
              const value =
                sv.stepDefinition.type === "numeric"
                  ? sv.numericValue
                  : sv.textValue;
              if (value === null || value === "") return null;

              return (
                <div key={sv.id} className="flex justify-between gap-2">
                  <span className="text-muted-foreground">
                    {sv.stepDefinition.name}
                  </span>
                  <span className="font-medium">
                    {sv.stepDefinition.type === "numeric" ? (
                      value
                    ) : (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <BookCheck className="text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-100">
                            {value}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
