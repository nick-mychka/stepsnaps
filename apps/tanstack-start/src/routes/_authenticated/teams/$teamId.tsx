import { useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  createFileRoute,
  Link,
  Outlet,
  useMatch,
} from "@tanstack/react-router";

import { Badge } from "@stepsnaps/ui/badge";
import { Button } from "@stepsnaps/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@stepsnaps/ui/card";
import { Input } from "@stepsnaps/ui/input";
import { Spinner } from "@stepsnaps/ui/spinner";
import { toast } from "@stepsnaps/ui/toast";

import { useTRPC } from "~/lib/trpc";

export const Route = createFileRoute("/_authenticated/teams/$teamId")({
  loader: ({ context, params }) => {
    const { trpc, queryClient } = context;
    void queryClient.prefetchQuery(
      trpc.team.byId.queryOptions({ id: params.teamId }),
    );
  },
  component: TeamDetailLayout,
});

function TeamDetailLayout() {
  const memberMatch = useMatch({
    from: "/_authenticated/teams/$teamId/member/$userId",
    shouldThrow: false,
  });

  if (memberMatch) {
    return <Outlet />;
  }

  return <TeamDetailPage />;
}

function TeamDetailPage() {
  const { teamId } = Route.useParams();
  const trpc = useTRPC();
  const { data: team } = useSuspenseQuery(
    trpc.team.byId.queryOptions({ id: teamId }),
  );

  const activeMembers = team.members.filter((m) => m.status === "active");
  const pendingMembers = team.members.filter((m) => m.status === "pending");

  return (
    <main className="container mx-auto py-8">
      <Button variant="ghost" size="sm" className="mb-4" asChild>
        <Link to="/teams">&larr; Back to Teams</Link>
      </Button>

      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-3xl font-bold">{team.name}</h1>
        {team.isAdmin && <Badge variant="secondary">Admin</Badge>}
      </div>

      <div className="grid max-w-2xl gap-6">
        {/* Members */}
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <CardDescription>
              {activeMembers.length} active{" "}
              {activeMembers.length === 1 ? "member" : "members"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {activeMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="flex items-center gap-3">
                    {member.image && (
                      <img
                        src={member.image}
                        alt=""
                        className="h-8 w-8 rounded-full"
                      />
                    )}
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-muted-foreground text-sm">
                        {member.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.userId === team.creatorId && (
                      <Badge variant="outline">Admin</Badge>
                    )}
                    {team.isAdmin && member.userId !== team.creatorId && (
                      <Button variant="ghost" size="sm" asChild>
                        <Link
                          to="/teams/$teamId/member/$userId"
                          params={{ teamId, userId: member.userId }}
                        >
                          View Progress
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {pendingMembers.length > 0 && (
              <>
                <h3 className="text-muted-foreground mt-4 mb-2 text-sm font-medium">
                  Pending
                </h3>
                <div className="flex flex-col gap-2">
                  {pendingMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between rounded-md border p-3 opacity-60"
                    >
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-muted-foreground text-sm">
                          {member.email}
                        </div>
                      </div>
                      <Badge variant="outline">Pending</Badge>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Invites — admin only */}
        {team.isAdmin && <InviteSection teamId={teamId} />}
      </div>
    </main>
  );
}

function InviteSection(props: { teamId: string }) {
  const { teamId } = props;
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [showLink, setShowLink] = useState<string | null>(null);

  const { data: invites = [] } = useQuery(
    trpc.team.listInvites.queryOptions({ teamId }),
  );

  const createInvite = useMutation(
    trpc.team.createInvite.mutationOptions({
      onSuccess: async (invite) => {
        await queryClient.invalidateQueries(trpc.team.pathFilter());
        const link = `${window.location.origin}/invite/${invite.token}`;
        setShowLink(link);
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Link copied!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite Links</CardTitle>
        <CardDescription>
          Generate links to invite people to your team.
        </CardDescription>
        <CardAction>
          <Button
            size="sm"
            onClick={() => createInvite.mutate({ teamId })}
            disabled={createInvite.isPending}
          >
            {createInvite.isPending && <Spinner />}
            Generate Link
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {showLink && (
          <div className="mb-4 flex gap-2">
            <Input value={showLink} readOnly className="font-mono text-sm" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(showLink)}
            >
              Copy
            </Button>
          </div>
        )}

        {invites.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No active invite links.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {invites.map((invite) => {
              const link = `${typeof window !== "undefined" ? window.location.origin : ""}/invite/${invite.token}`;
              const expiresDate = new Date(invite.expiresAt).toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric", year: "numeric" },
              );
              return (
                <div
                  key={invite.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="text-muted-foreground text-sm">
                    Expires {expiresDate}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(link)}
                  >
                    Copy Link
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
