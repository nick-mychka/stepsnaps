import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import type { RouterOutputs } from "@stepsnaps/api";
import { Button } from "@stepsnaps/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@stepsnaps/ui/table";

import { StatusBadge } from "./status-badge";

type ApplicationRow = RouterOutputs["jobApplication"]["list"]["items"][number];

const columnHelper = createColumnHelper<ApplicationRow>();

function createColumns(
  onEdit: (id: string) => void,
  onInterviews: (id: string) => void,
) {
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
    columnHelper.accessor("source", {
      header: "Source",
      cell: (info) => info.getValue()?.name ?? "—",
    }),
    columnHelper.accessor("appliedAt", {
      header: "Applied",
      cell: (info) => info.getValue(),
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
  onEdit: (id: string) => void;
  onInterviews: (id: string) => void;
}

export function ApplicationsTable(props: ApplicationsTableProps) {
  const columns = createColumns(props.onEdit, props.onInterviews);
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
