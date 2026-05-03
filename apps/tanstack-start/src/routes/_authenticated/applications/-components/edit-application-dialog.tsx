import { useState } from "react";

import { Button } from "@stepsnaps/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@stepsnaps/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@stepsnaps/ui/field";
import { Input } from "@stepsnaps/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@stepsnaps/ui/select";
import { Spinner } from "@stepsnaps/ui/spinner";

import { useApplication } from "../-hooks/use-application";
import { useUpdateApplication } from "../-hooks/use-update-application";
import { SourceTypeahead } from "./source-typeahead";
import { StatusBadge } from "./status-badge";

interface EditApplicationDialogProps {
  applicationId: string | null;
  onOpenChange: (open: boolean) => void;
  onClose: (id: string) => void;
}

export function EditApplicationDialog(props: EditApplicationDialogProps) {
  const { data: application } = useApplication(props.applicationId);

  return (
    <Dialog open={!!props.applicationId} onOpenChange={props.onOpenChange}>
      <DialogContent>
        {application && props.applicationId ? (
          <EditApplicationForm
            application={application}
            applicationId={props.applicationId}
            onOpenChange={props.onOpenChange}
            onClose={props.onClose}
          />
        ) : (
          <DialogHeader>
            <DialogTitle>Edit Application</DialogTitle>
            <DialogDescription>Loading...</DialogDescription>
          </DialogHeader>
        )}
      </DialogContent>
    </Dialog>
  );
}

function EditApplicationForm(props: {
  application: {
    companyName: string;
    jobTitle: string | null;
    salary: string | null;
    workMode: "remote" | "onsite" | "hybrid";
    jobUrl: string | null;
    source: { id: string; name: string } | null;
    status: "pending" | "interviewing" | "on_hold" | "closed";
  };
  applicationId: string;
  onOpenChange: (open: boolean) => void;
  onClose: (id: string) => void;
}) {
  const [companyName, setCompanyName] = useState(props.application.companyName);
  const [jobTitle, setJobTitle] = useState(props.application.jobTitle ?? "");
  const [salary, setSalary] = useState(props.application.salary ?? "");
  const [workMode, setWorkMode] = useState(props.application.workMode);
  const [jobUrl, setJobUrl] = useState(props.application.jobUrl ?? "");
  const [sourceName, setSourceName] = useState(
    props.application.source?.name ?? "",
  );

  const updateApplication = useUpdateApplication({
    onSuccess: () => props.onOpenChange(false),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateApplication.mutate({
      id: props.applicationId,
      companyName: companyName.trim(),
      jobTitle: jobTitle.trim() || null,
      salary: salary.trim() || null,
      workMode,
      jobUrl: jobUrl.trim() || null,
      sourceName: sourceName.trim() || null,
    });
  };

  const handleOnHold = () => {
    updateApplication.mutate({
      id: props.applicationId,
      status: "on_hold",
    });
  };

  const handleResumeInterviewing = () => {
    updateApplication.mutate({
      id: props.applicationId,
      status: "interviewing",
    });
  };

  const { status } = props.application;
  const canPutOnHold = status === "pending" || status === "interviewing";
  const canResumeInterviewing = status === "on_hold";
  const canClose = status === "interviewing" || status === "on_hold";

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Edit Application</DialogTitle>
        <DialogDescription>
          Update the details of this application.
        </DialogDescription>
      </DialogHeader>
      <FieldGroup className="flex flex-col gap-4 py-4">
        <Field>
          <FieldLabel htmlFor="edit-companyName">Company Name *</FieldLabel>
          <Input
            id="edit-companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="edit-jobTitle">Job Title</FieldLabel>
          <Input
            id="edit-jobTitle"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="edit-salary">Salary</FieldLabel>
          <Input
            id="edit-salary"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="edit-workMode">Work Mode</FieldLabel>
          <Select
            value={workMode}
            onValueChange={(v) =>
              setWorkMode(v as "remote" | "onsite" | "hybrid")
            }
          >
            <SelectTrigger id="edit-workMode">
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
          <FieldLabel htmlFor="edit-sourceName">Source</FieldLabel>
          <SourceTypeahead value={sourceName} onChange={setSourceName} />
        </Field>
        <Field>
          <FieldLabel htmlFor="edit-jobUrl">Job URL</FieldLabel>
          <Input
            id="edit-jobUrl"
            type="url"
            placeholder="https://..."
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
          />
        </Field>

        {/* Status actions */}
        <Field>
          <FieldLabel className="text-muted-foreground mb-2 block text-sm">
            Status: <StatusBadge status={status} />
          </FieldLabel>
          <div className="flex gap-2">
            {canPutOnHold && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleOnHold}
                disabled={updateApplication.isPending}
              >
                Put On Hold
              </Button>
            )}
            {canResumeInterviewing && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResumeInterviewing}
                disabled={updateApplication.isPending}
              >
                Resume Interviewing
              </Button>
            )}
            {canClose && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => props.onClose(props.applicationId)}
              >
                Close Application
              </Button>
            )}
          </div>
        </Field>
      </FieldGroup>
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => props.onOpenChange(false)}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={updateApplication.isPending}>
          {updateApplication.isPending && <Spinner />}
          Save Changes
        </Button>
      </DialogFooter>
    </form>
  );
}
