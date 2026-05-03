import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { Button } from "@stepsnaps/ui/button";
import { Spinner } from "@stepsnaps/ui/spinner";
import { toast } from "@stepsnaps/ui/toast";

import { authClient } from "~/auth/client";
import { SimpleCard } from "~/components/simple-card";
import { useTRPC } from "~/lib/trpc";

export const Route = createFileRoute("/invite/$token")({
  component: InvitePage,
});

function InvitePage() {
  const { token } = Route.useParams();
  const trpc = useTRPC();
  const navigate = useNavigate();
  const { data: session, isPending: sessionPending } = authClient.useSession();

  const {
    data: invite,
    error,
    isPending: invitePending,
  } = useQuery(trpc.team.inviteByToken.queryOptions({ token }));

  const acceptInvite = useMutation(
    trpc.team.acceptInvite.mutationOptions({
      onSuccess: async (result) => {
        toast.success("Joined the team!");
        await navigate({
          to: "/teams/$teamId",
          params: { teamId: result.teamId },
        });
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const declineInvite = useMutation(
    trpc.team.declineInvite.mutationOptions({
      onSuccess: async () => {
        toast.success("Invite declined");
        await navigate({ to: "/dashboard" });
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  if (sessionPending || invitePending) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <SimpleCard
          description={
            error.message || "This invite link is invalid or has expired."
          }
          className="max-w-md"
          title="Invalid Invite"
        >
          <Button onClick={() => navigate({ to: "/" })}>Go Home</Button>
        </SimpleCard>
      </main>
    );
  }

  // Not logged in — prompt sign in first
  if (!session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6">
        <SimpleCard
          description={
            <>
              You've been invited to join <strong>{invite.teamName}</strong>.
              Sign in to continue.
            </>
          }
          className="max-w-md"
          title="You're invited!"
        >
          <Button
            size="lg"
            className="w-full"
            onClick={async () => {
              const res = await authClient.signIn.social({
                provider: "google",
                callbackURL: `/invite/${token}`,
              });
              if (res.data?.url) {
                await navigate({ href: res.data.url, replace: true });
              }
            }}
          >
            Sign in with Google
          </Button>
        </SimpleCard>
      </main>
    );
  }

  // Logged in — show choices
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <SimpleCard
        className="max-w-md"
        title={<>Join {invite.teamName}?</>}
        description="You've been invited to join this team. Choose how you'd like to proceed."
        contentClassName="flex flex-col gap-3"
      >
        <Button
          className="w-full"
          onClick={() => acceptInvite.mutate({ token })}
          disabled={acceptInvite.isPending}
        >
          {acceptInvite.isPending && <Spinner />}
          Join Team
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate({ to: "/dashboard" })}
        >
          Private Tracking (No Team)
        </Button>
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => declineInvite.mutate({ token })}
          disabled={declineInvite.isPending}
        >
          {declineInvite.isPending && <Spinner />}
          Decline
        </Button>
      </SimpleCard>
    </main>
  );
}
