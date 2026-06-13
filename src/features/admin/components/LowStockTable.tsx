import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LowStockProductItem } from "../lib/types";

interface LowStockTableProps {
  products: LowStockProductItem[];
}

export function LowStockTable({ products }: LowStockTableProps) {
  function getStockBadge(stock: number) {
    if (stock === 0) {
      return (
        <span className="bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-500/20 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
          Out of Stock
        </span>
      );
    }
    return (
      <span className="bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/20 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
        {stock} Units Left
      </span>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-2xs">
      <div className="p-4 border-b border-border/80 bg-muted/10">
        <h3 className="text-sm font-semibold text-destructive flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-destructive animate-pulse" />
          Critical Stock Alerts
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">Products and variants with stock level ≤ 10</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product / Variant</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead className="text-right w-32">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center text-xs text-muted-foreground">
                All products have healthy stock levels.
              </TableCell>
            </TableRow>
          ) : (
            products.map((p) => (
              <TableRow key={p.id} className="hover:bg-muted/10 transition-colors">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground text-xs">{p.name}</span>
                    {p.variant_name && p.variant_name !== "-" && (
                      <span className="text-[10px] text-muted-foreground font-mono">
                        Variant: {p.variant_name}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {p.sku || "-"}
                </TableCell>
                <TableCell className="text-right font-black text-xs text-foreground">
                  {getStockBadge(p.stock)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
