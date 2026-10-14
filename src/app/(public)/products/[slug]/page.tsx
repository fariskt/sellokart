import * as React from "react";
import { ProductDetailsClient } from "@/components/products/product-details-client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
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
    <div className="min-h-screen pt-24 pb-28 font-display">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2.5 text-xs font-black tracking-[0.16em] uppercase text-landing-primary hover:text-landing-primary-hover transition-colors font-display group"
          >
            <div className="w-8 h-8 rounded-full border border-landing-primary/20 bg-white/90 flex items-center justify-center group-hover:bg-landing-primary group-hover:text-white transition-all shadow-xs">
              <ArrowLeft
                size={13}
                className="transition-transform group-hover:-translate-x-0.5"
              />
            </div>
            <span>Back</span>
          </Link>
        </div>

        {/* Client Product Details */}
        <ProductDetailsClient
          product={product}
          relatedProducts={relatedProducts}
        />
      </div>
    </div>
  );
}
