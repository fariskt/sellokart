"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppPagination } from "@/components/AppPagination";
import { PaymentsHeader } from "./PaymentsHeader";
import { PaymentsStatsComponent } from "./PaymentsStats";
import { PaymentFilters } from "./PaymentFilters";
import { PaymentsTable } from "./PaymentsTable";
import { PaymentDetailsDialog } from "./PaymentDetailsDialog";
import { getPaymentById } from "../lib/payments.action";
import { Payment, PaymentsStats } from "../lib/types";

interface PaymentsPageClientProps {
  initialData: {
    data: Payment[];
    stats: PaymentsStats;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export function PaymentsPageClient({ initialData }: PaymentsPageClientProps) {
  const router = useRouter();

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  async function handleView(payment: Payment) {
    setSelectedPayment(null);
    setDetailsOpen(true);

    const result = await getPaymentById(payment.id);

    if (result.success && result.data) {
      setSelectedPayment(result.data);
    } else {
      setDetailsOpen(false);
      toast.error(result.message || "Failed to load payment details.");
    }
  }

  function handlePageChange(pageNumber: number) {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(pageNumber));
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <PaymentsHeader />

      <PaymentsStatsComponent stats={initialData.stats} />

      <PaymentFilters />

      <PaymentsTable payments={initialData.data} onView={handleView} />

      <AppPagination
        page={initialData.pagination.page}
        totalPages={initialData.pagination.totalPages}
        onPageChange={handlePageChange}
      />

      <PaymentDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        payment={selectedPayment}
      />
    </div>
  );
}
