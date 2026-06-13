import { ProductsPageClient } from "@/features/products/components/ProductPageClient";
import { getCategoriesPaginated } from "@/features/products/lib/categories.action";
import { getProductsPaginated } from "@/features/products/lib/product.action";

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    status?: string;
    sort?: string;
  }>;
}

const productStatuses = ["draft", "active", "archived"] as const;

function getProductStatus(status?: string) {
  return productStatuses.find((item) => item === status);
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
    status: getProductStatus(params.status),
    sort: params.sort,
  });

  const categories = await getCategoriesPaginated({
    page: Number(params.page ?? 1),
    limit: 10,
    search: params.search,
  });

  

  return (
    <ProductsPageClient
      initialData={products}
      categories={categories?.data || []}
      filters={{
        search: params.search ?? "",
        categoryId: params.category ?? "",
        status: params.status ?? "",
        sort: params.sort ?? "newest",
      }}
    />
  );
}
