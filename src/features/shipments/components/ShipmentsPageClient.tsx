"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppPagination } from "@/components/AppPagination";
import { ShipmentsHeader } from "./ShipmentsHeader";
import { ShipmentsStatsComponent } from "./ShipmentsStats";
import { ShipmentFilters } from "./ShipmentFilters";
import { ShipmentsTable } from "./ShipmentsTable";
import { ShipmentDetailsDialog } from "./ShipmentDetailsDialog";
import { UpdateShipmentDialog } from "./UpdateShipmentDialog";
import { getShipmentById } from "../lib/shipments.action";
import { Shipment, ShipmentsStats } from "../lib/types";

interface ShipmentsPageClientProps {
  initialData: {
    data: Shipment[];
    stats: ShipmentsStats;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export function ShipmentsPageClient({ initialData }: ShipmentsPageClientProps) {
  const router = useRouter();

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedShipmentDetails, setSelectedShipmentDetails] = useState<Shipment | null>(null);

  const [updateOpen, setUpdateOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  async function handleView(shipment: Shipment) {
    setSelectedShipmentDetails(null);
    setDetailsOpen(true);

    const result = await getShipmentById(shipment.id);

    if (result.success && result.data) {
      setSelectedShipmentDetails(result.data);
    } else {
      setDetailsOpen(false);
      toast.error(result.message || "Failed to load shipment details.");
    }
  }

  function handleUpdate(shipment: Shipment) {
    setSelectedShipment(shipment);
    setUpdateOpen(true);
  }

  function handlePageChange(pageNumber: number) {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(pageNumber));
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <ShipmentsHeader />

      <ShipmentsStatsComponent stats={initialData.stats} />

      <ShipmentFilters />

      <ShipmentsTable
        shipments={initialData.data}
        onView={handleView}
        onUpdate={handleUpdate}
      />

      <AppPagination
        page={initialData.pagination.page}
        totalPages={initialData.pagination.totalPages}
        onPageChange={handlePageChange}
      />

      <ShipmentDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        shipment={selectedShipmentDetails}
      />

      <UpdateShipmentDialog
        open={updateOpen}
        onOpenChange={(nextOpen) => {
          setUpdateOpen(nextOpen);
          if (!nextOpen) setSelectedShipment(null);
        }}
        shipment={selectedShipment}
      />
    </div>
  );
}
