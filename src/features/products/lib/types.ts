export interface ProductFormValues {
  id?: string;
  name: string;
  slug?: string;
  description?: string;
  categoryId?: string;
  category_id?: string;
  price: number;
  sale_price?: number | null;
  salePrice?: number | null;
  stock: number;
  sku?: string | null;
  featured: boolean;
  status: "draft" | "active" | "archived";
  product_images?: {
    id: string;
    image_url: string;
    is_primary: boolean;
    sort_order: number;
  }[];
  product_attributes?: ProductAttribute[];
  product_variants?: ProductVariant[];
  categories?: {
    id?: string;
    name: string;
  } | null;
}

export interface ProductAttribute {
  id?: string;
  product_id?: string;
  attribute_name: string;
  attribute_value: string;
  created_at?: string;
}

export interface ProductVariantAttribute {
  id?: string;
  variant_id?: string;
  attribute_name: string;
  attribute_value: string;
  created_at?: string;
}

export interface ProductVariant {
  id?: string;
  product_id?: string;
  name: string;
  sku?: string | null;
  price: number;
  sale_price?: number | null;
  stock: number;
  created_at?: string;
  product_variant_attributes?: ProductVariantAttribute[];
}

export interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  mode: "create" | "edit";

  product?: ProductFormValues;

  categories: {
    id: string;
    name: string;
  }[];
}

export type GetProductsParams = {
  page?: number;
  limit?: number;

  search?: string;

  categoryId?: string;

  status?: "draft" | "active" | "archived";

  featured?: boolean;

  sort?: string;
};
