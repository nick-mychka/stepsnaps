import { cn } from "@stepsnaps/ui";
import { Button } from "@stepsnaps/ui/button";

interface StepListItemProps {
  step: {
    id: string;
    name: string;
    type: "numeric" | "text";
    isPredefined: boolean;
    isActive: boolean;
    goalValue: string | null;
  };
  isFirst: boolean;
  isLast: boolean;
  isReordering: boolean;
  isToggling: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleActive: () => void;
  onEdit: () => void;
}

export function StepListItem({
  step,
  isFirst,
  isLast,
  isReordering,
  isToggling,
  onMoveUp,
  onMoveDown,
  onToggleActive,
  onEdit,
}: StepListItemProps) {
  return (
    <div
      className={cn("flex items-center justify-between rounded-md border p-3", {
        "opacity-50": !step.isActive,
      })}
    >
      <div className="flex items-center gap-2">
        <span className="font-medium">{step.name}</span>
        <span className="bg-muted text-muted-foreground rounded px-1 py-0.5 text-xs">
          {step.type}
        </span>
        {step.isPredefined && (
          <span className="text-muted-foreground text-xs">Predefined</span>
        )}
        {!step.isActive && (
          <span className="text-destructive text-xs">Inactive</span>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          disabled={isFirst || isReordering}
          onClick={onMoveUp}
        >
          &uarr;
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={isLast || isReordering}
          onClick={onMoveDown}
        >
          &darr;
        </Button>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={isToggling}
          onClick={onToggleActive}
        >
          {step.isActive ? "Deactivate" : "Activate"}
        </Button>
      </div>
    </div>
  );
}
