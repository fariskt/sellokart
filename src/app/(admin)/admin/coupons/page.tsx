import { CouponsPageClient } from "@/features/coupons/components/CouponsPageClient";
import { getCouponsPaginated } from "@/features/coupons/lib/coupons.action";

interface CouponsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    discountType?: string;
  }>;
}

export default async function CouponsPage({ searchParams }: CouponsPageProps) {
  const params = await searchParams;

  const couponsData = await getCouponsPaginated({
    page: Number(params.page ?? 1),
    limit: 10,
    search: params.search,
    status: params.status,
    discountType: params.discountType,
  });

  return (
    <div className="p-6">
      <CouponsPageClient initialData={couponsData} />
    </div>
  );
}
