"use client";

import { useQuery } from "@tanstack/react-query";
import { getLandingProducts } from "@/features/products/lib/product.action";
import { getCategoriesPaginated } from "@/features/products/lib/categories.action";

export const LANDING_QUERY_KEYS = {
  products: ["landing", "products"] as const,
  categories: ["landing", "categories"] as const,
};

export function useLandingProducts() {
  return useQuery({
    queryKey: LANDING_QUERY_KEYS.products,
    queryFn: async () => {
      const products = await getLandingProducts();
      return products ?? [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useLandingCategories() {
  return useQuery({
    queryKey: LANDING_QUERY_KEYS.categories,
    queryFn: async () => {
      const res = await getCategoriesPaginated({ limit: 6 });
      return res?.data ?? [];
    },
    staleTime: 1000 * 60 * 10,
  });
}
