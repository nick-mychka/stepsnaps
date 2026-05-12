import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { SimpleCard } from "~/components/simple-card";
import { ApplicationForm } from "./-components/application-form";
import { CloseApplicationDialog } from "./-components/close-application-dialog";
import { useApplication } from "./-hooks/use-application";
import { useUpdateApplication } from "./-hooks/use-update-application";

export const Route = createFileRoute(
  "/_authenticated/applications/$applicationId/edit",
)({
  loader: ({ context, params }) => {
    const { trpc, queryClient } = context;
    void queryClient.prefetchQuery(
      trpc.jobApplication.byId.queryOptions({ id: params.applicationId }),
    );
  },
  component: EditApplicationPage,
});

function EditApplicationPage() {
  const { applicationId } = Route.useParams();
  const navigate = useNavigate();
  const goBack = () => void navigate({ to: "/applications" });

  const [closing, setClosing] = useState(false);
  const { data: application } = useApplication(applicationId);
  const updateApplication = useUpdateApplication({ onSuccess: goBack });

  if (!application) {
    return (
      <main className="container mx-auto py-8">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    );
  }

  const handleStatus = (status: "on_hold" | "interviewing") => {
    updateApplication.mutate({ id: applicationId, status });
  };

  return (
    <main className="container mx-auto py-8">
      <SimpleCard
        title="Edit Application"
        description="Update the details of this application."
      >
        <ApplicationForm
          mode="edit"
          status={application.status}
          isSubmitting={updateApplication.isPending}
          statusActionPending={updateApplication.isPending}
          initialValues={{
            companyName: application.companyName,
            jobTitle: application.jobTitle ?? "",
            salary: application.salary ?? "",
            workMode: application.workMode,
            jobUrl: application.jobUrl ?? "",
            sourceName: application.source?.name ?? "",
            vacancyText: application.vacancyText ?? "",
          }}
          onSubmit={(values) =>
            updateApplication.mutate({
              id: applicationId,
              companyName: values.companyName,
              jobTitle: values.jobTitle || null,
              salary: values.salary || null,
              workMode: values.workMode,
              jobUrl: values.jobUrl || null,
              sourceName: values.sourceName || null,
              vacancyText: values.vacancyText || null,
            })
          }
          onPutOnHold={() => handleStatus("on_hold")}
          onResumeInterviewing={() => handleStatus("interviewing")}
          onClose={() => setClosing(true)}
        />
      </SimpleCard>

      <CloseApplicationDialog
        applicationId={closing ? applicationId : null}
        onOpenChange={(open) => {
          if (!open) setClosing(false);
        }}
        onSuccess={goBack}
      />
    </main>
  );
}
