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
  function renderStatusBadge(status: string) {
    if (status === "active") {
      return (
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize">
          Active
        </Badge>
      );
    }
    if (status === "draft") {
      return (
        <Badge className="bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize">
          Draft
        </Badge>
      );
    }
    return (
      <Badge className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize">
        Archived
      </Badge>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Product</TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">SKU</TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Price</TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Stock</TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</TableHead>
            <TableHead className="w-14" />
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
              <TableRow key={product.id} className="hover:bg-muted/20 transition-colors">
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
                        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground shadow-2xs">
                          {product.product_images.length}
                        </span>
                      )}
                    </div>

                    <div>
                      <p className="font-semibold text-foreground text-sm">{product.name}</p>

                      <div className="flex items-center gap-2">
                        {product.featured && (
                          <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-full">
                            Featured
                          </span>
                        )}

                        {product.product_images.length > 1 && (
                          <p className="text-[11px] text-muted-foreground">
                            {product.product_images.length} images
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-sm text-muted-foreground">{product.categories?.name ?? "-"}</TableCell>

                <TableCell className="font-mono text-xs text-muted-foreground">{product.sku ?? "-"}</TableCell>

                <TableCell className="font-semibold text-foreground text-sm">₹{Number(product.price).toLocaleString()}</TableCell>

                <TableCell className="text-sm font-medium">
                  <span className={product.stock === 0 ? "text-rose-600 font-bold" : product.stock <= 10 ? "text-amber-600 font-bold" : "text-foreground"}>
                    {product.stock}
                  </span>
                </TableCell>

                <TableCell>
                  {renderStatusBadge(product.status)}
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
