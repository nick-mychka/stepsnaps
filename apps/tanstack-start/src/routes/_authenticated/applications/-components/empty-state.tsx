import { Button } from "@stepsnaps/ui/button";

interface EmptyStateProps {
  onAdd: () => void;
}

export function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
      <h2 className="mb-2 text-xl font-semibold">No applications yet</h2>
      <p className="text-muted-foreground mb-4">
        Start tracking your job applications to stay organized.
      </p>
      <Button onClick={onAdd}>Add Your First Application</Button>
    </div>
  );
}
