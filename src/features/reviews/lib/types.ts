export type ReviewStatus = "pending" | "approved" | "rejected";

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  status: ReviewStatus;
  admin_reply: string | null;
  created_at: string;
  // Relations
  products?: {
    id: string;
    name: string;
    product_images?: {
      image_url: string;
      is_primary: boolean;
    }[];
  } | null;
  profiles?: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
}

export interface ReviewStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  averageRating: number;
}

export interface RatingDistribution {
  rating: number;
  count: number;
  percentage: number;
}

export interface GetReviewsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  rating?: string;
  dateRange?: string;
  startDate?: string;
  endDate?: string;
}
