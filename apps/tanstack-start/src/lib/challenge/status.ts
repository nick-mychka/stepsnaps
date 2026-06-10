/**
 * Effective lifecycle status. The database transition `active → completed`
 * is persisted lazily on server reads, so a client may briefly hold an
 * "active" challenge whose end date has already passed — derive, don't trust.
 */

export type ChallengeStatus = "active" | "completed" | "stopped";

export interface StatusInput {
  status: ChallengeStatus;
  endDate: string | null;
  /** The effective today (client-local). */
  today: string;
}

/**
 * An active challenge whose end date is in the past is completed regardless
 * of miss rate; the end date itself is still a live day. Stopped is terminal
 * and open-ended challenges never auto-complete.
 */
export function effectiveStatus(input: StatusInput): ChallengeStatus {
  if (
    input.status === "active" &&
    input.endDate !== null &&
    input.endDate < input.today
  ) {
    return "completed";
  }
  return input.status;
}
