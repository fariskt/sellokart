import { Button } from "./ui/button";

interface DialogActionsProps {
  loading?: boolean;
  submitLabel?: string;
}

export function DialogActions({
  loading,
  submitLabel = "Save",
}: DialogActionsProps) {
  return (
    <>
      <Button variant="outline">
        Cancel
      </Button>

      <Button disabled={loading}>
        {loading ? "Saving..." : submitLabel}
      </Button>
    </>
  );
}