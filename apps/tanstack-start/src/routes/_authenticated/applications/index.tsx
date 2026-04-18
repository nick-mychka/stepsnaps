import { useRef, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Badge } from "@stepsnaps/ui/badge";
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
import { RadioGroup, RadioGroupItem } from "@stepsnaps/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@stepsnaps/ui/select";
import { Separator } from "@stepsnaps/ui/separator";
import { Spinner } from "@stepsnaps/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@stepsnaps/ui/tabs";
import { Textarea } from "@stepsnaps/ui/textarea";
import { toast } from "@stepsnaps/ui/toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@stepsnaps/ui/tooltip";

import { useTRPC } from "~/lib/trpc";
import { ApplicationsTable } from "./-components/applications-table";
import { EmptyState } from "./-components/empty-state";
import { HistoryTable } from "./-components/history-table";
import { PaginationControls } from "./-components/pagination-controls";
import { SourceTypeahead } from "./-components/source-typeahead";
import { StatusBadge } from "./-components/status-badge";

export const Route = createFileRoute("/_authenticated/applications/")({
  loader: ({ context }) => {
    const { trpc, queryClient } = context;
    void queryClient.prefetchQuery(
      trpc.jobApplication.list.queryOptions({ page: 1, tab: "active" }),
    );
  },
  component: ApplicationsPage,
});

