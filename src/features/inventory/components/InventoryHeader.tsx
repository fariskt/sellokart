import Link from "next/link";
import { Title } from "@/components/ui/title";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ClipboardList } from "lucide-react";

export function InventoryHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Title>Inventory</Title>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor stock levels, track changes, and manage manual adjustments.
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        <Button asChild variant="outline" size="sm" className="gap-2">
          <Link href="/admin/inventory/adjustments">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Stock Alerts
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="gap-2">
          <Link href="/admin/inventory/logs">
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
            Audit Logs
          </Link>
        </Button>
      </div>
    </div>
  );
}
