import { PRODUCTS } from "@/components/landing/constants";

export interface CatalogProduct {
  id: string | number;
  name: string;
  slug: string;
  price: number;
  salePrice?: number | null;
  oldPrice?: string;
  rating: number;
  reviews: number;
  badge?: string;
  tag?: string | null;
  colors: string[];
  sizes?: string[];
  image: string;
  images?: string[];
  category: string;
  description: string;
  stock?: number;
  featured?: boolean;
}

export function formatCatalogProduct(prod: any, index: number = 0): CatalogProduct {
  const primaryImg =
    prod.product_images?.find((img: any) => img.is_primary)?.image_url ||
    prod.product_images?.[0]?.image_url ||
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=720&fit=crop&auto=format";

  const allImages =
    prod.product_images
      ?.map((img: any) => img.image_url)
      .filter((url: any): url is string => typeof url === "string" && Boolean(url)) || [];

  // Extract color values if specified in attributes
  const colorAttr = prod.product_attributes?.find((attr: any) =>
    attr.attribute_name?.toLowerCase().includes("color"),
  );
  let colors: string[] = [];
  if (colorAttr?.attribute_value) {
    colors = colorAttr.attribute_value
      .split(/[,/|]/)
      .map((c: string) => c.trim())
      .filter(Boolean);
  }

  // Extract size values if specified in attributes or variants
  const sizeAttr = prod.product_attributes?.find((attr: any) =>
    attr.attribute_name?.toLowerCase().includes("size"),
  );
  let sizes: string[] = [];
  if (sizeAttr?.attribute_value) {
    sizes = sizeAttr.attribute_value
      .split(/[,/|]/)
      .map((s: string) => s.trim())
      .filter(Boolean);
  } else if (prod.product_variants && Array.isArray(prod.product_variants)) {
    const variantSizes = prod.product_variants
      .map((v: any) => {
        const attr = v.product_variant_attributes?.find((a: any) =>
          a.attribute_name?.toLowerCase().includes("size"),
        );
        return attr?.attribute_value || v.name;
      })
      .filter(Boolean);
    sizes = Array.from(new Set(variantSizes));
  }

  const hasSale = prod.sale_price && prod.sale_price < prod.price;
  const oldPrice = hasSale ? `$${prod.price.toLocaleString()}` : undefined;
  const effectivePrice = hasSale ? prod.sale_price : prod.price;

  return {
    id: prod.id,
    name: prod.name,
    slug: prod.slug || String(prod.id),
    price: effectivePrice ?? 0,
    salePrice: hasSale ? prod.sale_price : null,
    oldPrice,
    rating: typeof prod.rating === "number" ? prod.rating : 5.0,
    reviews: typeof prod.reviews_count === "number" ? prod.reviews_count : 0,
    colors,
    sizes,
    image: primaryImg,
    images: allImages.length > 0 ? allImages : [primaryImg],
    category: "Products", //set to products for now
    description: prod.description || "",
    stock: prod.stock,
    featured: Boolean(prod.featured),
  };
}
