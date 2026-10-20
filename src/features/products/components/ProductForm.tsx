"use client";

import { useMemo, useState } from "react";
import { AppSelect } from "@/components/AppSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createProduct, updateProduct } from "../lib/product.action";
import {
  ProductAttribute,
  ProductFormValues,
  ProductVariant,
  ProductVariantAttribute,
} from "../lib/types";
import { toast } from "sonner";
import { ProductImagesUpload } from "./ProductImageUpload";
import {
  Image as ImageIcon,
  Layers,
  Package,
  Plus,
  Tag,
  Trash2,
} from "lucide-react";

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
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product?.slug));
  const [featured, setFeatured] = useState<boolean>(Boolean(product?.featured));

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

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setName(val);
    if (!slugTouched) {
      setSlug(generateSlug(val));
    }
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlugTouched(true);
    setSlug(generateSlug(e.target.value));
  }

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
      toast.error(result.message || "Failed to save product");
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6" id="product-form">
      <input type="hidden" name="attributes" value={attributesValue} />
      <input type="hidden" name="variants" value={variantsValue} />
      <input
        type="hidden"
        name="featured"
        value={featured ? "true" : "false"}
      />

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Package className="size-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <Tag className="size-4" />
            <span className="hidden sm:inline">Pricing & Stock</span>
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-2">
            <ImageIcon className="size-4" />
            <span className="hidden sm:inline">Media</span>
          </TabsTrigger>
          <TabsTrigger value="variants" className="flex items-center gap-2">
            <Layers className="size-4" />
            <span className="hidden sm:inline">Variants & Specs</span>
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent
          value="general"
          forceMount
          className="space-y-5 pt-4 data-[state=inactive]:hidden focus-visible:outline-none"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Product Name"
              name="name"
              placeholder="e.g. Wireless Noise-Cancelling Headphones"
              value={name}
              onChange={handleNameChange}
              required
            />

            <Input
              label="URL Slug"
              name="slug"
              placeholder="wireless-headphones"
              value={slug}
              onChange={handleSlugChange}
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
                className="w-full"
                options={categories.map((category) => ({
                  label: category.name,
                  value: category.id,
                }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Status
              </label>
              <AppSelect
                name="status"
                defaultValue={product?.status ?? "draft"}
                className="w-full"
                options={[
                  { label: "Draft", value: "draft" },
                  { label: "Active", value: "active" },
                  { label: "Archived", value: "archived" },
                ]}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Description
            </label>
            <Textarea
              name="description"
              placeholder="Provide a detailed description of the product features, benefits, and specifications..."
              defaultValue={product?.description}
              className="min-h-32"
            />
          </div>

          <div
            onClick={() => setFeatured(!featured)}
            className="flex items-center justify-between rounded-lg border border-border p-4 bg-muted/20 cursor-pointer select-none"
          >
            <div className="space-y-0.5">
              <span className="text-sm font-medium text-foreground">
                Featured Product
              </span>
              <p className="text-xs text-muted-foreground">
                Display this product in highlighted storefront collections and
                banners
              </p>
            </div>
            <Switch
              checked={featured}
              onCheckedChange={setFeatured}
            />
          </div>
        </TabsContent>

        {/* Pricing & Stock Tab */}
        <TabsContent
          value="pricing"
          forceMount
          className="space-y-5 pt-4 data-[state=inactive]:hidden focus-visible:outline-none"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Regular Price (₹)"
              name="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              defaultValue={product?.price}
              required
            />

            <Input
              label="Sale Price (₹)"
              name="sale_price"
              type="number"
              step="0.01"
              min="0"
              placeholder="Optional discounted price"
              defaultValue={
                product?.salePrice ?? product?.sale_price ?? undefined
              }
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Stock Quantity"
              name="stock"
              type="number"
              min="0"
              placeholder="0"
              defaultValue={product?.stock ?? 0}
              required
            />

            <Input
              label="SKU (Stock Keeping Unit)"
              name="sku"
              placeholder="e.g. PRD-HEADPHONE-01"
              defaultValue={product?.sku ?? undefined}
            />
          </div>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent
          value="media"
          forceMount
          className="space-y-4 pt-4 data-[state=inactive]:hidden focus-visible:outline-none"
        >
          <ProductImagesUpload
            name="images"
            maxSize={5}
            defaultImages={product?.product_images ?? []}
          />
        </TabsContent>

        {/* Variants & Specs Tab */}
        <TabsContent
          value="variants"
          forceMount
          className="space-y-6 pt-4 data-[state=inactive]:hidden focus-visible:outline-none"
        >
          {/* Specifications */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Specifications
                </h3>
                <p className="text-xs text-muted-foreground">
                  Key-value attributes such as Material, Warranty, Dimensions
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setAttributes([
                    ...attributes,
                    { attribute_name: "", attribute_value: "" },
                  ])
                }
              >
                <Plus className="mr-1 size-3.5" />
                Add Specification
              </Button>
            </div>

            <ProductAttributesEditor
              attributes={attributes}
              onChange={setAttributes}
            />
          </div>

          <hr className="border-border" />

          {/* Variants */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Product Variants
                </h3>
                <p className="text-xs text-muted-foreground">
                  Options with distinct pricing, stock, or SKUs (e.g. Size or
                  Color)
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setVariants([
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
                <Plus className="mr-1 size-3.5" />
                Add Variant
              </Button>
            </div>

            <ProductVariantsEditor
              variants={variants}
              onChange={setVariants}
            />
          </div>
        </TabsContent>
      </Tabs>
    </form>
  );
}

function generateSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
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

  if (attributes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-6 text-center bg-muted/10">
        <p className="text-xs text-muted-foreground">
          No specifications added yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {attributes.map((attribute, index) => (
        <div
          key={attribute.id ?? index}
          className="flex items-center gap-3"
        >
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              aria-label="Attribute Name"
              placeholder="Attribute (e.g. Material)"
              value={attribute.attribute_name}
              onChange={(event) =>
                updateAttribute(index, "attribute_name", event.target.value)
              }
            />
            <Input
              aria-label="Attribute Value"
              placeholder="Value (e.g. Aluminum)"
              value={attribute.attribute_value}
              onChange={(event) =>
                updateAttribute(index, "attribute_value", event.target.value)
              }
            />
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive shrink-0 size-8"
            aria-label="Remove attribute"
            onClick={() =>
              onChange(
                attributes.filter(
                  (_, attributeIndex) => attributeIndex !== index,
                ),
              )
            }
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
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
    field: keyof Pick<
      ProductVariant,
      "name" | "sku" | "price" | "sale_price" | "stock"
    >,
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

  if (variants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-6 text-center bg-muted/10">
        <p className="text-xs text-muted-foreground">
          No variants configured yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {variants.map((variant, index) => (
        <div
          key={variant.id ?? index}
          className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-xs"
        >
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              Variant #{index + 1} {variant.name ? `— ${variant.name}` : ""}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive h-7 px-2"
              onClick={() =>
                onChange(
                  variants.filter((_, variantIndex) => variantIndex !== index),
                )
              }
            >
              <Trash2 className="mr-1 size-3.5" />
              Remove
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Variant Name"
              placeholder="e.g. Midnight Black / 256GB"
              value={variant.name}
              onChange={(event) =>
                updateVariant(index, "name", event.target.value)
              }
            />
            <Input
              label="SKU"
              placeholder="e.g. SKU-BLK-256"
              value={variant.sku ?? ""}
              onChange={(event) =>
                updateVariant(index, "sku", event.target.value)
              }
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Input
              label="Price (₹)"
              type="number"
              step="0.01"
              value={variant.price}
              onChange={(event) =>
                updateVariant(index, "price", event.target.value)
              }
            />
            <Input
              label="Sale Price (₹)"
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
              onChange={(event) =>
                updateVariant(index, "stock", event.target.value)
              }
            />
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">
                Options / Dimensions
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 text-xs px-2"
                onClick={() =>
                  updateVariantAttributes(index, [
                    ...(variant.product_variant_attributes ?? []),
                    { attribute_name: "", attribute_value: "" },
                  ])
                }
              >
                <Plus className="mr-1 size-3" />
                Add Option
              </Button>
            </div>

            <VariantAttributesEditor
              attributes={variant.product_variant_attributes ?? []}
              onChange={(attributes) =>
                updateVariantAttributes(index, attributes)
              }
            />
          </div>
        </div>
      ))}
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

  if (attributes.length === 0) {
    return (
      <p className="text-xs text-muted-foreground italic">
        No options specified for this variant (e.g. Color: Black).
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {attributes.map((attribute, index) => (
        <div
          key={attribute.id ?? index}
          className="flex items-center gap-2"
        >
          <div className="flex-1 grid grid-cols-2 gap-2">
            <Input
              aria-label="Option Name"
              placeholder="e.g. Color"
              value={attribute.attribute_name}
              onChange={(event) =>
                updateAttribute(index, "attribute_name", event.target.value)
              }
            />
            <Input
              aria-label="Option Value"
              placeholder="e.g. Black"
              value={attribute.attribute_value}
              onChange={(event) =>
                updateAttribute(index, "attribute_value", event.target.value)
              }
            />
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive shrink-0 size-7"
            aria-label="Remove variant attribute"
            onClick={() =>
              onChange(
                attributes.filter(
                  (_, attributeIndex) => attributeIndex !== index,
                ),
              )
            }
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ))}
    </div>
  );
}
