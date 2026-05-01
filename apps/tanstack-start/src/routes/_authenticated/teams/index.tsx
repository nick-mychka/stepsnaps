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
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@stepsnaps/ui/dialog";
import { Field, FieldLabel } from "@stepsnaps/ui/field";
import { Input } from "@stepsnaps/ui/input";
import { Spinner } from "@stepsnaps/ui/spinner";
import { toast } from "@stepsnaps/ui/toast";

import { SimpleCard } from "~/components/simple-card";
import { SimpleEmpty } from "~/components/simple-empth";
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
        <SimpleEmpty
          icon={<Users />}
          title="No teams yet"
          description="Create a team to start tracking progress with peers."
          contentClassName="flex-row justify-center gap-2"
        >
          <CreateTeamDialog />
        </SimpleEmpty>
      ) : (
        <div className="grid max-w-2xl gap-4">
          {teams.map((team) => (
            <SimpleCard
              key={team.id}
              onClick={() =>
                navigate({ to: "/teams/$teamId", params: { teamId: team.id } })
              }
              description={
                <>
                  Created by {team.creatorName} &middot; {team.memberCount}{" "}
                  {team.memberCount === 1 ? "member" : "members"}
                </>
              }
              actionSlot={
                team.isAdmin && <Badge variant="secondary">Admin</Badge>
              }
              title={team.name}
              className="hover:bg-muted/50 cursor-pointer transition-colors"
              headerClassName="pb-2"
              titleClassName="text-lg"
            />
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
          <Field className="py-4">
            <FieldLabel htmlFor="team-name">Team Name</FieldLabel>
            <Input
              id="team-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Job Hunt Squad"
              maxLength={256}
              className="mt-1.5"
            />
          </Field>
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
