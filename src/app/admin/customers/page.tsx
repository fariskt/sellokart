import { CustomersPageClient } from "@/features/customers/components/CustomersPageClient";
import { getCustomersPaginated } from "@/features/customers/lib/customers.action";

interface CustomersPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    dateRange?: string;
    startDate?: string;
    endDate?: string;
    customerType?: "all" | "new" | "returning" | "high_value";
  }>;
}

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const params = await searchParams;

  const initialData = await getCustomersPaginated({
    page: Number(params.page ?? 1),
    limit: 10,
    search: params.search,
    dateRange: params.dateRange,
    startDate: params.startDate,
    endDate: params.endDate,
    customerType: params.customerType,
  });

  return (
    <div className="p-6">
      <CustomersPageClient initialData={initialData} />
    </div>
  );
}
