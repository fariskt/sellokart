"use client";

import { useState, useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { adjustStock } from "../lib/inventory.action";
import { StockAdjustmentDialog } from "./StockAdjustmentDialog";
import { InventoryItem } from "../lib/types";

interface LowStockTableProps {
  items: InventoryItem[];
}

export function LowStockTable({ items }: LowStockTableProps) {
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-amber-500/20 bg-card shadow-xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Variant</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="w-36" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <span className="text-sm text-emerald-600 font-medium">
                    ✓ No low stock items
                  </span>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-semibold text-foreground">{item.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.variant_name !== "-" ? (
                      <span className="inline-flex items-center rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs font-medium">
                        {item.variant_name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {item.sku ?? "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-base font-bold text-amber-600 tabular-nums">
                      {item.stock}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1.5 text-xs border-amber-500/30 text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950 cursor-pointer"
                      onClick={() => setAdjustItem(item)}
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                      Restock
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <StockAdjustmentDialog
        open={adjustItem !== null}
        onOpenChange={(v) => { if (!v) setAdjustItem(null); }}
        item={adjustItem}
      />
    </>
  );
}
