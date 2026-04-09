import { useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@stepsnaps/ui/table";
import { toast } from "@stepsnaps/ui/toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@stepsnaps/ui/tooltip";

import { useTRPC } from "~/lib/trpc";

export const Route = createFileRoute("/_authed/applications")({
  loader: ({ context }) => {
    const { trpc, queryClient } = context;
    void queryClient.prefetchQuery(
      trpc.jobApplication.list.queryOptions({ page: 1 }),
    );
  },
  component: ApplicationsPage,
});

function ApplicationsPage() {
  const [page, setPage] = useState(1);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [closingAppId, setClosingAppId] = useState<string | null>(null);

  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.jobApplication.list.queryOptions({ page }),
  );

  const totalPages = Math.max(1, Math.ceil(data.total / data.perPage));

  return (
    <main className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Applications</h1>
        <Button onClick={() => setShowAddDialog(true)}>Add Application</Button>
      </div>

      {data.total === 0 ? (
        <EmptyState onAdd={() => setShowAddDialog(true)} />
      ) : (
        <>
          <ApplicationsTable data={data.items} onEdit={setEditingAppId} />
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-muted-foreground text-sm">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

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
    </main>
  );
}

// --- Empty State ---

function EmptyState(props: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
      <h2 className="mb-2 text-xl font-semibold">No applications yet</h2>
      <p className="text-muted-foreground mb-4">
        Start tracking your job applications to stay organized.
      </p>
      <Button onClick={props.onAdd}>Add Your First Application</Button>
    </div>
  );
}

// --- Table ---

interface ApplicationRow {
  id: string;
  companyName: string;
  jobTitle: string | null;
  salary: string | null;
  workMode: "remote" | "onsite" | "hybrid";
  appliedAt: string;
  status: "pending" | "interviewing" | "on_hold" | "closed";
}

const columnHelper = createColumnHelper<ApplicationRow>();

function createColumns(onEdit: (id: string) => void) {
  return [
    columnHelper.accessor("companyName", {
      header: "Company",
      cell: (info) => (
        <button
          type="button"
          className="text-left font-medium underline-offset-4 hover:underline"
          onClick={() => onEdit(info.row.original.id)}
        >
          {info.getValue()}
        </button>
      ),
    }),
    columnHelper.accessor("jobTitle", {
      header: "Job Title",
      cell: (info) => info.getValue() ?? "—",
    }),
    columnHelper.accessor("salary", {
      header: "Salary",
      cell: (info) => info.getValue() ?? "—",
    }),
    columnHelper.accessor("workMode", {
      header: "Work Mode",
      cell: (info) => {
        const labels: Record<string, string> = {
          remote: "Remote",
          onsite: "Onsite",
          hybrid: "Hybrid",
        };
        return labels[info.getValue()] ?? info.getValue();
      },
    }),
    columnHelper.accessor("appliedAt", {
      header: "Applied",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => <StatusBadge status={info.getValue()} />,
    }),
  ];
}

function StatusBadge(props: { status: string }) {
  const variants: Record<string, "default" | "secondary" | "outline"> = {
    pending: "secondary",
    interviewing: "default",
    on_hold: "outline",
  };
  const labels: Record<string, string> = {
    pending: "Pending",
    interviewing: "Interviewing",
    on_hold: "On Hold",
    closed: "Closed",
  };
  return (
    <Badge variant={variants[props.status] ?? "secondary"}>
      {labels[props.status] ?? props.status}
    </Badge>
  );
}

function ApplicationsTable(props: {
  data: ApplicationRow[];
  onEdit: (id: string) => void;
}) {
  const columns = createColumns(props.onEdit);
  const table = useReactTable({
    data: props.data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No applications found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
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

  const createApplication = useMutation(
    trpc.jobApplication.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.jobApplication.pathFilter());
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createApplication.mutate({
      companyName: companyName.trim(),
      jobTitle: jobTitle.trim() || undefined,
      salary: salary.trim() || undefined,
      workMode,
      jobUrl: jobUrl.trim() || undefined,
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
              {createApplication.isPending ? "Adding..." : "Add Application"}
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

  const updateApplication = useMutation(
    trpc.jobApplication.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.jobApplication.pathFilter());
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
          {updateApplication.isPending ? "Saving..." : "Save Changes"}
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
              {closeApplication.isPending ? "Closing..." : "Close Application"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
