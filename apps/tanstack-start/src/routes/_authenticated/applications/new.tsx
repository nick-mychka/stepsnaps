import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { SimpleCard } from "~/components/simple-card";
import { ApplicationForm } from "./-components/application-form";
import { useCreateApplication } from "./-hooks/use-create-application";

export const Route = createFileRoute("/_authenticated/applications/new")({
  component: NewApplicationPage,
});

function NewApplicationPage() {
  const navigate = useNavigate();
  const goBack = () => void navigate({ to: "/applications" });

  const createApplication = useCreateApplication({ onSuccess: goBack });

  return (
    <main className="container mx-auto py-8">
      <SimpleCard
        title="Add Application"
        description="Track a new job application in your pipeline."
      >
        <ApplicationForm
          mode="create"
          isSubmitting={createApplication.isPending}
          onCancel={goBack}
          onSubmit={(values) =>
            createApplication.mutate({
              companyName: values.companyName,
              jobTitle: values.jobTitle || undefined,
              salary: values.salary || undefined,
              workMode: values.workMode,
              jobUrl: values.jobUrl || undefined,
              sourceName: values.sourceName || undefined,
              vacancyText: values.vacancyText || undefined,
            })
          }
        />
      </SimpleCard>
    </main>
  );
}
