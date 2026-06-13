import { ReviewsPageClient } from "@/features/reviews/components/ReviewsPageClient";
import { getReviewsPaginated } from "@/features/reviews/lib/reviews.action";

interface ReviewsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    rating?: string;
    dateRange?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function ReviewsPage({ searchParams }: ReviewsPageProps) {
  const params = await searchParams;

  const reviewsData = await getReviewsPaginated({
    page: Number(params.page ?? 1),
    limit: 10,
    search: params.search,
    status: params.status,
    rating: params.rating,
    dateRange: params.dateRange,
    startDate: params.startDate,
    endDate: params.endDate,
  });

  return (
    <div className="p-6">
      <ReviewsPageClient initialData={reviewsData} />
    </div>
  );
}
