"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppPagination } from "@/components/AppPagination";
import { InventoryHeader } from "./InventoryHeader";
import { InventoryStatsComponent } from "./InventoryStats";
import { InventoryFilters } from "./InventoryFilters";
import { InventoryTable } from "./InventoryTable";
import { StockAdjustmentDialog } from "./StockAdjustmentDialog";
import { InventoryHistoryDialog } from "./InventoryHistoryDialog";
import { getInventoryHistory } from "../lib/inventory.action";
import { InventoryItem, InventoryLog, InventoryStats } from "../lib/types";

interface Category {
  id: string;
  name: string;
}

interface InventoryPageClientProps {
  initialData: {
    data: InventoryItem[];
    stats: InventoryStats;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  categories: Category[];
}

export function InventoryPageClient({ initialData, categories }: InventoryPageClientProps) {
  const router = useRouter();

  // ── Adjust Stock Dialog ─────────────────────────────────────────────────
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);

  // ── History Dialog ──────────────────────────────────────────────────────
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyItem, setHistoryItem] = useState<InventoryItem | null>(null);
  const [historyLogs, setHistoryLogs] = useState<InventoryLog[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // ── Handlers ────────────────────────────────────────────────────────────
  function handleAdjust(item: InventoryItem) {
    setAdjustItem(item);
    setAdjustOpen(true);
  }

  async function handleHistory(item: InventoryItem) {
    setHistoryItem(item);
    setHistoryLogs([]);
    setHistoryLoading(true);
    setHistoryOpen(true);

    try {
      const logs = await getInventoryHistory(item.product_id, item.variant_id);
      setHistoryLogs(logs);
    } catch {
      toast.error("Failed to load stock history.");
      setHistoryOpen(false);
    } finally {
      setHistoryLoading(false);
    }
  }

  function handlePageChange(pageNumber: number) {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(pageNumber));
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <InventoryHeader />

      <InventoryStatsComponent stats={initialData.stats} />

      <InventoryFilters categories={categories} />

      <InventoryTable
        items={initialData.data}
        onAdjust={handleAdjust}
        onHistory={handleHistory}
      />

      <AppPagination
        page={initialData.pagination.page}
        totalPages={initialData.pagination.totalPages}
        onPageChange={handlePageChange}
      />

      <StockAdjustmentDialog
        open={adjustOpen}
        onOpenChange={setAdjustOpen}
        item={adjustItem}
        onSuccess={() => router.refresh()}
      />

      <InventoryHistoryDialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        item={historyItem}
        logs={historyLogs}
        isLoading={historyLoading}
      />
    </div>
  );
}
