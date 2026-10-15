import { CategoriesPageClient } from "@/features/products/components/CategoriesPageClient";
import { getCategoriesPaginated, getCategories } from "@/features/products/lib/categories.action";

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

  const allCategories = await getCategories();

  return (
    <CategoriesPageClient
      initialData={categories}
      categories={allCategories}
      filters={{
        search: params.search ?? "",
      }}
    />
  );
}
