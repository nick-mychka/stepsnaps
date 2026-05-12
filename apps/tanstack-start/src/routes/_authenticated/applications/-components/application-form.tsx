import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

import { Badge } from "@stepsnaps/ui/badge";
import { Button } from "@stepsnaps/ui/button";
import { Field, FieldGroup, FieldLabel } from "@stepsnaps/ui/field";
import { Input } from "@stepsnaps/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@stepsnaps/ui/select";
import { Separator } from "@stepsnaps/ui/separator";
import { Textarea } from "@stepsnaps/ui/textarea";

import { LoadingButton } from "~/components/loading-button";
import { useExtractFromVacancy } from "../-hooks/use-extract-from-vacancy";
import { SourceTypeahead } from "./source-typeahead";
import { StatusBadge } from "./status-badge";

export type WorkMode = "remote" | "onsite" | "hybrid";
export type ApplicationStatus =
  | "pending"
  | "interviewing"
  | "on_hold"
  | "closed";

export interface ApplicationFormValues {
  companyName: string;
  jobTitle: string;
  salary: string;
  workMode: WorkMode;
  jobUrl: string;
  sourceName: string;
  vacancyText: string;
}

type AiFillableField =
  | "companyName"
  | "jobTitle"
  | "salary"
  | "workMode"
  | "jobUrl"
  | "sourceName";

interface BaseProps {
  initialValues?: Partial<ApplicationFormValues>;
  onSubmit: (values: ApplicationFormValues) => void;
  isSubmitting: boolean;
}

interface CreateProps extends BaseProps {
  mode: "create";
}

interface EditProps extends BaseProps {
  mode: "edit";
  status: ApplicationStatus;
  onPutOnHold: () => void;
  onResumeInterviewing: () => void;
  onClose: () => void;
  statusActionPending: boolean;
}

type ApplicationFormProps = CreateProps | EditProps;

const DEFAULT_VALUES: ApplicationFormValues = {
  companyName: "",
  jobTitle: "",
  salary: "",
  workMode: "remote",
  jobUrl: "",
  sourceName: "",
  vacancyText: "",
};

