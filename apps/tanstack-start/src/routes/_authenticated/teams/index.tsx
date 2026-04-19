import { useState } from "react";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Users } from "lucide-react";

import { Badge } from "@stepsnaps/ui/badge";
import { Button } from "@stepsnaps/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@stepsnaps/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@stepsnaps/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@stepsnaps/ui/empty";
import { Input } from "@stepsnaps/ui/input";
import { Label } from "@stepsnaps/ui/label";
import { Spinner } from "@stepsnaps/ui/spinner";
import { toast } from "@stepsnaps/ui/toast";

import { useTRPC } from "~/lib/trpc";

export const Route = createFileRoute("/_authenticated/teams/")({
  loader: ({ context }) => {
    const { trpc, queryClient } = context;
    void queryClient.prefetchQuery(trpc.team.list.queryOptions());
  },
  component: TeamsPage,
});

function TeamsPage() {
  const trpc = useTRPC();
  const navigate = useNavigate();
  const { data: teams } = useSuspenseQuery(trpc.team.list.queryOptions());

  return (
    <main className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Teams</h1>
        {teams.length > 0 && <CreateTeamDialog />}
      </div>

      {teams.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users />
            </EmptyMedia>
            <EmptyTitle>No teams yet</EmptyTitle>
            <EmptyDescription>
              You haven&apos;t created any teams yet. Get started by creating
              your first team.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row justify-center gap-2">
            <CreateTeamDialog />
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid max-w-2xl gap-4">
          {teams.map((team) => (
            <Card
              key={team.id}
              className="hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() =>
                navigate({ to: "/teams/$teamId", params: { teamId: team.id } })
              }
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{team.name}</CardTitle>
                  {team.isAdmin && <Badge variant="secondary">Admin</Badge>}
                </div>
                <CardDescription>
                  Created by {team.creatorName} &middot; {team.memberCount}{" "}
                  {team.memberCount === 1 ? "member" : "members"}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}

function CreateTeamDialog() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const create = useMutation(
    trpc.team.create.mutationOptions({
      onSuccess: async (team) => {
        await queryClient.invalidateQueries(trpc.team.pathFilter());
        toast.success("Team created!");
        setName("");
        setOpen(false);
        await navigate({ to: "/teams/$teamId", params: { teamId: team.id } });
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    create.mutate({ name: name.trim() });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Team</Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Team</DialogTitle>
            <DialogDescription>
              Create a new team to track progress with peers.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="team-name">Team Name</Label>
            <Input
              id="team-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Job Hunt Squad"
              maxLength={256}
              className="mt-1.5"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={create.isPending || !name.trim()}>
              {create.isPending && <Spinner />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
