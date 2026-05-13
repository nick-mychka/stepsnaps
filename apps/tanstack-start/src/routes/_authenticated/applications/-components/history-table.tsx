import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import type { RouterOutputs } from "@stepsnaps/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@stepsnaps/ui/table";

import { ClosedReasonBadge } from "./closed-reason-badge";

type HistoryRow = RouterOutputs["jobApplication"]["list"]["items"][number];

const historyColumnHelper = createColumnHelper<HistoryRow>();

function createHistoryColumns(onView: (id: string) => void) {
  return [
    historyColumnHelper.accessor("companyName", {
      header: "Company",
      cell: (info) => (
        <button
          type="button"
          className="text-left font-medium underline-offset-4 hover:underline"
          onClick={() => onView(info.row.original.id)}
        >
          {info.getValue()}
        </button>
      ),
    }),
    historyColumnHelper.accessor("jobTitle", {
      header: "Job Title",
      cell: (info) => info.getValue() ?? "—",
    }),
    historyColumnHelper.accessor("salary", {
      header: "Salary",
      cell: (info) => info.getValue() ?? "—",
    }),
    historyColumnHelper.accessor("source", {
      header: "Source",
      cell: (info) => info.getValue()?.name ?? "—",
    }),
    historyColumnHelper.accessor("appliedAt", {
      header: "Applied",
      cell: (info) => info.getValue(),
    }),
    historyColumnHelper.accessor("closedReason", {
      header: "Outcome",
      cell: (info) => <ClosedReasonBadge reason={info.getValue()} />,
    }),
    historyColumnHelper.accessor("interviews", {
      header: "Interviews",
      cell: (info) => {
        const count = info.getValue().length;
        return count > 0 ? `${count}` : "—";
      },
    }),
  ];
}

interface HistoryTableProps {
  data: HistoryRow[];
  onView: (id: string) => void;
}

export function HistoryTable({ data, onView }: HistoryTableProps) {
  const columns = createHistoryColumns(onView);
  const table = useReactTable({
    data: data,
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
                No closed applications yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