export function ApplicationForm(props: ApplicationFormProps) {
  const initial = { ...DEFAULT_VALUES, ...props.initialValues };
  const [companyName, setCompanyName] = useState(initial.companyName);
  const [jobTitle, setJobTitle] = useState(initial.jobTitle);
  const [salary, setSalary] = useState(initial.salary);
  const [workMode, setWorkMode] = useState<WorkMode>(initial.workMode);
  const [jobUrl, setJobUrl] = useState(initial.jobUrl);
  const [sourceName, setSourceName] = useState(initial.sourceName);
  const [vacancyText, setVacancyText] = useState(initial.vacancyText);
  const [workModeTouched, setWorkModeTouched] = useState(props.mode === "edit");
  const [aiNotice, setAiNotice] = useState<string | null>(null);
  const [aiFilled, setAiFilled] = useState<Set<AiFillableField>>(
    () => new Set(),
  );

  const clearAiFilled = (field: AiFillableField) => {
    setAiFilled((prev) => {
      if (!prev.has(field)) return prev;
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
  };

  const extract = useExtractFromVacancy();

  const handleGenerate = () => {
    setAiNotice(null);
    extract.mutate(
      { vacancyText: vacancyText.trim() },
      {
        onSuccess: (result) => {
          if (!result.ok) {
            setAiNotice(
              "AI extraction failed. Please fill the fields manually.",
            );
            return;
          }
          const f = result.fields;
          const filledFields = new Set<AiFillableField>();
          if (f.companyName && !companyName.trim()) {
            setCompanyName(f.companyName);
            filledFields.add("companyName");
          }
          if (f.jobTitle && !jobTitle.trim()) {
            setJobTitle(f.jobTitle);
            filledFields.add("jobTitle");
          }
          if (f.salary && !salary.trim()) {
            setSalary(f.salary);
            filledFields.add("salary");
          }
          if (f.jobUrl && !jobUrl.trim()) {
            setJobUrl(f.jobUrl);
            filledFields.add("jobUrl");
          }
          if (f.sourceName && !sourceName.trim()) {
            setSourceName(f.sourceName);
            filledFields.add("sourceName");
          }
          if (f.workMode && !workModeTouched) {
            setWorkMode(f.workMode);
            filledFields.add("workMode");
          }
          setAiFilled(filledFields);
          if (filledFields.size === 0) {
            setAiNotice(
              "AI couldn't extract any new fields from this vacancy text.",
            );
          }
        },
        onError: (error) => {
          if (error.data?.code === "TOO_MANY_REQUESTS") {
            setAiNotice(error.message);
          } else {
            setAiNotice(
              "AI extraction failed. Please fill the fields manually.",
            );
          }
        },
      },
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    props.onSubmit({
      companyName: companyName.trim(),
      jobTitle: jobTitle.trim(),
      salary: salary.trim(),
      workMode,
      jobUrl: jobUrl.trim(),
      sourceName: sourceName.trim(),
      vacancyText: vacancyText.trim(),
    });
  };

  const aiBadge = (field: AiFillableField) =>
    aiFilled.has(field) ? (
      <Badge variant="secondary" className="font-normal">
        <Sparkles />
        AI-filled
      </Badge>
    ) : null;

  const isEdit = props.mode === "edit";
  const canPutOnHold =
    isEdit && (props.status === "pending" || props.status === "interviewing");
  const canResumeInterviewing = isEdit && props.status === "on_hold";
  const canClose =
    isEdit && (props.status === "interviewing" || props.status === "on_hold");

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup className="flex flex-col gap-4">
        <Field>
          <FieldLabel htmlFor="vacancyText">Vacancy details</FieldLabel>
          <Textarea
            id="vacancyText"
            placeholder="Paste the full vacancy posting here..."
            value={vacancyText}
            onChange={(e) => setVacancyText(e.target.value)}
            rows={10}
            maxLength={50_000}
            className="field-sizing-fixed min-h-64"
          />
          {vacancyText.trim().length > 0 && (
            <div className="mt-2 flex justify-between gap-8">
              <div className="flex flex-col gap-2">
                <LoadingButton
                  type="button"
                  variant="outline"
                  size="sm"
                  className="self-start"
                  onClick={handleGenerate}
                  loading={extract.isPending}
                  disabled={extract.isPending}
                >
                  Generate fields with AI
                </LoadingButton>
                {aiNotice && (
                  <p className="text-muted-foreground text-sm">{aiNotice}</p>
                )}
              </div>
              <p>{vacancyText.trim().length}/50 000</p>
            </div>
          )}
        </Field>
      </FieldGroup>
      <Separator className="my-4" />
      <FieldGroup className="flex max-w-lg flex-col gap-4">
        <Field>
          <div className="flex items-center gap-2">
            <FieldLabel htmlFor="companyName">Company Name *</FieldLabel>
            {aiBadge("companyName")}
          </div>
          <Input
            id="companyName"
            placeholder="e.g. Acme Corp"
            value={companyName}
            onChange={(e) => {
              setCompanyName(e.target.value);
              clearAiFilled("companyName");
            }}
            required
          />
        </Field>
        <Field>
          <div className="flex items-center gap-2">
            <FieldLabel htmlFor="jobTitle">Job Title</FieldLabel>
            {aiBadge("jobTitle")}
          </div>
          <Input
            id="jobTitle"
            placeholder="e.g. Senior Engineer"
            value={jobTitle}
            onChange={(e) => {
              setJobTitle(e.target.value);
              clearAiFilled("jobTitle");
            }}
          />
        </Field>
        <Field>
          <div className="flex items-center gap-2">
            <FieldLabel htmlFor="salary">Salary</FieldLabel>
            {aiBadge("salary")}
          </div>
          <Input
            id="salary"
            placeholder="e.g. $150k"
            value={salary}
            onChange={(e) => {
              setSalary(e.target.value);
              clearAiFilled("salary");
            }}
          />
        </Field>
        <Field>
          <div className="flex items-center gap-2">
            <FieldLabel htmlFor="workMode">Work Mode</FieldLabel>
            {aiBadge("workMode")}
          </div>
          <Select
            value={workMode}
            onValueChange={(v) => {
              setWorkMode(v as WorkMode);
              setWorkModeTouched(true);
              clearAiFilled("workMode");
            }}
          >
            <SelectTrigger id="workMode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="remote">Remote</SelectItem>
              <SelectItem value="onsite">Onsite</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <div className="flex items-center gap-2">
            <FieldLabel htmlFor="sourceName">Source</FieldLabel>
            {aiBadge("sourceName")}
          </div>
          <SourceTypeahead
            value={sourceName}
            onChange={(v) => {
              setSourceName(v);
              clearAiFilled("sourceName");
            }}
          />
        </Field>
        <Field>
          <div className="flex items-center gap-2">
            <FieldLabel htmlFor="jobUrl">Job URL</FieldLabel>
            {aiBadge("jobUrl")}
          </div>
          <Input
            id="jobUrl"
            type="url"
            placeholder="https://..."
            value={jobUrl}
            onChange={(e) => {
              setJobUrl(e.target.value);
              clearAiFilled("jobUrl");
            }}
          />
        </Field>

        {isEdit && (
          <Field>
            <FieldLabel className="text-muted-foreground mb-2 block text-sm">
              Status: <StatusBadge status={props.status} />
            </FieldLabel>
            <div className="flex flex-wrap gap-2">
              {canPutOnHold && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={props.onPutOnHold}
                  disabled={props.statusActionPending}
                >
                  Put On Hold
                </Button>
              )}
              {canResumeInterviewing && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={props.onResumeInterviewing}
                  disabled={props.statusActionPending}
                >
                  Resume Interviewing
                </Button>
              )}
              {canClose && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={props.onClose}
                >
                  Close Application
                </Button>
              )}
            </div>
          </Field>
        )}
      </FieldGroup>

      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" variant="outline" asChild>
          <Link to="/applications">Cancel</Link>
        </Button>
        <LoadingButton
          type="submit"
          disabled={props.isSubmitting}
          loading={props.isSubmitting}
        >
          {isEdit ? "Save Changes" : "Add Application"}
        </LoadingButton>
      </div>
    </form>
  );
}
