"use client";

import { useState } from "react";

import { AppPagination } from "@/components/AppPagination";
import { ProductFilters } from "./ProductFilters";
import { ProductsHeader } from "./ProductsHeader";
import { ProductStats } from "./ProductStats";
import { Product, ProductsTable } from "./ProductTable";
import { ProductDialog } from "./ProductDialog";
import { ProductDetailsDialog } from "./ProductDetailsDialog";
import { getProductDetails } from "../lib/product.action";
import { toast } from "sonner";
import { ProductFormValues } from "../lib/types";

interface ProductsPageClientProps {
  initialData: {
    data: Product[];
    pagination: {
      page: number;
      total: number;
      totalPages: number;
    };
  };
  filters: {
    search: string;
    categoryId: string;
    status: string;
    sort: string;
  };
  categories: {
    id: string;
    name: string;
  }[];
}

export function ProductsPageClient({
  initialData,
  filters,
  categories,
}: ProductsPageClientProps) {
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductFormValues | null>(null);
  const [detailsProduct, setDetailsProduct] =
    useState<ProductFormValues | null>(null);

  async function handleView(product: Product) {
    setDetailsProduct(null);
    setDetailsOpen(true);

    const result = await getProductDetails(product.id);

    if (result.success) {
      setDetailsProduct(result.data as ProductFormValues);
    } else {
      setDetailsOpen(false);
      toast.error(result.message);
    }
  }

  return (
    <div className="space-y-6">
      <ProductsHeader
        onCreate={() => {
          setSelectedProduct(null);
          setOpen(true);
        }}
      />

      <ProductStats
        total={initialData.pagination.total}
        active={0}
        draft={0}
        outOfStock={0}
      />

      <ProductFilters {...filters} categoryOptions={[]} />

      <ProductsTable
        products={initialData.data}
        onView={handleView}
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
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);

          if (!nextOpen) {
            setSelectedProduct(null);
          }
        }}
        mode={selectedProduct ? "edit" : "create"}
        categories={categories}
        product={selectedProduct ?? undefined}
      />

      <ProductDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        product={detailsProduct}
      />
    </div>
  );
}
