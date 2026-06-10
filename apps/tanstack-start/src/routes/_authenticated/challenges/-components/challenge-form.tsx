import { useState } from "react";

import { Button } from "@stepsnaps/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@stepsnaps/ui/field";
import { Input } from "@stepsnaps/ui/input";
import { RadioGroup, RadioGroupItem } from "@stepsnaps/ui/radio-group";
import { Textarea } from "@stepsnaps/ui/textarea";

import { LoadingButton } from "~/components/loading-button";
import { today } from "~/lib/date";
import { EVERYDAY, WEEKDAYS } from "../-lib/weekdays";

export interface ChallengeFormValues {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  scheduledDays: number[];
}

interface ChallengeFormProps {
  mode?: "create" | "edit";
  initialValues?: Partial<ChallengeFormValues>;
  /** Start date and schedule lock after the first check-in. */
  scheduleLocked?: boolean;
  /** The end date is only editable while the challenge is active. */
  endDateLocked?: boolean;
  onSubmit: (values: ChallengeFormValues) => void;
  isSubmitting: boolean;
}

export function ChallengeForm({
  mode = "create",
  initialValues,
  scheduleLocked = false,
  endDateLocked = false,
  onSubmit,
  isSubmitting,
}: ChallengeFormProps) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [description, setDescription] = useState(
    initialValues?.description ?? "",
  );
  const [startDate, setStartDate] = useState(
    initialValues?.startDate ?? today(),
  );
  const [endDate, setEndDate] = useState(initialValues?.endDate ?? "");
  const initialDays = initialValues?.scheduledDays;
  const [schedule, setSchedule] = useState<"everyday" | "custom">(
    initialDays && initialDays.length < 7 ? "custom" : "everyday",
  );
  const [customDays, setCustomDays] = useState<number[]>(
    initialDays && initialDays.length < 7 ? initialDays : [],
  );

  const toggleDay = (day: number) => {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  // In edit mode an active challenge's end date may move, but never to the
  // past; an untouched end date is the server's diff to ignore.
  const endDateTouched = endDate !== (initialValues?.endDate ?? "");
  const endBeforeToday =
    mode === "edit" && endDateTouched && Boolean(endDate) && endDate < today();
  const endBeforeStart = Boolean(endDate) && endDate < startDate;
  const noCustomDays = schedule === "custom" && customDays.length === 0;
  const canSubmit =
    name.trim().length > 0 &&
    Boolean(startDate) &&
    !endBeforeStart &&
    !endBeforeToday &&
    !noCustomDays;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      startDate,
      endDate,
      scheduledDays: schedule === "everyday" ? EVERYDAY : customDays,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="challenge-name">Name</FieldLabel>
          <Input
            id="challenge-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Solve one LeetCode problem"
            maxLength={256}
            autoFocus={mode === "create"}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="challenge-start">Start date</FieldLabel>
            <Input
              id="challenge-start"
              type="date"
              value={startDate}
              disabled={scheduleLocked}
              onChange={(e) => setStartDate(e.target.value)}
            />
            {scheduleLocked && (
              <FieldDescription>
                Locked after the first check-in
              </FieldDescription>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="challenge-end">
              End date{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </FieldLabel>
            <Input
              id="challenge-end"
              type="date"
              value={endDate}
              min={mode === "edit" && today() > startDate ? today() : startDate}
              disabled={endDateLocked}
              onChange={(e) => setEndDate(e.target.value)}
            />
            {endBeforeStart && (
              <FieldError>
                End date must not be before the start date
              </FieldError>
            )}
            {endBeforeToday && !endBeforeStart && (
              <FieldError>End date cannot be set before today</FieldError>
            )}
          </Field>
        </div>

        <Field>
          <FieldLabel>Schedule</FieldLabel>
          <RadioGroup
            value={schedule}
            onValueChange={(value) =>
              setSchedule(value as "everyday" | "custom")
            }
            className="flex gap-6"
            disabled={scheduleLocked}
          >
            <Field orientation="horizontal" className="w-fit">
              <RadioGroupItem value="everyday" id="schedule-everyday" />
              <FieldLabel htmlFor="schedule-everyday" className="font-normal">
                Every day
              </FieldLabel>
            </Field>
            <Field orientation="horizontal" className="w-fit">
              <RadioGroupItem value="custom" id="schedule-custom" />
              <FieldLabel htmlFor="schedule-custom" className="font-normal">
                Custom days
              </FieldLabel>
            </Field>
          </RadioGroup>
          {schedule === "custom" && (
            <div className="mt-2 flex flex-wrap gap-2">
              {WEEKDAYS.map((day) => (
                <Button
                  key={day.value}
                  type="button"
                  size="sm"
                  disabled={scheduleLocked}
                  variant={
                    customDays.includes(day.value) ? "default" : "outline"
                  }
                  onClick={() => toggleDay(day.value)}
                >
                  {day.label}
                </Button>
              ))}
            </div>
          )}
          {scheduleLocked && (
            <FieldDescription>Locked after the first check-in</FieldDescription>
          )}
          {noCustomDays && <FieldError>Select at least one day</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="challenge-description">
            Description{" "}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </FieldLabel>
          <Textarea
            id="challenge-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this challenge mean? How do you define done?"
            rows={3}
          />
        </Field>

        <LoadingButton
          type="submit"
          loading={isSubmitting}
          disabled={!canSubmit}
          className="w-fit"
        >
          {mode === "create" ? "Create Challenge" : "Save Changes"}
        </LoadingButton>
      </FieldGroup>
    </form>
  );
}
