import type { ReactNode } from "react";

import { Button } from "@stepsnaps/ui/button";

interface StepListItemProps {
  step: {
    id: string;
    name: string;
    type: "numeric" | "text";
    isPredefined: boolean;
    isActive: boolean;
  };
  index: number;
  total: number;
  isReordering: boolean;
  isToggling: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleActive: () => void;
  editDialog?: ReactNode;
}

export function StepListItem({
  step,
  index,
  total,
  isReordering,
  isToggling,
  editDialog,
  onMoveUp,
  onMoveDown,
  onToggleActive,
}: StepListItemProps) {
  return (
    <div
      className={`flex items-center justify-between rounded-md border p-3 ${
        !step.isActive ? "opacity-50" : ""
      }`}
    >
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="font-medium">{step.name}</span>
          <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-xs">
            {step.type}
          </span>
          {step.isPredefined && (
            <span className="text-muted-foreground text-xs">predefined</span>
          )}
          {!step.isActive && (
            <span className="text-destructive text-xs">inactive</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMoveUp}
          disabled={index === 0 || isReordering}
        >
          &uarr;
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onMoveDown}
          disabled={index === total - 1 || isReordering}
        >
          &darr;
        </Button>
        {editDialog}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleActive}
          disabled={isToggling}
        >
          {step.isActive ? "Deactivate" : "Activate"}
        </Button>
      </div>
    </div>
  );
}
