import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TopProductItem } from "../lib/types";

interface TopProductsTableProps {
  products: TopProductItem[];
}

export function TopProductsTable({ products }: TopProductsTableProps) {
  function formatCurrency(val: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-2xs">
      <div className="p-4 border-b border-border/80 bg-muted/10">
        <h3 className="text-sm font-semibold text-foreground">Top Selling Products</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Highest units sold first</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Image</TableHead>
            <TableHead>Product</TableHead>
            <TableHead className="text-center w-24">Units Sold</TableHead>
            <TableHead className="text-right w-32">Revenue</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-xs text-muted-foreground">
                No selling history found in this period.
              </TableCell>
            </TableRow>
          ) : (
            products.map((p) => (
              <TableRow key={p.id} className="hover:bg-muted/10 transition-colors">
                <TableCell>
                  <div className="w-10 h-10 bg-muted/40 rounded-md border border-border flex items-center justify-center p-1.5 overflow-hidden shrink-0">
                    <img
                      src={p.image_url || "/images/headphones.png"}
                      alt={p.name}
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/headphones.png";
                      }}
                    />
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-foreground text-xs line-clamp-2 mt-2">
                  {p.name}
                </TableCell>
                <TableCell className="text-center font-bold text-xs">
                  {p.units_sold}
                </TableCell>
                <TableCell className="text-right font-black text-xs text-foreground">
                  {formatCurrency(p.revenue)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
