import * as React from "react";
import { ProductDetailsClient } from "@/components/products/product-details-client";
import { notFound } from "next/navigation";
import {
  getProductBySlugOrId,
  getLandingProducts,
} from "@/features/products/lib/product.action";
import { formatCatalogProduct } from "@/features/products/lib/formatCatalogProduct";

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fetch actual product from Supabase
  const rawProduct = await getProductBySlugOrId(slug);

  if (!rawProduct) {
    notFound();
  }

  const product = formatCatalogProduct(rawProduct);

  // Fetch related products from Supabase
  const allRawProducts = await getLandingProducts();
  const allFormatted = allRawProducts.map((p, idx) =>
    formatCatalogProduct(p, idx),
  );

  // Related products in the same category, excluding current product
  let relatedProducts = allFormatted
    .filter((p) => p.category === product.category && String(p.id) !== String(product.id))
    .slice(0, 4);

  // If fewer than 4 in the same category, backfill with other products
  if (relatedProducts.length < 4) {
    const fillers = allFormatted
      .filter(
        (p) =>
          String(p.id) !== String(product.id) &&
          !relatedProducts.some((rp) => String(rp.id) === String(p.id)),
      )
      .slice(0, 4 - relatedProducts.length);
    relatedProducts = [...relatedProducts, ...fillers];
  }

  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Client Product Details */}
        <ProductDetailsClient
          product={product}
          relatedProducts={relatedProducts}
        />
      </div>
    </div>
  );
}
