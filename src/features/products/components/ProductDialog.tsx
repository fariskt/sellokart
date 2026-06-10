"use client";

import { AppDialog } from "@/components/AppDialog";
import { ProductFormValues } from "../lib/types";
import { ProductForm } from "./ProductForm";
import { DialogActions } from "@/components/DialogActions";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  mode: "create" | "edit";

  product?: ProductFormValues;

  categories: {
    id: string;
    name: string;
  }[];
}

export function ProductDialog({
  open,
  onOpenChange,
  mode,
  product,
  categories,
}: ProductDialogProps) {
  const [loading, setLoading] = useState(false);

  const isEdit = mode === "edit";

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Product" : "Create Product"}
      description={isEdit ? "Update product details." : "Add a new product."}
      size="xl"
      footer={
        <Button type="submit">
          {loading
            ? "Saving..."
            : mode === "create"
              ? "Create Product"
              : "Update Product"}
        </Button>
      }
    >
      <ProductForm
        product={product}
        categories={categories}
        mode={mode}
        onSuccess={() => onOpenChange(false)}
        setLoading={setLoading}
      />
    </AppDialog>
  );
}
