import { Field, FieldLabel } from "@stepsnaps/ui/field";
import { Input } from "@stepsnaps/ui/input";
import { Progress } from "@stepsnaps/ui/progress";
import { Textarea } from "@stepsnaps/ui/textarea";

interface SnapFormFieldProps {
  stepDefinition: {
    id: string;
    name: string;
    type: "numeric" | "text";
    goalValue: string | null;
  };
  value: string;
  snapGoalValue: string | null | undefined;
  onChange: (value: string) => void;
}

export function SnapFormField({
  stepDefinition,
  value,
  snapGoalValue,
  onChange,
}: SnapFormFieldProps) {
  const goalStr = snapGoalValue ?? stepDefinition.goalValue;
  const goal =
    stepDefinition.type === "numeric" && goalStr ? Number(goalStr) : null;
  const numericVal = Number(value) || 0;

  return (
    <Field className="flex flex-col gap-1.5">
      <FieldLabel htmlFor={stepDefinition.id}>{stepDefinition.name}</FieldLabel>
      {stepDefinition.type === "numeric" ? (
        <>
          <Input
            id={stepDefinition.id}
            type="number"
            min="0"
            step="any"
            placeholder="0"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          {goal !== null && goal > 0 && (
            <div className="flex items-center gap-3">
              <Progress
                value={Math.min((numericVal / goal) * 100, 100)}
                className="flex-1"
              />
              <span className="text-muted-foreground shrink-0 text-xs">
                {numericVal} of {goal}
              </span>
            </div>
          )}
        </>
      ) : (
        <Textarea
          id={stepDefinition.id}
          placeholder="What did you learn?"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </Field>
  );
}
