import { Button } from "@stepsnaps/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@stepsnaps/ui/dialog";

import { LoadingButton } from "~/components/loading-button";
import { useDeleteSnap } from "../-hooks/use-delete-snap";

export function DeleteSnapDialog({
  snapId,
  open,
  onOpenChange,
}: {
  snapId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const deleteSnap = useDeleteSnap({
    onSuccess: () => onOpenChange(false),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Snap</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this snap? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <LoadingButton
            variant="destructive"
            onClick={() => deleteSnap.mutate({ id: snapId })}
            disabled={deleteSnap.isPending}
            loading={deleteSnap.isPending}
          >
            Delete
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
