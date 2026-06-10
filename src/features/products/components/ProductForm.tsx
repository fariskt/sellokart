"use client";

import { useState } from "react";

import { AppSelect } from "@/components/AppSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { createProduct, updateProduct } from "../lib/action";

import { ProductFormValues } from "../lib/types";

interface Props {
  mode: "create" | "edit";

  product?: ProductFormValues;

  categories: {
    id: string;
    name: string;
  }[];

  onSuccess: () => void;
  setLoading: (val: boolean) => void;
}

export function ProductForm({
  mode,
  product,
  categories,
  onSuccess,
  setLoading,
}: Props) {
  async function handleSubmit(formData: FormData) {
    setLoading(true);

    const result =
      mode === "create"
        ? await createProduct(formData)
        : await updateProduct(product!.id!, formData);

    setLoading(false);

    if (result.success) {
      onSuccess();
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <Input
        label="Product Name"
        name="name"
        placeholder="Enter product name"
        defaultValue={product?.name}
        required
      />

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Description
        </label>

        <Textarea
          name="description"
          placeholder="Describe your product"
          defaultValue={product?.description}
          className="min-h-32"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Price"
          name="price"
          type="number"
          step="0.01"
          placeholder="0.00"
          defaultValue={product?.price}
          required
        />

        <Input
          label="Sale Price"
          name="sale_price"
          type="number"
          step="0.01"
          placeholder="0.00"
          defaultValue={product?.salePrice}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Stock"
          name="stock"
          type="number"
          placeholder="0"
          defaultValue={product?.stock}
          required
        />

        <Input
          label="SKU"
          name="sku"
          placeholder="SKU-001"
          defaultValue={product?.sku}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Category
          </label>

          <AppSelect
            defaultValue={product?.categoryId}
            placeholder="Select category"
            options={categories.map((category) => ({
              label: category.name,
              value: category.id,
            }))}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Status</label>

          <AppSelect
            defaultValue={product?.status ?? "draft"}
            options={[
              {
                label: "Draft",
                value: "draft",
              },
              {
                label: "Active",
                value: "active",
              },
              {
                label: "Archived",
                value: "archived",
              },
            ]}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-border p-4">
        <input
          id="featured"
          name="featured"
          type="checkbox"
          defaultChecked={product?.featured}
        />

        <label
          htmlFor="featured"
          className="text-sm font-medium text-foreground"
        >
          Featured Product
        </label>
      </div>
    </form>
  );
}
