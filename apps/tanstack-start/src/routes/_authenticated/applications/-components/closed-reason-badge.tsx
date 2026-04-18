import { Badge } from "@stepsnaps/ui/badge";

const CLOSED_REASON_LABELS: Record<string, string> = {
  rejected: "Rejected",
  withdrawn: "Withdrawn",
  no_response: "No Response",
  success: "Success",
};

interface ClosedReasonBadgeProps {
  reason: string | null;
}

export function ClosedReasonBadge({ reason }: ClosedReasonBadgeProps) {
  if (!reason) return <span className="text-muted-foreground">—</span>;

  const colorClasses: Record<string, string> = {
    success:
      "border-transparent bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    rejected:
      "border-transparent bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    withdrawn:
      "border-transparent bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    no_response:
      "border-transparent bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  };

  return (
    <Badge className={colorClasses[reason] ?? ""}>
      {CLOSED_REASON_LABELS[reason] ?? reason}
    </Badge>
  );
}
