import { InventoryPageClient } from "@/features/inventory/components/InventoryPageClient";
import { getInventoryPaginated, getInventoryStats } from "@/features/inventory/lib/inventory.action";
import { getCategories } from "@/features/products/lib/category.actions";

interface InventoryPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    categoryId?: string;
  }>;
}

export const metadata = {
  title: "Inventory | Admin",
  description: "Monitor stock levels, track changes, and manage manual stock adjustments.",
};

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
  const params = await searchParams;

  const [inventoryData, stats, categoriesData] = await Promise.all([
    getInventoryPaginated({
      page: Number(params.page ?? 1),
      limit: 15,
      search: params.search,
      status: params.status as any,
      categoryId: params.categoryId,
    }),
    getInventoryStats(),
    getCategories(),
  ]);

  return (
    <div className="p-6">
      <InventoryPageClient
        initialData={{
          data: inventoryData.data,
          stats,
          pagination: inventoryData.pagination,
        }}
        categories={(categoriesData as any[]).map((c: any) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
