"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppPagination } from "@/components/AppPagination";
import { NotificationsHeader } from "./NotificationsHeader";
import { NotificationsStatsComponent } from "./NotificationsStats";
import { NotificationsFilters } from "./NotificationsFilters";
import { NotificationsTable } from "./NotificationsTable";
import { NotificationDetailsDialog } from "./NotificationDetailsDialog";
import { NotificationDialog } from "./NotificationDialog";
import { BulkNotificationDialog } from "./BulkNotificationDialog";
import {
  getNotificationById,
  markAsRead,
  markAsUnread,
  deleteNotification,
} from "../lib/notifications.action";
import { Notification, NotificationStats } from "../lib/types";

interface NotificationsPageClientProps {
  initialData: {
    data: Notification[];
    stats: NotificationStats;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export function NotificationsPageClient({ initialData }: NotificationsPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Dialog States
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const [composeOpen, setComposeOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);

  // View Details Action
  async function handleView(notif: Notification) {
    setSelectedNotification(null);
    setDetailsOpen(true);

    const result = await getNotificationById(notif.id);
    if (result.success && result.data) {
      setSelectedNotification(result.data);
      // Auto mark as read when viewed, if it is currently unread
      if (!result.data.is_read) {
        startTransition(async () => {
          await markAsRead(notif.id);
        });
      }
    } else {
      setDetailsOpen(false);
      toast.error(result.message || "Failed to load notification details");
    }
  }

  // Mark Read Action
  function handleMarkRead(notif: Notification) {
    startTransition(async () => {
      const result = await markAsRead(notif.id);
      if (result.success) {
        toast.success("Notification marked as read");
      } else {
        toast.error(result.message || "Failed to update notification");
      }
    });
  }

  // Mark Unread Action
  function handleMarkUnread(notif: Notification) {
    startTransition(async () => {
      const result = await markAsUnread(notif.id);
      if (result.success) {
        toast.success("Notification marked as unread");
      } else {
        toast.error(result.message || "Failed to update notification");
      }
    });
  }

  // Delete Action
  function handleDelete(notif: Notification) {
    if (confirm("Are you sure you want to permanently delete this notification?")) {
      startTransition(async () => {
        const result = await deleteNotification(notif.id);
        if (result.success) {
          toast.success("Notification deleted successfully");
        } else {
          toast.error(result.message || "Failed to delete notification");
        }
      });
    }
  }

  // Page Change Action
  function handlePageChange(pageNumber: number) {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(pageNumber));
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      {/* Header with action buttons */}
      <NotificationsHeader
        onCompose={() => setComposeOpen(true)}
        onBulkSend={() => setBulkOpen(true)}
      />

      {/* Stats component */}
      <NotificationsStatsComponent stats={initialData.stats} />

      {/* Filter inputs */}
      <NotificationsFilters />

      {/* Data Table */}
      <NotificationsTable
        notifications={initialData.data}
        onView={handleView}
        onMarkRead={handleMarkRead}
        onMarkUnread={handleMarkUnread}
        onDelete={handleDelete}
      />

      {/* Pagination component */}
      <AppPagination
        page={initialData.pagination.page}
        totalPages={initialData.pagination.totalPages}
        onPageChange={handlePageChange}
      />

      {/* View Detail Dialog */}
      <NotificationDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        notification={selectedNotification}
      />

      {/* Compose Single Dialog */}
      <NotificationDialog
        open={composeOpen}
        onOpenChange={setComposeOpen}
        onSuccess={() => router.refresh()}
      />

      {/* Compose Bulk Dialog */}
      <BulkNotificationDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
