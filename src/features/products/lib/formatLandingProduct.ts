import { PRODUCTS } from "@/components/landing/constants";

export interface FormattedLandingProduct {
  id: string | number;
  name: string;
  slug?: string;
  price: number;
  salePrice?: number | null;
  tag?: string | null;
  colors: string[];
  image: string;
  description?: string;
  featured?: boolean;
}

export function formatLandingProduct(
  product: any,
  index: number = 0,
): FormattedLandingProduct {
  // Find primary image or first available image
  const primaryImg =
    product.product_images?.find((img: any) => img.is_primary)?.image_url ||
    product.product_images?.[0]?.image_url;

  // Fallback if product has no uploaded image
  const fallbackImage =
    PRODUCTS[index % PRODUCTS.length]?.image ||
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=720&fit=crop&auto=format";

  // Extract color values if specified in product attributes
  const colorAttr = product.product_attributes?.find((attr: any) =>
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

  // Derive display tag
  let tag: string | null = null;
  if (product.featured) {
    tag = "FEATURED";
  } else if (product.sale_price && product.sale_price < product.price) {
    tag = "SALE";
  } else if (index === 0) {
    tag = "NEW";
  } else if (index === 1) {
    tag = "HOT";
  } else if (index === 3) {
    tag = "TRENDING";
  }

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    salePrice: product.sale_price,
    tag,
    colors,
    image: primaryImg || fallbackImage,
    description: product.description,
    featured: Boolean(product.featured),
  };
}
