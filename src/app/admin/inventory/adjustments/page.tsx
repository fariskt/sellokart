import { getLowStockProducts, getOutOfStockProducts } from "@/features/inventory/lib/inventory.action";
import { LowStockTable } from "@/features/inventory/components/LowStockTable";
import { OutOfStockTable } from "@/features/inventory/components/OutOfStockTable";
import { Title } from "@/components/ui/title";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata = {
  title: "Stock Alerts | Inventory | Admin",
  description: "Low stock and out of stock alerts for inventory management.",
};

export default async function InventoryAdjustmentsPage() {
  const [lowStock, outOfStock] = await Promise.all([
    getLowStockProducts(),
    getOutOfStockProducts(),
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Title>Stock Alerts</Title>
          <p className="mt-1 text-sm text-muted-foreground">
            Items that need attention — low stock and out of stock products.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="gap-2 shrink-0">
          <Link href="/admin/inventory">
            <ArrowLeft className="h-4 w-4" />
            Back to Inventory
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="low_stock">
        <TabsList className="mb-4">
          <TabsTrigger value="low_stock" className="gap-2">
            Low Stock
            {lowStock.length > 0 && (
              <span className="inline-flex items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1">
                {lowStock.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="out_of_stock" className="gap-2">
            Out of Stock
            {outOfStock.length > 0 && (
              <span className="inline-flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1">
                {outOfStock.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="low_stock">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {lowStock.length} item{lowStock.length !== 1 ? "s" : ""} with 10 units or fewer remaining.
            </p>
            <LowStockTable items={lowStock} />
          </div>
        </TabsContent>

        <TabsContent value="out_of_stock">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {outOfStock.length} item{outOfStock.length !== 1 ? "s" : ""} with zero stock available.
            </p>
            <OutOfStockTable items={outOfStock} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
