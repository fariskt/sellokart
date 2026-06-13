export type NotificationType =
  | "order"
  | "payment"
  | "shipment"
  | "return"
  | "coupon"
  | "system";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  action_url: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  // Relations
  profiles?: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
}

export interface NotificationStats {
  total: number;
  read: number;
  unread: number;
  today: number;
}

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
  dateRange?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateNotificationInput {
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  action_url?: string | null;
}

export interface BulkNotificationInput {
  recipient: "all" | "selected";
  user_ids?: string[];
  title: string;
  message: string;
  type: NotificationType;
  action_url?: string | null;
}
