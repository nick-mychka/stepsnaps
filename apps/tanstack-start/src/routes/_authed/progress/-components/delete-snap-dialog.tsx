import { Button } from "@stepsnaps/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@stepsnaps/ui/dialog";

import { useDeleteSnap } from "../-hooks/use-delete-snap";

export function DeleteSnapDialog(props: {
  snapId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const deleteSnap = useDeleteSnap({
    onSuccess: () => props.onOpenChange(false),
  });

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Snap</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this snap? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => props.onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteSnap.mutate({ id: props.snapId })}
            disabled={deleteSnap.isPending}
          >
            {deleteSnap.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
