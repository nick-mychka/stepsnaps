import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { SimpleCard } from "~/components/simple-card";
import { ChallengeForm } from "./-components/challenge-form";
import { useCreateChallenge } from "./-hooks/use-create-challenge";

export const Route = createFileRoute("/_authenticated/challenges/new")({
  component: NewChallengePage,
});

function NewChallengePage() {
  const navigate = useNavigate();
  const goBack = () => void navigate({ to: "/challenges" });

  const createChallenge = useCreateChallenge({ onSuccess: goBack });

  return (
    <main className="container mx-auto h-full py-8">
      <SimpleCard
        title="New Challenge"
        description="Commit to a habit and track it day by day."
        className="mx-auto max-w-2xl"
      >
        <ChallengeForm
          isSubmitting={createChallenge.isPending}
          onSubmit={(values) =>
            createChallenge.mutate({
              name: values.name,
              description: values.description || undefined,
              startDate: values.startDate,
              endDate: values.endDate || undefined,
              scheduledDays: values.scheduledDays,
            })
          }
        />
      </SimpleCard>
    </main>
  );
}
