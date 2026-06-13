import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import { ProductRowActions } from "./ProductRowActions";
import { TableImage } from "@/components/common/TableImage";
import { ProductImage } from "./ProductImageUpload";
import type { ProductAttribute, ProductVariant } from "../lib/types";

export interface Product {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  categoryId?: string;
  category_id?: string;
  sku: string | null;
  price: number;
  sale_price?: number | null;
  salePrice?: number | null;
  stock: number;
  featured: boolean;
  status: "draft" | "active" | "archived";
  product_images: ProductImage[];

  categories?: {
    id?: string;
    name: string;
  } | null;

  product_attributes?: ProductAttribute[];
  product_variants?: ProductVariant[];
}

interface Props {
  products: Product[];
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
}

export function ProductsTable({ products, onView, onEdit }: Props) {
  return (
    <div className="overflow-hidden rounded-[var(--radius)] border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>

            <TableHead>Category</TableHead>

            <TableHead>SKU</TableHead>

            <TableHead>Price</TableHead>

            <TableHead>Stock</TableHead>

            <TableHead>Status</TableHead>

            <TableHead />
          </TableRow>
        </TableHeader>

        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="h-32 text-center text-muted-foreground"
              >
                No products found
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <TableImage
                        src={
                          product.product_images.find(
                            (image) => image.is_primary,
                          )?.image_url
                        }
                        alt={product.name}
                      />

                      {product.product_images.length > 1 && (
                        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                          {product.product_images.length}
                        </span>
                      )}
                    </div>

                    <div>
                      <p className="font-medium">{product.name}</p>

                      <div className="flex items-center gap-2">
                        {product.featured && (
                          <p className="text-xs text-muted-foreground">
                            Featured
                          </p>
                        )}

                        {product.product_images.length > 1 && (
                          <p className="text-xs text-muted-foreground">
                            {product.product_images.length} images
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell>{product.categories?.name ?? "-"}</TableCell>

                <TableCell>{product.sku ?? "-"}</TableCell>

                <TableCell>₹{Number(product.price).toLocaleString()}</TableCell>

                <TableCell>{product.stock}</TableCell>

                <TableCell>
                  <Badge>{product.status}</Badge>
                </TableCell>

                <TableCell>
                  <ProductRowActions
                    product={product}
                    onView={onView}
                    onEdit={onEdit}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
