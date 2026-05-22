import { Button } from "@stepsnaps/ui/button";

import { LoadingButton } from "~/components/loading-button";
import { SimpleDialog, SimpleDialogContent } from "~/components/simple-dialog";
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
    <SimpleDialog open={open} onOpenChange={onOpenChange}>
      <SimpleDialogContent
        title="Delete Snap"
        footer={
          <>
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
          </>
        }
      >
        Are you sure you want to delete this snap? This action cannot be undone.
      </SimpleDialogContent>
    </SimpleDialog>
  );
}
