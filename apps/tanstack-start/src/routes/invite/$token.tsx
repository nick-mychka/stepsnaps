import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { Button } from "@stepsnaps/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@stepsnaps/ui/card";
import { toast } from "@stepsnaps/ui/toast";

import { authClient } from "~/auth/client";
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
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Invalid Invite</CardTitle>
            <CardDescription>
              {error.message || "This invite link is invalid or has expired."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate({ to: "/" })}>Go Home</Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Not logged in — prompt sign in first
  if (!session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>You're invited!</CardTitle>
            <CardDescription>
              You've been invited to join <strong>{invite.teamName}</strong>.
              Sign in to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </main>
    );
  }

  // Logged in — show choices
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Join {invite.teamName}?</CardTitle>
          <CardDescription>
            You've been invited to join this team. Choose how you'd like to
            proceed.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button
            className="w-full"
            onClick={() => acceptInvite.mutate({ token })}
            disabled={acceptInvite.isPending}
          >
            {acceptInvite.isPending ? "Joining..." : "Join Team"}
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
            {declineInvite.isPending ? "Declining..." : "Decline"}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