function ApplicationsPage() {
  const [activeTab, setActiveTab] = useState<"active" | "closed">("active");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [closingAppId, setClosingAppId] = useState<string | null>(null);
  const [interviewsAppId, setInterviewsAppId] = useState<string | null>(null);

  const trpc = useTRPC();

  // Debounce search input
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
  };

  // Active tab query (always fetched for initial load / nav check)
  const activeListInput = {
    page: activeTab === "active" ? page : 1,
    tab: "active" as const,
    ...(statusFilter !== "all"
      ? { status: statusFilter as "pending" | "interviewing" | "on_hold" }
      : {}),
    ...(activeTab === "active" && debouncedSearch.trim()
      ? { search: debouncedSearch.trim() }
      : {}),
  };

  const { data: activeData } = useSuspenseQuery(
    trpc.jobApplication.list.queryOptions(activeListInput),
  );

  // History tab query (lazy-loaded only when History tab is selected)
  const { data: historyData } = useQuery(
    trpc.jobApplication.list.queryOptions(
      {
        page: activeTab === "closed" ? page : 1,
        tab: "closed" as const,
        ...(activeTab === "closed" && debouncedSearch.trim()
          ? { search: debouncedSearch.trim() }
          : {}),
      },
      {
        enabled: activeTab === "closed",
      },
    ),
  );

  const currentData = activeTab === "active" ? activeData : historyData;
  const totalPages = currentData
    ? Math.max(1, Math.ceil(currentData.total / currentData.perPage))
    : 1;

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as "active" | "closed");
    setPage(1);
    setStatusFilter("all");
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  return (
    <main className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Applications</h1>
        <Button onClick={() => setShowAddDialog(true)}>Add Application</Button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="closed">History</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Input
              placeholder="Search by company..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-56"
            />
            {activeTab === "active" && (
              <Select
                value={statusFilter}
                onValueChange={handleStatusFilterChange}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="interviewing">Interviewing</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <TabsContent value="active">
          {activeData.total === 0 &&
          !debouncedSearch &&
          statusFilter === "all" ? (
            <EmptyState onAdd={() => setShowAddDialog(true)} />
          ) : (
            <>
              <ApplicationsTable
                data={activeData.items}
                onEdit={setEditingAppId}
                onInterviews={setInterviewsAppId}
              />
              {totalPages > 1 && (
                <PaginationControls
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="closed">
          {historyData ? (
            <>
              <HistoryTable data={historyData.items} />
              {totalPages > 1 && (
                <PaginationControls
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              )}
            </>
          ) : (
            <div className="flex items-center justify-center py-12">
              <span className="text-muted-foreground text-sm">Loading...</span>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AddApplicationDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />

      <EditApplicationDialog
        applicationId={editingAppId}
        onOpenChange={(open) => {
          if (!open) setEditingAppId(null);
        }}
        onClose={(id) => {
          setEditingAppId(null);
          setClosingAppId(id);
        }}
      />

      <CloseApplicationDialog
        applicationId={closingAppId}
        onOpenChange={(open) => {
          if (!open) setClosingAppId(null);
        }}
      />

      <InterviewsDialog
        applicationId={interviewsAppId}
        onOpenChange={(open) => {
          if (!open) setInterviewsAppId(null);
        }}
      />
    </main>
  );
}

// --- Add Application Dialog ---

function AddApplicationDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
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

// --- Edit Application Dialog ---

function EditApplicationDialog(props: {
  applicationId: string | null;
  onOpenChange: (open: boolean) => void;
  onClose: (id: string) => void;
}) {
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

// --- Close Application Dialog ---

const CLOSED_REASONS = [
  {
    value: "rejected" as const,
    label: "Rejected",
    description:
      "The company said no. They reviewed your application or interviewed you and decided not to move forward.",
  },
  {
    value: "withdrawn" as const,
    label: "Withdrawn",
    description:
      "You said no. You pulled out of the process (found another offer, lost interest, bad interview experience, etc.).",
  },
  {
    value: "no_response" as const,
    label: "No Response",
    description: "Silence. You applied, never heard back.",
  },
  {
    value: "success" as const,
    label: "Success",
    description: "You got the offer.",
  },
];

function CloseApplicationDialog(props: {
  applicationId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [closedReason, setClosedReason] = useState<
    "rejected" | "withdrawn" | "no_response" | "success"
  >("no_response");

  const closeApplication = useMutation(
    trpc.jobApplication.close.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.jobApplication.pathFilter());
        props.onOpenChange(false);
        setClosedReason("no_response");
        toast.success("Application closed.");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!props.applicationId) return;
    closeApplication.mutate({
      id: props.applicationId,
      closedReason,
    });
  };

  return (
    <Dialog open={!!props.applicationId} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Close Application</DialogTitle>
            <DialogDescription>
              Choose a reason for closing this application. It will move to your
              history.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <TooltipProvider>
              <RadioGroup
                value={closedReason}
                onValueChange={(v) =>
                  setClosedReason(
                    v as "rejected" | "withdrawn" | "no_response" | "success",
                  )
                }
              >
                {CLOSED_REASONS.map((reason) => (
                  <div key={reason.value} className="flex items-center gap-3">
                    <RadioGroupItem
                      value={reason.value}
                      id={`reason-${reason.value}`}
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Label
                          htmlFor={`reason-${reason.value}`}
                          className="cursor-pointer"
                        >
                          {reason.label}
                        </Label>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        {reason.description}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                ))}
              </RadioGroup>
            </TooltipProvider>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => props.onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={closeApplication.isPending}
            >
              {closeApplication.isPending && <Spinner />}
              Close Application
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- Interviews Dialog ---

const INTERVIEW_TYPE_LABELS: Record<string, string> = {
  phone_screen: "Phone Screen",
  technical: "Technical",
  behavioral: "Behavioral",
  system_design: "System Design",
  hiring_manager: "Hiring Manager",
  other: "Other",
};

type InterviewType =
  | "phone_screen"
  | "technical"
  | "behavioral"
  | "system_design"
  | "hiring_manager"
  | "other";

function InterviewsDialog(props: {
  applicationId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: interviews } = useQuery(
    trpc.interview.list.queryOptions(
      { jobApplicationId: props.applicationId ?? "" },
      { enabled: !!props.applicationId },
    ),
  );

  const [date, setDate] = useState("");
  const [type, setType] = useState<InterviewType>("phone_screen");
  const [note, setNote] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editType, setEditType] = useState<InterviewType>("phone_screen");
  const [editNote, setEditNote] = useState("");

  const invalidate = async () => {
    await queryClient.invalidateQueries(trpc.interview.pathFilter());
    await queryClient.invalidateQueries(trpc.jobApplication.pathFilter());
  };

  const createInterview = useMutation(
    trpc.interview.create.mutationOptions({
      onSuccess: async () => {
        await invalidate();
        setDate("");
        setType("phone_screen");
        setNote("");
        toast.success("Interview added!");
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const updateInterview = useMutation(
    trpc.interview.update.mutationOptions({
      onSuccess: async () => {
        await invalidate();
        setEditingId(null);
        toast.success("Interview updated!");
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const deleteInterview = useMutation(
    trpc.interview.delete.mutationOptions({
      onSuccess: async () => {
        await invalidate();
        toast.success("Interview deleted.");
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!props.applicationId) return;
    createInterview.mutate({
      jobApplicationId: props.applicationId,
      date,
      type,
      note: note.trim() || undefined,
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    updateInterview.mutate({
      id: editingId,
      date: editDate,
      type: editType,
      note: editNote.trim() || null,
    });
  };

  const startEditing = (interview: {
    id: string;
    date: string;
    type: InterviewType;
    note: string | null;
  }) => {
    setEditingId(interview.id);
    setEditDate(interview.date);
    setEditType(interview.type);
    setEditNote(interview.note ?? "");
  };

  return (
    <Dialog
      open={!!props.applicationId}
      onOpenChange={(open) => {
        if (!open) {
          setEditingId(null);
          setDate("");
          setType("phone_screen");
          setNote("");
        }
        props.onOpenChange(open);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Interviews</DialogTitle>
          <DialogDescription>
            Manage interview rounds for this application.
          </DialogDescription>
        </DialogHeader>

        {/* Existing interviews */}
        <div className="flex flex-col gap-3">
          {interviews?.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No interviews yet. Add your first one below.
            </p>
          )}
          {interviews?.map((interview) => (
            <div key={interview.id} className="rounded-md border p-3">
              {editingId === interview.id ? (
                <form onSubmit={handleUpdate} className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm font-medium">
                      Round {interview.round}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      required
                      className="flex-1"
                    />
                    <Select
                      value={editType}
                      onValueChange={(v) => setEditType(v as InterviewType)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(INTERVIEW_TYPE_LABELS).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <Textarea
                    placeholder="Notes..."
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={updateInterview.isPending}
                    >
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        Round {interview.round}
                      </span>
                      <Badge variant="outline">
                        {INTERVIEW_TYPE_LABELS[interview.type] ??
                          interview.type}
                      </Badge>
                    </div>
                    <span className="text-muted-foreground text-sm">
                      {interview.date}
                    </span>
                    {interview.note && (
                      <p className="mt-1 text-sm">{interview.note}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditing(interview)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() =>
                        deleteInterview.mutate({ id: interview.id })
                      }
                      disabled={deleteInterview.isPending}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add new interview */}
        <Separator />
        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          <span className="text-sm font-medium">Add Interview</span>
          <div className="flex gap-2">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="flex-1"
            />
            <Select
              value={type}
              onValueChange={(v) => setType(v as InterviewType)}
            >
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(INTERVIEW_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Textarea
            placeholder="Notes (optional)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <Button type="submit" disabled={createInterview.isPending}>
            {createInterview.isPending && <Spinner />}
            Add Interview
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
