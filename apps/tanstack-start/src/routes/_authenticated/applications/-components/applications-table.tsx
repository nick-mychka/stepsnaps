import { Link } from "@tanstack/react-router";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import type { RouterOutputs } from "@stepsnaps/api";
import { Badge } from "@stepsnaps/ui/badge";
import { Button } from "@stepsnaps/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@stepsnaps/ui/table";

import { SimpleTooltip } from "~/components/simple-tooltip";
import { useIsClient } from "~/hooks";
import { dayjs, ISO_DATE_FORMAT } from "~/lib/date";
import { StatusBadge } from "./status-badge";

function getDayDiff(appliedAt: string) {
  return dayjs()
    .startOf("day")
    .diff(dayjs(appliedAt, ISO_DATE_FORMAT).startOf("day"), "day");
}

function getHeatmapRowClass(diff: number) {
  if (diff <= 0)
    return "bg-emerald-500/20 hover:bg-emerald-500/30 dark:bg-emerald-300/20 dark:hover:bg-emerald-300/25";
  if (diff === 1)
    return "bg-emerald-500/10 hover:bg-emerald-500/20 dark:bg-emerald-300/10 dark:hover:bg-emerald-300/15";
  if (diff <= 3)
    return "bg-yellow-500/10 hover:bg-yellow-500/20 dark:bg-yellow-300/10 dark:hover:bg-yellow-300/15";
  if (diff <= 7)
    return "bg-orange-500/15 hover:bg-orange-500/25 dark:bg-orange-300/15 dark:hover:bg-orange-300/20";
  return "bg-red-500/15 hover:bg-red-500/25 dark:bg-red-300/15 dark:hover:bg-red-300/20";
}

function getBadgeClass(diff: number) {
  if (diff <= 0) return "bg-emerald-400/20";
  if (diff === 1) return "bg-emerald-400/10";
  if (diff <= 3) return "bg-yellow-400/10";
  if (diff <= 7) return "bg-orange-400/15";
  return "bg-red-400/15";
}

function AppliedBadge({ appliedAt }: { appliedAt: string }) {
  const isClient = useIsClient();
  const formattedDate = dayjs(appliedAt, ISO_DATE_FORMAT).format("MMM D, YYYY");

  if (!isClient) {
    return <Badge variant="secondary">{formattedDate}</Badge>;
  }

  const diff = getDayDiff(appliedAt);
  let label;
  if (diff <= 0) label = "Today";
  else if (diff === 1) label = "Yesterday";
  else label = `${diff} days ago`;

  return (
    <SimpleTooltip content={formattedDate}>
      <Badge variant="secondary" className={getBadgeClass(diff)}>
        {label}
      </Badge>
    </SimpleTooltip>
  );
}

type ApplicationRow = RouterOutputs["jobApplication"]["list"]["items"][number];

const columnHelper = createColumnHelper<ApplicationRow>();

function createColumns(onInterviews: (id: string) => void) {
  return [
    columnHelper.accessor("companyName", {
      header: "Company",
      cell: (info) => (
        <button
          type="button"
          className="text-left font-medium underline-offset-4 hover:underline"
        >
          <Link
            to="/applications/$applicationId"
            params={{ applicationId: info.row.original.id }}
          >
            {info.getValue()}
          </Link>
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
    columnHelper.accessor("source", {
      header: "Source",
      cell: (info) => info.getValue()?.name ?? "—",
    }),
    columnHelper.accessor("appliedAt", {
      header: "Applied",
      cell: (info) => <AppliedBadge appliedAt={info.getValue()} />,
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => <StatusBadge status={info.getValue()} />,
    }),
    columnHelper.accessor("interviews", {
      header: "Interviews",
      cell: (info) => {
        const count = info.getValue().length;
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onInterviews(info.row.original.id)}
          >
            {count > 0
              ? `${count} interview${count > 1 ? "s" : ""}`
              : "Set Interview"}
          </Button>
        );
      },
    }),
  ];
}

interface ApplicationsTableProps {
  data: ApplicationRow[];
  onInterviews: (id: string) => void;
  heatmap?: boolean;
}

export function ApplicationsTable({
  data,
  onInterviews,
  heatmap,
}: ApplicationsTableProps) {
  const columns = createColumns(onInterviews);
  const table = useReactTable({
    data,
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
              <TableRow
                key={row.id}
                className={
                  heatmap
                    ? getHeatmapRowClass(getDayDiff(row.original.appliedAt))
                    : undefined
                }
              >
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
