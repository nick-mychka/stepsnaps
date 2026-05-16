import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@stepsnaps/ui/button";
import { Separator } from "@stepsnaps/ui/separator";

import { SimpleCard } from "~/components/simple-card";
import { dayjs, ISO_DATE_FORMAT } from "~/lib/date";
import { ClosedReasonBadge } from "./-components/closed-reason-badge";
import { InterviewsDialog } from "./-components/interviews-dialog";
import { StatusBadge } from "./-components/status-badge";
import { useApplication } from "./-hooks/use-application";

const WORK_MODE_LABELS: Record<string, string> = {
  remote: "Remote",
  onsite: "Onsite",
  hybrid: "Hybrid",
};

export const Route = createFileRoute(
  "/_authenticated/applications/$applicationId/",
)({
  loader: ({ context, params }) => {
    const { trpc, queryClient } = context;
    void queryClient.prefetchQuery(
      trpc.jobApplication.byId.queryOptions({ id: params.applicationId }),
    );
  },
  component: ViewApplicationPage,
});

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {label}
      </span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

function ViewApplicationPage() {
  const { applicationId } = Route.useParams();

  const [interviewsOpen, setInterviewsOpen] = useState(false);

  const { data: application } = useApplication(applicationId);

  if (!application) {
    return (
      <main className="container mx-auto py-8">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    );
  }

  const formattedAppliedAt = dayjs(
    application.appliedAt,
    ISO_DATE_FORMAT,
  ).format("MMM D, YYYY");

  return (
    <main className="container mx-auto py-8">
      <SimpleCard
        title={application.companyName}
        description={application.jobTitle ?? undefined}
        actionSlot={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setInterviewsOpen(true)}>
              {application.interviews.length > 0
                ? `${application.interviews.length} interview${application.interviews.length > 1 ? "s" : ""}`
                : "Set Interview"}
            </Button>
            <Button asChild>
              <Link
                to="/applications/$applicationId/edit"
                params={{ applicationId }}
              >
                Edit
              </Link>
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Detail label="Job Title" value={application.jobTitle ?? "—"} />
          <Detail label="Salary" value={application.salary ?? "—"} />
          <Detail
            label="Work Mode"
            value={
              WORK_MODE_LABELS[application.workMode] ?? application.workMode
            }
          />
          <Detail label="Source" value={application.source?.name ?? "—"} />
          <Detail
            label="Job URL"
            value={
              application.jobUrl ? (
                <a
                  href={application.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {application.jobUrl}
                </a>
              ) : (
                "—"
              )
            }
          />
          <Detail label="Applied" value={formattedAppliedAt} />
          <Detail
            label="Status"
            value={
              <StatusBadge
                status={application.status}
                closedReason={application.closedReason}
              />
            }
          />
          {application.status === "closed" && (
            <Detail
              label="Outcome"
              value={<ClosedReasonBadge reason={application.closedReason} />}
            />
          )}
        </div>

        {application.vacancyText && (
          <>
            <Separator className="my-6" />
            <div className="flex flex-col gap-2">
              <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Vacancy Text
              </span>
              <pre className="bg-muted/40 rounded-md p-3 text-sm whitespace-pre-wrap">
                {application.vacancyText}
              </pre>
            </div>
          </>
        )}
      </SimpleCard>

      <InterviewsDialog
        applicationId={interviewsOpen ? applicationId : null}
        onOpenChange={(open) => {
          if (!open) setInterviewsOpen(false);
        }}
      />
    </main>
  );
}
