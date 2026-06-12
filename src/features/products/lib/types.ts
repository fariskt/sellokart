export interface ProductFormValues {
  id?: string;
  name: string;
  description?: string;
  categoryId?: string;
  price: number;
  salePrice?: number;
  stock: number;
  sku?: string;
  featured: boolean;
  status: "draft" | "active" | "archived";
  product_images?: {
    id: string;
    image_url: string;
    is_primary: boolean;
    sort_order: number;
  }[];
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
};
