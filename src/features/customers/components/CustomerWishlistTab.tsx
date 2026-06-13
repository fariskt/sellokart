"use client";

import Link from "next/link";
import { CustomerWishlistItem } from "../lib/types";

interface CustomerWishlistTabProps {
  wishlist: CustomerWishlistItem[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(value));
}

export function CustomerWishlistTab({ wishlist }: CustomerWishlistTabProps) {
  if (wishlist.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-border rounded-lg bg-card">
        <h3 className="text-sm font-semibold text-foreground">No wishlist items found</h3>
        <p className="mt-1 text-xs text-muted-foreground">This customer has not added any products to their wishlist yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {wishlist.map((item) => {
        const product = item.products;
        if (!product) return null;

        const images = product.product_images ?? [];
        const primaryImage = images.find((img) => img.is_primary) ?? images[0];
        const imageUrl = primaryImage?.image_url || "/images/headphones.png";

        return (
          <div
            key={item.id}
            className="border border-border rounded-lg bg-card overflow-hidden shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
          >
            {/* Image container */}
            <div className="h-40 bg-muted/20 border-b border-border/40 p-4 flex items-center justify-center">
              <img
                src={imageUrl}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/headphones.png";
                }}
              />
            </div>

            {/* Info and button */}
            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-semibold text-foreground text-sm line-clamp-2 leading-snug" title={product.name}>
                  {product.name}
                </h4>
                <p className="mt-1 text-sm font-bold text-foreground">
                  {formatCurrency(product.price)}
                </p>
              </div>

              <div className="pt-2 border-t border-border/30">
                <Link
                  href={`/admin/products`}
                  className="w-full inline-flex justify-center items-center text-xs font-semibold text-muted-foreground hover:text-primary transition-colors hover:underline"
                >
                  Manage Product
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
