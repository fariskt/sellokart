"use client";

import { AppSelect } from "@/components/AppSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { createProduct, updateProduct } from "../lib/product.action";

import {
  ProductAttribute,
  ProductFormValues,
  ProductVariant,
  ProductVariantAttribute,
} from "../lib/types";
import { toast } from "sonner";
import { ProductImagesUpload } from "./ProductImageUpload";
import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";

interface Props {
  mode: "create" | "edit";

  product?: ProductFormValues;

  categories: {
    id: string;
    name: string;
  }[];

  onSuccess: () => void;
}

export function ProductForm({ mode, product, categories, onSuccess }: Props) {
  const [attributes, setAttributes] = useState<ProductAttribute[]>(
    product?.product_attributes ?? [],
  );
  const [variants, setVariants] = useState<ProductVariant[]>(
    product?.product_variants ?? [],
  );

  const attributesValue = useMemo(
    () => JSON.stringify(attributes),
    [attributes],
  );
  const variantsValue = useMemo(() => JSON.stringify(variants), [variants]);

  async function handleSubmit(formData: FormData) {
    const result =
      mode === "create"
        ? await createProduct(formData)
        : await updateProduct(product!.id!, formData);

    if (result.success) {
      toast.success(
        mode === "create"
          ? "Product created successfully!"
          : "Product updated successfully!",
      );
      onSuccess();
    } else {
      toast.error(result.message);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6" id="product-form">
      <input type="hidden" name="attributes" value={attributesValue} />
      <input type="hidden" name="variants" value={variantsValue} />

      <ProductFormSection title="General Information">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Product Name"
            name="name"
            placeholder="Enter product name"
            defaultValue={product?.name}
            required
          />

          <Input
            label="Slug"
            name="slug"
            placeholder="product-slug"
            defaultValue={product?.slug}
          />
        </div>

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
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Category
            </label>

            <AppSelect
              name="categoryId"
              defaultValue={product?.categoryId ?? product?.category_id}
              placeholder="Select category"
              options={categories.map((category) => ({
                label: category.name,
                value: category.id,
              }))}
            />
          </div>

          <Input
            label="SKU"
            name="sku"
            placeholder="SKU-001"
            defaultValue={product?.sku ?? undefined}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Status</label>

            <AppSelect
              name="status"
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

          <div className="flex items-center gap-3 self-end rounded-lg border border-border p-4">
            <input
              id="featured"
              name="featured"
              type="checkbox"
              value="true"
              defaultChecked={product?.featured}
            />

            <label
              htmlFor="featured"
              className="text-sm font-medium text-foreground"
            >
              Featured Product
            </label>
          </div>
        </div>
      </ProductFormSection>

      <ProductFormSection title="Pricing">
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
          defaultValue={product?.salePrice ?? product?.sale_price ?? undefined}
        />
      </ProductFormSection>

      <ProductFormSection title="Inventory">
        <Input
          label="Stock"
          name="stock"
          type="number"
          placeholder="0"
          defaultValue={product?.stock}
          required
        />
      </ProductFormSection>

      <ProductFormSection title="Images">
        <ProductImagesUpload
          name="images"
          maxSize={5}
          defaultImages={product?.product_images ?? []}
        />
      </ProductFormSection>

      <ProductFormSection title="Specifications">
        <ProductAttributesEditor
          attributes={attributes}
          onChange={setAttributes}
        />
      </ProductFormSection>

      <ProductFormSection title="Variants">
        <ProductVariantsEditor variants={variants} onChange={setVariants} />
      </ProductFormSection>
    </form>
  );
}

function ProductFormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-lg border border-border p-4">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </section>
  );
}

