import { Badge } from "@stepsnaps/ui/badge";

interface StatusBadgeProps {
  status: string;
  closedReason?: string | null;
}

export function StatusBadge({ status, closedReason }: StatusBadgeProps) {
  const labels: Record<string, string> = {
    pending: "Pending",
    interviewing: "Interviewing",
    on_hold: "On Hold",
    closed: "Closed",
  };

  const colorClasses: Record<string, string> = {
    pending:
      "border-transparent bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    interviewing:
      "border-transparent bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    on_hold:
      "border-transparent bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    closed:
      "border-transparent bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  };

  const closedReasonColors: Record<string, string> = {
    success:
      "border-transparent bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    rejected:
      "border-transparent bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    withdrawn:
      "border-transparent bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    no_response:
      "border-transparent bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  };

  const className =
    status === "closed" && closedReason
      ? (closedReasonColors[closedReason] ?? colorClasses.closed)
      : (colorClasses[status] ?? colorClasses.pending);

  return <Badge className={className}>{labels[status] ?? status}</Badge>;
}
