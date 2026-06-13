import { ShipmentsPageClient } from "@/features/shipments/components/ShipmentsPageClient";
import { getShipmentsPaginated } from "@/features/shipments/lib/shipments.action";

interface ShipmentsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    courier?: string;
  }>;
}

export default async function ShipmentsPage({ searchParams }: ShipmentsPageProps) {
  const params = await searchParams;

  const shipmentsData = await getShipmentsPaginated({
    page: Number(params.page ?? 1),
    limit: 10,
    search: params.search,
    status: params.status,
    courier: params.courier,
  });

  return (
    <div className="p-6">
      <ShipmentsPageClient initialData={shipmentsData} />
    </div>
  );
}
