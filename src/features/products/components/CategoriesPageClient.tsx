"use client";

import { useState } from "react";

import { AppPagination } from "@/components/AppPagination";
import { CategoryStats } from "./CategoryStats";
import { CategoriesHeader } from "./CategoriesHeader";
import { CategoryFilters } from "./CategoryFilters";
import { CategoriesTable } from "./CategoriesTable";
import { CategoryDialog } from "./CategoryDialog";

interface Props {
  initialData: {
    data: any[];
    pagination: {
      page: number;
      totalPages: number;
      total: number;
    };
  };

  filters: {
    search: string;
  };
}

export function CategoriesPageClient({
  initialData,
  filters,
}: Props) {
  const [open, setOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] =
    useState<any>(null);

  return (
    <div className="space-y-6">
      <CategoriesHeader
        onCreate={() => {
          setSelectedCategory(null);
          setOpen(true);
        }}
      />

      <CategoryStats
        total={initialData.pagination.total}
        rootCategories={
          initialData.data.filter(
            (c) => !c.parent_id
          ).length
        }
        subCategories={
          initialData.data.filter(
            (c) => c.parent_id
          ).length
        }
      />

      <CategoryFilters
        search={filters.search}
      />

      <CategoriesTable
        categories={initialData.data}
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
        onOpenChange={setOpen}
        mode={
          selectedCategory
            ? "edit"
            : "create"
        }
        category={selectedCategory}
        categories={initialData.data}
      />
    </div>
  );
}