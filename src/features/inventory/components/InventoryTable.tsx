"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, History, SlidersHorizontal } from "lucide-react";
import { InventoryItem } from "../lib/types";

interface InventoryTableProps {
  items: InventoryItem[];
  onAdjust: (item: InventoryItem) => void;
  onHistory: (item: InventoryItem) => void;
}

function getStockBadge(stock: number) {
  if (stock === 0) {
    return (
      <Badge className="rounded-full border-rose-200/60 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 px-2.5 py-0.5 text-xs font-semibold">
        Out of Stock
      </Badge>
    );
  }
  if (stock <= 10) {
    return (
      <Badge className="rounded-full border-amber-200/60 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 px-2.5 py-0.5 text-xs font-semibold">
        Low Stock
      </Badge>
    );
  }
  return (
    <Badge className="rounded-full border-emerald-200/60 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 px-2.5 py-0.5 text-xs font-semibold">
      In Stock
    </Badge>
  );
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "-";
  }
}

export function InventoryTable({ items, onAdjust, onHistory }: InventoryTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Product</TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">SKU</TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Variant</TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Stock</TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Created At</TableHead>
            <TableHead className="w-14" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-32 text-center">
                <div className="flex flex-col items-center justify-center space-y-1 py-8">
                  <span className="text-base font-semibold">No inventory items found</span>
                  <span className="text-sm text-muted-foreground">
                    Try adjusting your search or filters.
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-semibold text-foreground max-w-[200px] truncate">
                  {item.name}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {item.sku ?? "-"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {item.variant_name !== "-" ? (
                    <span className="inline-flex items-center rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs font-medium">
                      {item.variant_name}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/50">—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {item.categories?.name ?? "-"}
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={`text-base font-bold tabular-nums ${
                      item.stock === 0
                        ? "text-rose-600"
                        : item.stock <= 10
                        ? "text-amber-600"
                        : "text-foreground"
                    }`}
                  >
                    {item.stock}
                  </span>
                </TableCell>
                <TableCell>{getStockBadge(item.stock)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(item.created_at)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full border border-transparent hover:border-border hover:bg-muted"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={() => onHistory(item)}>
                        <History className="mr-2 h-4 w-4 text-muted-foreground" />
                        View History
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAdjust(item)}>
                        <SlidersHorizontal className="mr-2 h-4 w-4 text-muted-foreground" />
                        Adjust Stock
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
