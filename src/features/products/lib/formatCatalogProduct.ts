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

  const categoryName =
    prod.categories?.name ||
    (typeof prod.category === "string" ? prod.category : "General");

  // Derive badge / tag
  const tag =
    prod.featured
      ? "FEATURED"
      : prod.sale_price && prod.sale_price < prod.price
        ? "SALE"
        : index === 0
          ? "NEW"
          : null;

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
  if (!colors.length) {
    colors =
      PRODUCTS[index % PRODUCTS.length]?.colors || [
        "#1a3ff0",
        "#0a0f2e",
        "#c8d4ff",
      ];
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
    rating: 4.8,
    reviews: 24,
    badge: tag || undefined,
    tag,
    colors,
    image: primaryImg,
    images: allImages.length > 0 ? allImages : [primaryImg],
    category: categoryName,
    description:
      prod.description ||
      `Discover the details of ${prod.name}. Expertly crafted with precision and quality materials.`,
    stock: prod.stock,
    featured: Boolean(prod.featured),
  };
}
