import { useState } from "react";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

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
import { Input } from "@stepsnaps/ui/input";
import { Label } from "@stepsnaps/ui/label";
import { toast } from "@stepsnaps/ui/toast";

import { useTRPC } from "~/lib/trpc";

export const Route = createFileRoute("/_authed/teams/")({
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
        <CreateTeamDialog />
      </div>

      {teams.length === 0 ? (
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>No teams yet</CardTitle>
            <CardDescription>
              Create a team to start tracking progress with peers.
            </CardDescription>
          </CardHeader>
        </Card>
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
              {create.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
