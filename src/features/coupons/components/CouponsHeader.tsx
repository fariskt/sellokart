import { Button } from "@/components/ui/button";
import { Title } from "@/components/ui/title";
import { Plus } from "lucide-react";

interface CouponsHeaderProps {
  onCreate: () => void;
}

export function CouponsHeader({ onCreate }: CouponsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <Title>Coupons</Title>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage promotional campaigns, discount rates, and store-wide coupon codes.
        </p>
      </div>

      <Button onClick={onCreate} className="cursor-pointer shrink-0">
        <Plus className="w-4 h-4 mr-2" />
        Create Coupon
      </Button>
    </div>
  );
}
