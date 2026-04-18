import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@stepsnaps/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@stepsnaps/ui/dialog";
import { Input } from "@stepsnaps/ui/input";
import { Label } from "@stepsnaps/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@stepsnaps/ui/select";
import { Spinner } from "@stepsnaps/ui/spinner";
import { toast } from "@stepsnaps/ui/toast";

import { useTRPC } from "~/lib/trpc";
import { SourceTypeahead } from "./source-typeahead";

interface AddApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddApplicationDialog(props: AddApplicationDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [salary, setSalary] = useState("");
  const [workMode, setWorkMode] = useState<"remote" | "onsite" | "hybrid">(
    "remote",
  );
  const [jobUrl, setJobUrl] = useState("");
  const [sourceName, setSourceName] = useState("");

  const createApplication = useMutation(
    trpc.jobApplication.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.jobApplication.pathFilter());
        await queryClient.invalidateQueries(trpc.source.pathFilter());
        props.onOpenChange(false);
        resetForm();
        toast.success("Application added!");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );

  const resetForm = () => {
    setCompanyName("");
    setJobTitle("");
    setSalary("");
    setWorkMode("remote");
    setJobUrl("");
    setSourceName("");
  };

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
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                placeholder="e.g. Acme Corp"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                placeholder="e.g. Senior Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="salary">Salary</Label>
              <Input
                id="salary"
                placeholder="e.g. $150k"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="workMode">Work Mode</Label>
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
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="sourceName">Source</Label>
              <SourceTypeahead value={sourceName} onChange={setSourceName} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="jobUrl">Job URL</Label>
              <Input
                id="jobUrl"
                type="url"
                placeholder="https://..."
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
              />
            </div>
          </div>
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