function ProductAttributesEditor({
  attributes,
  onChange,
}: {
  attributes: ProductAttribute[];
  onChange: (attributes: ProductAttribute[]) => void;
}) {
  function updateAttribute(
    index: number,
    field: "attribute_name" | "attribute_value",
    value: string,
  ) {
    onChange(
      attributes.map((attribute, attributeIndex) =>
        attributeIndex === index
          ? {
              ...attribute,
              [field]: value,
            }
          : attribute,
      ),
    );
  }

  return (
    <div className="space-y-3">
      {attributes.map((attribute, index) => (
        <div key={attribute.id ?? index} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <Input
            aria-label="Attribute Name"
            placeholder="Attribute Name"
            value={attribute.attribute_name}
            onChange={(event) =>
              updateAttribute(index, "attribute_name", event.target.value)
            }
          />

          <Input
            aria-label="Attribute Value"
            placeholder="Attribute Value"
            value={attribute.attribute_value}
            onChange={(event) =>
              updateAttribute(index, "attribute_value", event.target.value)
            }
          />

          <Button
            type="button"
            variant="destructive"
            size="icon"
            aria-label="Remove attribute"
            onClick={() =>
              onChange(attributes.filter((_, attributeIndex) => attributeIndex !== index))
            }
          >
            <Trash2 />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() =>
          onChange([
            ...attributes,
            {
              attribute_name: "",
              attribute_value: "",
            },
          ])
        }
      >
        <Plus />
        Add Attribute
      </Button>
    </div>
  );
}

function ProductVariantsEditor({
  variants,
  onChange,
}: {
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
}) {
  function updateVariant(
    index: number,
    field: keyof Pick<ProductVariant, "name" | "sku" | "price" | "sale_price" | "stock">,
    value: string,
  ) {
    onChange(
      variants.map((variant, variantIndex) =>
        variantIndex === index
          ? {
              ...variant,
              [field]:
                field === "price" || field === "sale_price" || field === "stock"
                  ? value === ""
                    ? ""
                    : Number(value)
                  : value,
            }
          : variant,
      ) as ProductVariant[],
    );
  }

  function updateVariantAttributes(
    index: number,
    attributes: ProductVariantAttribute[],
  ) {
    onChange(
      variants.map((variant, variantIndex) =>
        variantIndex === index
          ? {
              ...variant,
              product_variant_attributes: attributes,
            }
          : variant,
      ),
    );
  }

  return (
    <div className="space-y-4">
      {variants.map((variant, index) => (
        <div key={variant.id ?? index} className="space-y-4 rounded-lg border border-border p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label="Variant Name"
              placeholder="Red Large"
              value={variant.name}
              onChange={(event) => updateVariant(index, "name", event.target.value)}
            />

            <Input
              label="SKU"
              placeholder="SKU-RED-L"
              value={variant.sku ?? ""}
              onChange={(event) => updateVariant(index, "sku", event.target.value)}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <Input
              label="Price"
              type="number"
              step="0.01"
              value={variant.price}
              onChange={(event) => updateVariant(index, "price", event.target.value)}
            />

            <Input
              label="Sale Price"
              type="number"
              step="0.01"
              value={variant.sale_price ?? ""}
              onChange={(event) =>
                updateVariant(index, "sale_price", event.target.value)
              }
            />

            <Input
              label="Stock"
              type="number"
              value={variant.stock}
              onChange={(event) => updateVariant(index, "stock", event.target.value)}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-medium text-foreground">
                Variant Attributes
              </h4>

              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() =>
                  onChange(variants.filter((_, variantIndex) => variantIndex !== index))
                }
              >
                <Trash2 />
                Delete Variant
              </Button>
            </div>

            <VariantAttributesEditor
              attributes={variant.product_variant_attributes ?? []}
              onChange={(attributes) => updateVariantAttributes(index, attributes)}
            />
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() =>
          onChange([
            ...variants,
            {
              name: "",
              sku: "",
              price: 0,
              sale_price: null,
              stock: 0,
              product_variant_attributes: [],
            },
          ])
        }
      >
        <Plus />
        Add Variant
      </Button>
    </div>
  );
}

function VariantAttributesEditor({
  attributes,
  onChange,
}: {
  attributes: ProductVariantAttribute[];
  onChange: (attributes: ProductVariantAttribute[]) => void;
}) {
  function updateAttribute(
    index: number,
    field: "attribute_name" | "attribute_value",
    value: string,
  ) {
    onChange(
      attributes.map((attribute, attributeIndex) =>
        attributeIndex === index
          ? {
              ...attribute,
              [field]: value,
            }
          : attribute,
      ),
    );
  }

  return (
    <div className="space-y-3">
      {attributes.map((attribute, index) => (
        <div key={attribute.id ?? index} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <Input
            aria-label="Variant Attribute Name"
            placeholder="Color"
            value={attribute.attribute_name}
            onChange={(event) =>
              updateAttribute(index, "attribute_name", event.target.value)
            }
          />

          <Input
            aria-label="Variant Attribute Value"
            placeholder="Red"
            value={attribute.attribute_value}
            onChange={(event) =>
              updateAttribute(index, "attribute_value", event.target.value)
            }
          />

          <Button
            type="button"
            variant="destructive"
            size="icon"
            aria-label="Remove variant attribute"
            onClick={() =>
              onChange(attributes.filter((_, attributeIndex) => attributeIndex !== index))
            }
          >
            <Trash2 />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          onChange([
            ...attributes,
            {
              attribute_name: "",
              attribute_value: "",
            },
          ])
        }
      >
        <Plus />
        Add Variant Attribute
      </Button>
    </div>
  );
}
