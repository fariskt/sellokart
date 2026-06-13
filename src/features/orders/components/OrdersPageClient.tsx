"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppPagination } from "@/components/AppPagination";
import { OrdersHeader } from "./OrdersHeader";
import { OrdersStatsComponent } from "./OrdersStats";
import { OrderFilters } from "./OrderFilters";
import { OrdersTable } from "./OrdersTable";
import { OrderDialog } from "./OrderDialog";
import { UpdateOrderStatusDialog } from "./UpdateOrderStatusDialog";
import { getOrderById } from "../lib/orders.action";
import { Order, OrdersStats } from "../lib/types";

interface OrdersPageClientProps {
  initialData: {
    data: Order[];
    stats: OrdersStats;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export function OrdersPageClient({ initialData }: OrdersPageClientProps) {
  const router = useRouter();

  // Details dialog state
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Status update dialog state
  const [statusOpen, setStatusOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  async function handleView(order: Order) {
    setSelectedOrderDetails(null);
    setDetailsOpen(true);

    const result = await getOrderById(order.id);

    if (result.success && result.data) {
      setSelectedOrderDetails(result.data);
    } else {
      setDetailsOpen(false);
      toast.error(result.message || "Failed to load order details.");
    }
  }

  function handleUpdateStatus(order: Order) {
    setSelectedOrder(order);
    setStatusOpen(true);
  }

  function handlePageChange(pageNumber: number) {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(pageNumber));
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <OrdersHeader />

      {/* Statistics Cards */}
      <OrdersStatsComponent stats={initialData.stats} />

      {/* Filter Section */}
      <OrderFilters />

      {/* Orders Table */}
      <OrdersTable
        orders={initialData.data}
        onView={handleView}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Pagination Bar */}
      <AppPagination
        page={initialData.pagination.page}
        totalPages={initialData.pagination.totalPages}
        onPageChange={handlePageChange}
      />

      {/* Details view Dialog */}
      <OrderDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        order={selectedOrderDetails}
      />

      {/* Status update Dialog */}
      <UpdateOrderStatusDialog
        open={statusOpen}
        onOpenChange={(nextOpen) => {
          setStatusOpen(nextOpen);
          if (!nextOpen) {
            setSelectedOrder(null);
          }
        }}
        order={selectedOrder}
      />
    </div>
  );
}
