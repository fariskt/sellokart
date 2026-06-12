"use client";

import { useState } from "react";

import { AppPagination } from "@/components/AppPagination";
import { ProductFilters } from "./ProductFilters";
import { ProductsHeader } from "./ProductsHeader";
import { ProductStats } from "./ProductStats";
import { ProductsTable } from "./ProductTable";
import { ProductDialog } from "./ProductDialog";

export function ProductsPageClient({ initialData, filters, categories }: any) {
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  console.log(selectedProduct);
  

  return (
    <div className="space-y-6">
      <ProductsHeader onCreate={() => setOpen(true)} />

      <ProductStats
        total={initialData.pagination.total}
        active={0}
        draft={0}
        outOfStock={0}
      />

      <ProductFilters {...filters} categoryOptions={[]} />

      <ProductsTable
        products={initialData.data}
        onEdit={(product) => {
          setSelectedProduct(product);
          setOpen(true);
        }}
      />

      <AppPagination
        page={initialData.pagination.page}
        totalPages={initialData.pagination.totalPages}
      />

      <ProductDialog
        open={open}
        onOpenChange={setOpen}
        mode={selectedProduct ? "edit" : "create"}
        categories={categories}
        product={selectedProduct}
      />
    </div>
  );
}
