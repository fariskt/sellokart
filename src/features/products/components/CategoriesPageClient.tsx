"use client";

import { useState } from "react";

import { AppPagination } from "@/components/AppPagination";
import { CategoryStats } from "./CategoryStats";
import { CategoriesHeader } from "./CategoriesHeader";
import { CategoryFilters } from "./CategoryFilters";
import { CategoriesTable } from "./CategoriesTable";
import { CategoryDialog } from "./CategoryDialog";
import { CategoryDetailsDialog } from "./CategoryDetailsDialog";
import { getCategoryById } from "../lib/category.actions";
import { toast } from "sonner";
import type { Category } from "../lib/category.actions";

interface Props {
  initialData: {
    data: Category[];
    stats: {
      total: number;
      rootCategories: number;
      subCategories: number;
    };
    pagination: {
      page: number;
      totalPages: number;
      total: number;
    };
  };
  categories: Category[];

  filters: {
    search: string;
  };
}

export function CategoriesPageClient({
  initialData,
  categories,
  filters,
}: Props) {
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] =
    useState<Category | null>(null);
  const [detailsCategory, setDetailsCategory] =
    useState<Category | null>(null);

  async function handleView(category: Category) {
    setDetailsCategory(null);
    setDetailsOpen(true);

    const result = await getCategoryById(category.id);

    if (result.success) {
      setDetailsCategory(result.data);
    } else {
      setDetailsOpen(false);
      toast.error(result.message);
    }
  }

  return (
    <div className="space-y-6">
      <CategoriesHeader
        onCreate={() => {
          setSelectedCategory(null);
          setOpen(true);
        }}
      />

      <CategoryStats
        total={initialData.stats.total}
        rootCategories={initialData.stats.rootCategories}
        subCategories={initialData.stats.subCategories}
      />

      <CategoryFilters
        search={filters.search}
      />

      <CategoriesTable
        categories={initialData.data}
        onView={handleView}
        onEdit={(category) => {
          setSelectedCategory(category);
          setOpen(true);
        }}
      />

      <AppPagination
        page={initialData.pagination.page}
        totalPages={
          initialData.pagination.totalPages
        }
      />

      <CategoryDialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);

          if (!nextOpen) {
            setSelectedCategory(null);
          }
        }}
        mode={
          selectedCategory
            ? "edit"
            : "create"
        }
        category={selectedCategory ?? undefined}
        categories={categories}
      />

      <CategoryDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        category={detailsCategory}
      />
    </div>
  );
}
