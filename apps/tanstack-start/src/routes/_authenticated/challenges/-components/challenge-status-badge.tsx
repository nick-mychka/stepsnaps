import { Badge } from "@stepsnaps/ui/badge";

import type { ChallengeStatus } from "~/lib/challenge/status";

export function ChallengeStatusBadge({ status }: { status: ChallengeStatus }) {
  if (status === "active") {
    return <Badge>Active</Badge>;
  }
  if (status === "completed") {
    return <Badge variant="secondary">Completed</Badge>;
  }
  return <Badge variant="outline">Stopped</Badge>;
}
