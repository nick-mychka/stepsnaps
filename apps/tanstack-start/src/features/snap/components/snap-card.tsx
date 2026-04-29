import { BookCheck, SquarePen, Trash2 } from "lucide-react";

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@stepsnaps/ui/card";
import { DropdownMenuItem } from "@stepsnaps/ui/dropdown-menu";

import type { SnapWithValues } from "../types";
import { ActionsMenu } from "~/components/actions-menu";
import { SimpleTooltip } from "~/components/simple-tooltip";
import { dayjs } from "~/lib/date";

interface Props {
  snap: SnapWithValues;
  label?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function SnapCard({ snap, label, onEdit, onDelete }: Props) {
  const hasActions = !!onEdit && !!onDelete;

  // Sort values by step definition sort order
  const sortedValues = [...snap.values].sort(
    (a, b) => a.stepDefinition.sortOrder - b.stepDefinition.sortOrder,
  );

  const hasValues = sortedValues.some(
    (v) => v.numericValue !== null || v.textValue !== null,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {label ?? dayjs(snap.date).format("ddd, MMM D, YYYY")}
        </CardTitle>
        <CardAction>
          {hasActions && (
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
          )}
        </CardAction>
      </CardHeader>
      {hasValues && (
        <CardContent>
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
                      <SimpleTooltip
                        content={value}
                        contentClassName="max-w-100"
                      >
                        <BookCheck className="text-muted-foreground" />
                      </SimpleTooltip>
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
