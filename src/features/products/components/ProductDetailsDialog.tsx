"use client";

import { AppDialog } from "@/components/AppDialog";
import { Badge } from "@/components/ui/badge";
import { ProductFormValues } from "../lib/types";
import type { ReactNode } from "react";

interface ProductDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductFormValues | null;
}

export function ProductDetailsDialog({
  open,
  onOpenChange,
  product,
}: ProductDetailsDialogProps) {
  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Product Details"
      description={product?.name}
      size="2xl"
    >
      {!product ? (
        <p className="text-sm text-muted-foreground">Loading product details...</p>
      ) : (
        <div className="space-y-6">
          <DetailsSection title="General Information">
            <DetailsGrid
              items={[
                ["Name", product.name],
                ["Slug", product.slug ?? "-"],
                ["Category", product.categories?.name ?? "-"],
                ["SKU", product.sku ?? "-"],
                ["Status", <Badge key="status">{product.status}</Badge>],
                ["Featured", product.featured ? "Yes" : "No"],
                ["Description", product.description || "-"],
              ]}
            />
          </DetailsSection>

          <DetailsSection title="Pricing">
            <DetailsGrid
              items={[
                ["Price", formatCurrency(product.price)],
                [
                  "Sale Price",
                  product.salePrice != null || product.sale_price != null
                    ? formatCurrency(product.salePrice ?? product.sale_price ?? 0)
                    : "-",
                ],
              ]}
            />
          </DetailsSection>

          <DetailsSection title="Inventory">
            <DetailsGrid items={[["Stock", String(product.stock)]]} />
          </DetailsSection>

          <DetailsSection title="Images">
            {product.product_images?.length ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {product.product_images.map((image) => (
                  <div
                    key={image.id}
                    className="overflow-hidden rounded-lg border border-border"
                  >
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.image_url}
                        alt={product.name}
                        className="aspect-square w-full object-cover"
                      />

                      {image.is_primary && (
                        <span className="absolute left-2 top-2 rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                          Primary
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyText>No images added.</EmptyText>
            )}
          </DetailsSection>

          <DetailsSection title="Specifications">
            {product.product_attributes?.length ? (
              <div className="divide-y rounded-lg border border-border">
                {product.product_attributes.map((attribute) => (
                  <div
                    key={attribute.id}
                    className="grid gap-2 p-3 md:grid-cols-[220px_1fr]"
                  >
                    <p className="text-sm font-medium text-foreground">
                      {attribute.attribute_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {attribute.attribute_value}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyText>No specifications added.</EmptyText>
            )}
          </DetailsSection>

          <DetailsSection title="Variants">
            {product.product_variants?.length ? (
              <div className="space-y-4">
                {product.product_variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="space-y-4 rounded-lg border border-border p-4"
                  >
                    <DetailsGrid
                      items={[
                        ["Variant Name", variant.name],
                        ["SKU", variant.sku ?? "-"],
                        ["Price", formatCurrency(variant.price)],
                        [
                          "Sale Price",
                          variant.sale_price != null
                            ? formatCurrency(variant.sale_price)
                            : "-",
                        ],
                        ["Stock", String(variant.stock)],
                      ]}
                    />

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-foreground">
                        Variant Attributes
                      </h4>

                      {variant.product_variant_attributes?.length ? (
                        <div className="divide-y rounded-lg border border-border">
                          {variant.product_variant_attributes.map((attribute) => (
                            <div
                              key={attribute.id}
                              className="grid gap-2 p-3 md:grid-cols-[180px_1fr]"
                            >
                              <p className="text-sm font-medium text-foreground">
                                {attribute.attribute_name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {attribute.attribute_value}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyText>No variant attributes added.</EmptyText>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyText>No variants added.</EmptyText>
            )}
          </DetailsSection>
        </div>
      )}
    </AppDialog>
  );
}

function DetailsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-lg border border-border p-4">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </section>
  );
}

function DetailsGrid({
  items,
}: {
  items: [string, ReactNode][];
}) {
  return (
    <dl className="grid gap-3 md:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label} className="space-y-1">
          <dt className="text-xs font-medium uppercase text-muted-foreground">
            {label}
          </dt>
          <dd className="text-sm text-foreground">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function EmptyText({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value));
}
