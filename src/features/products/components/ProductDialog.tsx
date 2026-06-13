"use client";

import { AppDialog } from "@/components/AppDialog";
import { ProductFormValues } from "../lib/types";
import { ProductForm } from "./ProductForm";
import { SubmitButton } from "@/components/common/SubmitButton";

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
  const isEdit = mode === "edit";

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Product" : "Create Product"}
      description={isEdit ? "Update product details." : "Add a new product."}
      size="2xl"
      footer={
        <SubmitButton
          mode={mode}
          form="product-form"
          createText="Create Product"
          updateText="Update Product"
        />
      }
    >
      <ProductForm
        key={product?.id ?? "new-product"}
        product={product}
        categories={categories}
        mode={mode}
        onSuccess={() => onOpenChange(false)}
      />
    </AppDialog>
  );
}
