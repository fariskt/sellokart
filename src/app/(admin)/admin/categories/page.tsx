import { CategoriesPageClient } from "@/features/products/components/CategoriesPageClient";
import { getCategoriesPaginated } from "@/features/products/lib/categories.action";

interface CategoriesPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

export default async function CategoriesPage({
  searchParams,
}: CategoriesPageProps) {
  const params = await searchParams;

  const categories = await getCategoriesPaginated({
    page: Number(params.page ?? 1),
    limit: 10,
    search: params.search,
  });

  console.log("categories", categories);
  

  return (
    <CategoriesPageClient
      initialData={categories}
      filters={{
        search: params.search ?? "",
      }}
    />
  );
}
