import { Button } from "@/components/ui/button";

interface Props {
  onCreate: () => void;
}

export function CategoriesHeader({
  onCreate,
}: Props) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">
          Categories
        </h1>

        <p className="text-sm text-muted-foreground">
          Manage product categories
        </p>
      </div>

      <Button onClick={onCreate}>
        Add Category
      </Button>
    </div>
  );
}