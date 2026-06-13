import { PaymentsPageClient } from "@/features/payments/components/PaymentsPageClient";
import { getPaymentsPaginated } from "@/features/payments/lib/payments.action";

interface PaymentsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    dateRange?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function PaymentsPage({ searchParams }: PaymentsPageProps) {
  const params = await searchParams;

  const paymentsData = await getPaymentsPaginated({
    page: Number(params.page ?? 1),
    limit: 10,
    search: params.search,
    status: params.status,
    dateRange: params.dateRange,
    startDate: params.startDate,
    endDate: params.endDate,
  });

  return (
    <div className="p-6">
      <PaymentsPageClient initialData={paymentsData} />
    </div>
  );
}
