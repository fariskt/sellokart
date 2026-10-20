"use client";

import { AppDialog } from "@/components/AppDialog";
import { Button } from "@/components/ui/button";
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
      title={isEdit ? "Edit Product" : "New Product"}
      description={
        isEdit
          ? product?.name
            ? `Editing "${product.name}"`
            : "Update product information, pricing, media, and variants."
          : "Fill in the details to add a new product to your catalog."
      }
      size="2xl"
      footer={
        <div className="flex w-full items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <SubmitButton
            mode={mode}
            form="product-form"
            createText="Create Product"
            updateText="Save Changes"
          />
        </div>
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
