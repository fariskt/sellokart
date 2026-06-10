import { Button } from "@/components/ui/button";
import { Title } from "@/components/ui/title";

interface ProductsHeaderProps {
  onCreate: () => void;
}

export function ProductsHeader({
  onCreate,
}: ProductsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Title>
          Products
        </Title>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage your product catalog.
        </p>
      </div>

      <Button onClick={onCreate}>
        Add Product
      </Button>
    </div>
  );
}