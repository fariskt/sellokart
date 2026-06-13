import { OrdersPageClient } from "@/features/orders/components/OrdersPageClient";
import { getOrdersPaginated } from "@/features/orders/lib/orders.action";

interface OrdersPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    paymentStatus?: string;
    dateRange?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams;

  const ordersData = await getOrdersPaginated({
    page: Number(params.page ?? 1),
    limit: 10,
    search: params.search,
    status: params.status,
    paymentStatus: params.paymentStatus,
    dateRange: params.dateRange,
    startDate: params.startDate,
    endDate: params.endDate,
  });

  return (
    <div className="p-6">
      <OrdersPageClient initialData={ordersData} />
    </div>
  );
}
