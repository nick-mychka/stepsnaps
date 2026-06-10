import { createFileRoute, getRouteApi, useNavigate } from "@tanstack/react-router";

import { SimpleCard } from "~/components/simple-card";
import { effectiveStatus } from "~/lib/challenge/status";
import { today } from "~/lib/date";
import { ChallengeForm } from "./-components/challenge-form";
import { useChallenge } from "./-hooks/use-challenge";
import { useUpdateChallenge } from "./-hooks/use-update-challenge";

export const Route = createFileRoute("/_authenticated/challenges/$challengeId/edit")(
  {
    loader: ({ context, params }) => {
      const { trpc, queryClient } = context;
      void queryClient.prefetchQuery(
        trpc.challenge.byId.queryOptions({
          id: params.challengeId,
          today: today(),
        }),
      );
    },
    component: EditChallengePage,
  },
);

const route = getRouteApi("/_authenticated/challenges/$challengeId/edit");

function EditChallengePage() {
  const { challengeId } = route.useParams();
  const { data: challenge } = useChallenge(challengeId);
  const navigate = useNavigate();
  const goBack = () =>
    void navigate({
      to: "/challenges/$challengeId",
      params: { challengeId },
    });

  const updateChallenge = useUpdateChallenge({ onSuccess: goBack });

  if (!challenge) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="text-muted-foreground text-sm">Loading...</span>
      </div>
    );
  }

  const isActive =
    effectiveStatus({
      status: challenge.status,
      endDate: challenge.endDate,
      today: today(),
    }) === "active";

  return (
    <main className="container mx-auto h-full py-8">
      <SimpleCard
        title="Edit Challenge"
        description={
          isActive
            ? "Adjust your challenge. The start date and schedule lock after the first check-in."
            : "This challenge has ended — only the name and description can be changed."
        }
        className="mx-auto max-w-2xl"
      >
        <ChallengeForm
          mode="edit"
          initialValues={{
            name: challenge.name,
            description: challenge.description ?? "",
            startDate: challenge.startDate,
            endDate: challenge.endDate ?? "",
            scheduledDays: challenge.scheduledDays,
          }}
          scheduleLocked={!isActive || challenge.completions.length > 0}
          endDateLocked={!isActive}
          isSubmitting={updateChallenge.isPending}
          onSubmit={(values) =>
            updateChallenge.mutate({
              id: challenge.id,
              today: today(),
              name: values.name,
              description: values.description || null,
              startDate: values.startDate,
              endDate: values.endDate || null,
              scheduledDays: values.scheduledDays,
            })
          }
        />
      </SimpleCard>
    </main>
  );
}
