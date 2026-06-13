"use client";

import { Badge } from "@/components/ui/badge";
import { ProductFormValues } from "../lib/types";
import type { ReactNode } from "react";

interface ProductOverviewTabProps {
  product: ProductFormValues;
}

export function ProductOverviewTab({ product }: ProductOverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* General & Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DetailsSection title="General Information">
          <DetailsGrid
            items={[
              ["Name", product.name],
              ["Slug", product.slug ?? "-"],
              ["Category", product.categories?.name ?? "-"],
              ["SKU", product.sku ?? "-"],
              ["Status", <Badge key="status" className="uppercase tracking-wider text-[10px] font-semibold">{product.status}</Badge>],
              ["Featured", product.featured ? "Yes" : "No"],
              ["Description", product.description || "-"],
            ]}
          />
        </DetailsSection>

        <div className="space-y-6">
          <DetailsSection title="Pricing & Inventory">
            <DetailsGrid
              items={[
                ["Price", formatCurrency(product.price)],
                [
                  "Sale Price",
                  product.salePrice != null || product.sale_price != null
                    ? formatCurrency(product.salePrice ?? product.sale_price ?? 0)
                    : "-",
                ],
                ["Current Stock", String(product.stock)],
              ]}
            />
          </DetailsSection>
        </div>
      </div>

      {/* Images Section */}
      <DetailsSection title="Images">
        {product.product_images?.length ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
            {product.product_images.map((image) => (
              <div
                key={image.id}
                className="overflow-hidden rounded-lg border border-border bg-card shadow-2xs relative group hover:border-primary/40 transition-colors"
              >
                <div className="relative aspect-square w-full flex items-center justify-center p-2 bg-muted/20">
                  <img
                    src={image.image_url}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain"
                  />
                  {image.is_primary && (
                    <span className="absolute left-2 top-2 rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground uppercase tracking-wider">
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

      {/* Specifications & Variants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DetailsSection title="Specifications">
          {product.product_attributes?.length ? (
            <div className="divide-y divide-border border border-border rounded-lg bg-card overflow-hidden">
              {product.product_attributes.map((attribute) => (
                <div
                  key={attribute.id}
                  className="grid gap-2 p-3 grid-cols-[150px_1fr] text-sm hover:bg-muted/10 transition-colors"
                >
                  <p className="font-semibold text-foreground">
                    {attribute.attribute_name}
                  </p>
                  <p className="text-muted-foreground font-medium">
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
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              {product.product_variants.map((variant) => (
                <div
                  key={variant.id}
                  className="space-y-4 rounded-lg border border-border bg-muted/10 p-4"
                >
                  <DetailsGrid
                    items={[
                      ["Variant Name", variant.name],
                      ["SKU", variant.sku ?? "-"],
                      ["Price", formatCurrency(variant.price)],
                      [
                        "Sale Price",
                        variant.sale_price != null ? formatCurrency(variant.sale_price) : "-",
                      ],
                      ["Stock", String(variant.stock)],
                    ]}
                  />

                  {variant.product_variant_attributes?.length ? (
                    <div className="space-y-2 mt-2 pt-2 border-t border-border/50">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Variant Attributes
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {variant.product_variant_attributes.map((attr) => (
                          <Badge key={attr.id} variant="secondary" className="text-xs">
                            <span className="font-semibold mr-1">{attr.attribute_name}:</span>
                            {attr.attribute_value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <EmptyText>No variants added.</EmptyText>
          )}
        </DetailsSection>
      </div>
    </div>
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
    <section className="space-y-3 rounded-lg border border-border p-5 bg-card shadow-2xs">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
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
    <dl className="grid gap-3 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label} className="space-y-1">
          <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {label}
          </dt>
          <dd className="text-sm font-semibold text-foreground leading-snug">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function EmptyText({ children }: { children: ReactNode }) {
  return <p className="text-xs font-medium text-muted-foreground italic pl-1">{children}</p>;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value));
}
