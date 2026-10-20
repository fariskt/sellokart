import { Button } from "@/components/ui/button";
import { Title } from "@/components/ui/title";
import { Plus } from "lucide-react";

interface ProductsHeaderProps {
  onCreate: () => void;
}

export function ProductsHeader({
  onCreate,
}: ProductsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <Title>
          Products
        </Title>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage your product catalog, inventory status, and pricing.
        </p>
      </div>

      <Button
        onClick={onCreate}
        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5 py-2.5 text-xs font-semibold flex items-center gap-1.5 shadow-2xs self-start sm:self-auto cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        Add Product
      </Button>
    </div>
  );
}