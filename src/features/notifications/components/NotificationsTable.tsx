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
import { MoreHorizontal, Eye, CheckCheck, MailWarning, Trash2 } from "lucide-react";
import { Notification } from "../lib/types";

interface NotificationsTableProps {
  notifications: Notification[];
  onView: (notification: Notification) => void;
  onMarkRead: (notification: Notification) => void;
  onMarkUnread: (notification: Notification) => void;
  onDelete: (notification: Notification) => void;
}

export function NotificationsTable({
  notifications,
  onView,
  onMarkRead,
  onMarkUnread,
  onDelete,
}: NotificationsTableProps) {
  function formatDate(dateStr: string) {
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  }

  function getTypeBadge(type: string) {
    const typeStyles: Record<string, string> = {
      order: "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-500/20 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider",
      payment: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider",
      shipment: "bg-purple-500/10 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border border-purple-500/20 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider",
      return: "bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-500/20 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider",
      coupon: "bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/20 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider",
      system: "bg-zinc-500/10 text-zinc-700 dark:bg-zinc-500/20 dark:text-zinc-400 border border-zinc-500/20 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider",
    };

    return (
      <span className={typeStyles[type] || "border rounded-full px-2.5 py-0.5 text-xs font-semibold"}>
        {type}
      </span>
    );
  }

  function getStatusBadge(isRead: boolean) {
    if (isRead) {
      return (
        <span className="bg-slate-500/10 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400 border border-slate-500/20 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider">
          Read
        </span>
      );
    }
    return (
      <span className="bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-500/20 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider">
        Unread
      </span>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Notification Details</TableHead>
            <TableHead>Recipient</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sent At</TableHead>
            <TableHead className="w-16" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {notifications.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="h-32 text-center text-muted-foreground"
              >
                <div className="flex flex-col items-center justify-center space-y-1 py-8">
                  <span className="text-base font-semibold">No notifications found</span>
                  <span className="text-sm text-muted-foreground">Try adjusting your filters or search terms.</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            notifications.map((notif) => {
              return (
                <TableRow key={notif.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="max-w-xs md:max-w-md">
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground truncate">
                        {notif.title}
                      </span>
                      <span className="text-xs text-muted-foreground truncate max-w-[300px]">
                        {notif.message}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {notif.profiles?.name || "Guest Customer"}
                      </span>
                      {notif.profiles?.email && (
                        <span className="text-xs text-muted-foreground">
                          {notif.profiles.email}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(notif.type)}</TableCell>
                  <TableCell>{getStatusBadge(notif.is_read)}</TableCell>
                  <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                    {formatDate(notif.created_at)}
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
                        <DropdownMenuItem onClick={() => onView(notif)}>
                          <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                          View Details
                        </DropdownMenuItem>
                        {notif.is_read ? (
                          <DropdownMenuItem onClick={() => onMarkUnread(notif)}>
                            <MailWarning className="mr-2 h-4 w-4 text-muted-foreground" />
                            Mark as Unread
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => onMarkRead(notif)}>
                            <CheckCheck className="mr-2 h-4 w-4 text-muted-foreground" />
                            Mark as Read
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => onDelete(notif)}
                          className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
