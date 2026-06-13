export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  table_name: string;
  record_id: string;
  entity_name: string | null;
  metadata: any;
  ip_address: string | null;
  created_at: string;
  profiles?: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
}

export interface AuditLogStats {
  total: number;
  today: number;
  productLogs: number;
  orderLogs: number;
  securityLogs: number;
}

export interface GetAuditLogsParams {
  page?: number;
  limit?: number;
  search?: string;
  tableName?: string;
  userId?: string;
  dateRange?: string;
  startDate?: string;
  endDate?: string;
}
