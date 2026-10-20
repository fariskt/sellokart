import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Props {
  onCreate: () => void;
}

export function CategoriesHeader({
  onCreate,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Categories
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Organize your product catalog into departments and sub-categories.
        </p>
      </div>

      <Button
        onClick={onCreate}
        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 shadow-2xs self-start sm:self-auto cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        Add Category
      </Button>
    </div>
  );
}