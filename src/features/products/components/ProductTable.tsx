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


interface Product {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  stock: number;
  featured: boolean;
  status: string;

  categories?: {
    name: string;
  } | null;
}

interface Props {
  products: Product[];

  onEdit: (product: Product) => void;
}

export function ProductsTable({
  products,
  onEdit,
}: Props) {
  return (
    <div className="overflow-hidden rounded-[var(--radius)] border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              Product
            </TableHead>

            <TableHead>
              Category
            </TableHead>

            <TableHead>
              SKU
            </TableHead>

            <TableHead>
              Price
            </TableHead>

            <TableHead>
              Stock
            </TableHead>

            <TableHead>
              Status
            </TableHead>

            <TableHead />
          </TableRow>
        </TableHeader>

        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div>
                  <p className="font-medium">
                    {product.name}
                  </p>

                  {product.featured && (
                    <p className="text-xs text-muted-foreground">
                      Featured
                    </p>
                  )}
                </div>
              </TableCell>

              <TableCell>
                {product.categories?.name ??
                  "-"}
              </TableCell>

              <TableCell>
                {product.sku ?? "-"}
              </TableCell>

              <TableCell>
                ₹
                {Number(
                  product.price
                ).toLocaleString()}
              </TableCell>

              <TableCell>
                {product.stock}
              </TableCell>

              <TableCell>
                <Badge>
                  {product.status}
                </Badge>
              </TableCell>

              <TableCell>
                <ProductRowActions
                  product={product}
                  onEdit={onEdit}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}