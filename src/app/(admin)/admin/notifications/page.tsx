import { NotificationsPageClient } from "@/features/notifications/components/NotificationsPageClient";
import { getNotificationsPaginated } from "@/features/notifications/lib/notifications.action";

interface NotificationsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    type?: string;
    status?: string;
    dateRange?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function NotificationsPage({ searchParams }: NotificationsPageProps) {
  const params = await searchParams;

  const notificationsData = await getNotificationsPaginated({
    page: Number(params.page ?? 1),
    limit: 10,
    search: params.search,
    type: params.type,
    status: params.status,
    dateRange: params.dateRange,
    startDate: params.startDate,
    endDate: params.endDate,
  });

  return (
    <div className="p-6">
      <NotificationsPageClient initialData={notificationsData} />
    </div>
  );
}
