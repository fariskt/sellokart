import { getAllInventoryLogs } from "@/features/inventory/lib/inventory.action";
import { InventoryLogsClient } from "@/features/inventory/components/InventoryLogsClient";
import { Title } from "@/components/ui/title";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Audit Logs | Inventory | Admin",
  description: "Full audit trail of all stock changes across the store.",
};

interface LogsPageProps {
  searchParams: Promise<{
    page?: string;
    type?: string;
  }>;
}

export default async function InventoryLogsPage({ searchParams }: LogsPageProps) {
  const params = await searchParams;

  const { data: logs, pagination } = await getAllInventoryLogs({
    page: Number(params.page ?? 1),
    limit: 20,
    type: params.type,
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Title>Audit Logs</Title>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete stock change history across all products and variants.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="gap-2 shrink-0">
          <Link href="/admin/inventory">
            <ArrowLeft className="h-4 w-4" />
            Back to Inventory
          </Link>
        </Button>
      </div>

      <InventoryLogsClient
        logs={logs}
        pagination={pagination}
        currentType={params.type ?? "all"}
      />
    </div>
  );
}
