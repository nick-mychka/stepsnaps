import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Badge } from "@stepsnaps/ui/badge";
import { Button } from "@stepsnaps/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@stepsnaps/ui/dialog";
import { Input } from "@stepsnaps/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@stepsnaps/ui/select";
import { Separator } from "@stepsnaps/ui/separator";
import { Spinner } from "@stepsnaps/ui/spinner";
import { Textarea } from "@stepsnaps/ui/textarea";
import { toast } from "@stepsnaps/ui/toast";

import { useTRPC } from "~/lib/trpc";

const INTERVIEW_TYPE_LABELS: Record<string, string> = {
  phone_screen: "Phone Screen",
  technical: "Technical",
  behavioral: "Behavioral",
  system_design: "System Design",
  hiring_manager: "Hiring Manager",
  other: "Other",
};

type InterviewType =
  | "phone_screen"
  | "technical"
  | "behavioral"
  | "system_design"
  | "hiring_manager"
  | "other";

interface InterviewsDialogProps {
  applicationId: string | null;
  onOpenChange: (open: boolean) => void;
}

export function InterviewsDialog(props: InterviewsDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: interviews } = useQuery(
    trpc.interview.list.queryOptions(
      { jobApplicationId: props.applicationId ?? "" },
      { enabled: !!props.applicationId },
    ),
  );

  const [date, setDate] = useState("");
  const [type, setType] = useState<InterviewType>("phone_screen");
  const [note, setNote] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editType, setEditType] = useState<InterviewType>("phone_screen");
  const [editNote, setEditNote] = useState("");

  const invalidate = async () => {
    await queryClient.invalidateQueries(trpc.interview.pathFilter());
    await queryClient.invalidateQueries(trpc.jobApplication.pathFilter());
  };

  const createInterview = useMutation(
    trpc.interview.create.mutationOptions({
      onSuccess: async () => {
        await invalidate();
        setDate("");
        setType("phone_screen");
        setNote("");
        toast.success("Interview added!");
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const updateInterview = useMutation(
    trpc.interview.update.mutationOptions({
      onSuccess: async () => {
        await invalidate();
        setEditingId(null);
        toast.success("Interview updated!");
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const deleteInterview = useMutation(
    trpc.interview.delete.mutationOptions({
      onSuccess: async () => {
        await invalidate();
        toast.success("Interview deleted.");
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!props.applicationId) return;
    createInterview.mutate({
      jobApplicationId: props.applicationId,
      date,
      type,
      note: note.trim() || undefined,
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    updateInterview.mutate({
      id: editingId,
      date: editDate,
      type: editType,
      note: editNote.trim() || null,
    });
  };

  const startEditing = (interview: {
    id: string;
    date: string;
    type: InterviewType;
    note: string | null;
  }) => {
    setEditingId(interview.id);
    setEditDate(interview.date);
    setEditType(interview.type);
    setEditNote(interview.note ?? "");
  };

  return (
    <Dialog
      open={!!props.applicationId}
      onOpenChange={(open) => {
        if (!open) {
          setEditingId(null);
          setDate("");
          setType("phone_screen");
          setNote("");
        }
        props.onOpenChange(open);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Interviews</DialogTitle>
          <DialogDescription>
            Manage interview rounds for this application.
          </DialogDescription>
        </DialogHeader>

        {/* Existing interviews */}
        <div className="flex flex-col gap-3">
          {interviews?.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No interviews yet. Add your first one below.
            </p>
          )}
          {interviews?.map((interview) => (
            <div key={interview.id} className="rounded-md border p-3">
              {editingId === interview.id ? (
                <form onSubmit={handleUpdate} className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm font-medium">
                      Round {interview.round}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      required
                      className="flex-1"
                    />
                    <Select
                      value={editType}
                      onValueChange={(v) => setEditType(v as InterviewType)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(INTERVIEW_TYPE_LABELS).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <Textarea
                    placeholder="Notes..."
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={updateInterview.isPending}
                    >
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        Round {interview.round}
                      </span>
                      <Badge variant="outline">
                        {INTERVIEW_TYPE_LABELS[interview.type] ??
                          interview.type}
                      </Badge>
                    </div>
                    <span className="text-muted-foreground text-sm">
                      {interview.date}
                    </span>
                    {interview.note && (
                      <p className="mt-1 text-sm">{interview.note}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditing(interview)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() =>
                        deleteInterview.mutate({ id: interview.id })
                      }
                      disabled={deleteInterview.isPending}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add new interview */}
        <Separator />
        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          <span className="text-sm font-medium">Add Interview</span>
          <div className="flex gap-2">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="flex-1"
            />
            <Select
              value={type}
              onValueChange={(v) => setType(v as InterviewType)}
            >
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(INTERVIEW_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Textarea
            placeholder="Notes (optional)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <Button type="submit" disabled={createInterview.isPending}>
            {createInterview.isPending && <Spinner />}
            Add Interview
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
