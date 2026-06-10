import { ProductsPageClient } from "@/features/products/components/ProductPageClient";
import { getProductsPaginated } from "@/features/products/lib/action";

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    status?: string;
    sort?: string;
  }>;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;

  const products = await getProductsPaginated({
    page: Number(params.page ?? 1),
    limit: 10,
    search: params.search,
    categoryId: params.category,
    status: params.status,
    sort: params.sort,
  });

  return (
    <ProductsPageClient
      initialData={products}
      filters={{
        search: params.search ?? "",
        categoryId: params.category ?? "",
        status: params.status ?? "",
        sort: params.sort ?? "newest",
      }}
    />
  );
}