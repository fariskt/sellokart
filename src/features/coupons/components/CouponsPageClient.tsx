"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppPagination } from "@/components/AppPagination";

import { CouponsHeader } from "./CouponsHeader";
import { CouponsStatsComponent } from "./CouponsStats";
import { CouponsFilters } from "./CouponsFilters";
import { CouponsTable } from "./CouponsTable";
import { CouponDialog } from "./CouponDialog";
import { CouponDetailsDialog } from "./CouponDetailsDialog";

import {
  activateCoupon,
  deactivateCoupon,
  deleteCoupon,
} from "../lib/coupons.action";
import { Coupon, CouponStats } from "../lib/types";

interface CouponsPageClientProps {
  initialData: {
    data: Coupon[];
    stats: CouponStats;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export function CouponsPageClient({ initialData }: CouponsPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Create / Edit dialog state
  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Details dialog state
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  // ── Open create dialog ───────────────────────────────────────────────────────
  function handleCreate() {
    setEditingCoupon(null);
    setCouponDialogOpen(true);
  }

  // ── Open edit dialog with pre-filled coupon ──────────────────────────────────
  function handleEdit(coupon: Coupon) {
    setEditingCoupon(coupon);
    setCouponDialogOpen(true);
  }

  // ── View coupon details dialog ────────────────────────────────────────────────
  function handleView(coupon: Coupon) {
    setSelectedCoupon(coupon);
    setDetailsOpen(true);
  }

  // ── Activate coupon ───────────────────────────────────────────────────────────
  function handleActivate(coupon: Coupon) {
    startTransition(async () => {
      const result = await activateCoupon(coupon.id);
      if (result.success) {
        toast.success(result.message ?? "Coupon activated");
      } else {
        toast.error(result.message ?? "Failed to activate coupon");
      }
    });
  }

  // ── Deactivate coupon ─────────────────────────────────────────────────────────
  function handleDeactivate(coupon: Coupon) {
    startTransition(async () => {
      const result = await deactivateCoupon(coupon.id);
      if (result.success) {
        toast.success(result.message ?? "Coupon deactivated");
      } else {
        toast.error(result.message ?? "Failed to deactivate coupon");
      }
    });
  }

  // ── Delete coupon with confirmation ───────────────────────────────────────────
  function handleDelete(coupon: Coupon) {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete coupon "${coupon.code}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteCoupon(coupon.id);
      if (result.success) {
        toast.success(result.message ?? "Coupon deleted");
      } else {
        toast.error(result.message ?? "Failed to delete coupon");
      }
    });
  }

  // ── Pagination ────────────────────────────────────────────────────────────────
  function handlePageChange(pageNumber: number) {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(pageNumber));
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <CouponsHeader onCreate={handleCreate} />

      <CouponsStatsComponent stats={initialData.stats} />

      <CouponsFilters />

      <div className={isPending ? "opacity-60 pointer-events-none transition-opacity" : ""}>
        <CouponsTable
          coupons={initialData.data}
          onView={handleView}
          onEdit={handleEdit}
          onActivate={handleActivate}
          onDeactivate={handleDeactivate}
          onDelete={handleDelete}
        />
      </div>

      <AppPagination
        page={initialData.pagination.page}
        totalPages={initialData.pagination.totalPages}
        onPageChange={handlePageChange}
      />

      {/* Create / Edit Dialog */}
      <CouponDialog
        open={couponDialogOpen}
        onOpenChange={setCouponDialogOpen}
        coupon={editingCoupon}
        onSuccess={() => router.refresh()}
      />

      {/* Details Dialog */}
      <CouponDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        coupon={selectedCoupon}
      />
    </div>
  );
}
