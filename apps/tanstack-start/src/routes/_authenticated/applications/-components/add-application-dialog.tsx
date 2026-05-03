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

import { useCreateApplication } from "../-hooks/use-create-application";
import { SourceTypeahead } from "./source-typeahead";

interface AddApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddApplicationDialog(props: AddApplicationDialogProps) {
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [salary, setSalary] = useState("");
  const [workMode, setWorkMode] = useState<"remote" | "onsite" | "hybrid">(
    "remote",
  );
  const [jobUrl, setJobUrl] = useState("");
  const [sourceName, setSourceName] = useState("");

  const resetForm = () => {
    setCompanyName("");
    setJobTitle("");
    setSalary("");
    setWorkMode("remote");
    setJobUrl("");
    setSourceName("");
  };

  const createApplication = useCreateApplication({
    onSuccess: () => {
      props.onOpenChange(false);
      resetForm();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createApplication.mutate({
      companyName: companyName.trim(),
      jobTitle: jobTitle.trim() || undefined,
      salary: salary.trim() || undefined,
      workMode,
      jobUrl: jobUrl.trim() || undefined,
      sourceName: sourceName.trim() || undefined,
    });
  };

  return (
    <Dialog
      open={props.open}
      onOpenChange={(open) => {
        if (!open) resetForm();
        props.onOpenChange(open);
      }}
    >
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Application</DialogTitle>
            <DialogDescription>
              Track a new job application in your pipeline.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="flex flex-col gap-4 py-4">
            <Field>
              <FieldLabel htmlFor="companyName">Company Name *</FieldLabel>
              <Input
                id="companyName"
                placeholder="e.g. Acme Corp"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="jobTitle">Job Title</FieldLabel>
              <Input
                id="jobTitle"
                placeholder="e.g. Senior Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="salary">Salary</FieldLabel>
              <Input
                id="salary"
                placeholder="e.g. $150k"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="workMode">Work Mode</FieldLabel>
              <Select
                value={workMode}
                onValueChange={(v) =>
                  setWorkMode(v as "remote" | "onsite" | "hybrid")
                }
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
              <FieldLabel htmlFor="sourceName">Source</FieldLabel>
              <SourceTypeahead value={sourceName} onChange={setSourceName} />
            </Field>
            <Field>
              <FieldLabel htmlFor="jobUrl">Job URL</FieldLabel>
              <Input
                id="jobUrl"
                type="url"
                placeholder="https://..."
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
              />
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
            <Button type="submit" disabled={createApplication.isPending}>
              {createApplication.isPending && <Spinner />}
              Add Application
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
