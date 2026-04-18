import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
import { StatusBadge } from "./status-badge";

interface EditApplicationDialogProps {
  applicationId: string | null;
  onOpenChange: (open: boolean) => void;
  onClose: (id: string) => void;
}

export function EditApplicationDialog(props: EditApplicationDialogProps) {
  const trpc = useTRPC();

  const { data: application } = useQuery(
    trpc.jobApplication.byId.queryOptions(
      { id: props.applicationId ?? "" },
      { enabled: !!props.applicationId },
    ),
  );

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
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [companyName, setCompanyName] = useState(props.application.companyName);
  const [jobTitle, setJobTitle] = useState(props.application.jobTitle ?? "");
  const [salary, setSalary] = useState(props.application.salary ?? "");
  const [workMode, setWorkMode] = useState(props.application.workMode);
  const [jobUrl, setJobUrl] = useState(props.application.jobUrl ?? "");
  const [sourceName, setSourceName] = useState(
    props.application.source?.name ?? "",
  );

  const updateApplication = useMutation(
    trpc.jobApplication.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.jobApplication.pathFilter());
        await queryClient.invalidateQueries(trpc.source.pathFilter());
        props.onOpenChange(false);
        toast.success("Application updated!");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );

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
      <div className="flex flex-col gap-4 py-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="edit-companyName">Company Name *</Label>
          <Input
            id="edit-companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="edit-jobTitle">Job Title</Label>
          <Input
            id="edit-jobTitle"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="edit-salary">Salary</Label>
          <Input
            id="edit-salary"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="edit-workMode">Work Mode</Label>
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
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="edit-sourceName">Source</Label>
          <SourceTypeahead value={sourceName} onChange={setSourceName} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="edit-jobUrl">Job URL</Label>
          <Input
            id="edit-jobUrl"
            type="url"
            placeholder="https://..."
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
          />
        </div>

        {/* Status actions */}
        <div className="border-t pt-4">
          <Label className="text-muted-foreground mb-2 block text-sm">
            Status: <StatusBadge status={status} />
          </Label>
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
        <Button type="submit" disabled={updateApplication.isPending}>
          {updateApplication.isPending && <Spinner />}
          Save Changes
        </Button>
      </DialogFooter>
    </form>
  );
}
