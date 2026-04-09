import { useState } from "react";
import {
  useMutation,
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
          <ApplicationsTable data={data.items} />
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

const columns = [
  columnHelper.accessor("companyName", {
    header: "Company",
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
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

function ApplicationsTable(props: { data: ApplicationRow[] }) {
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
