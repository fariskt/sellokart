import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RecentCustomerItem } from "../lib/types";

interface RecentCustomersTableProps {
  customers: RecentCustomerItem[];
}

export function RecentCustomersTable({ customers }: RecentCustomersTableProps) {
  function getInitials(name: string | null) {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  function formatDate(dateStr: string) {
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-2xs">
      <div className="p-4 border-b border-border/80 bg-muted/10">
        <h3 className="text-sm font-semibold text-foreground">Recent Customers</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Latest 10 registered accounts</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Avatar</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead className="text-right">Joined Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center text-xs text-muted-foreground">
                No recent customer accounts found.
              </TableCell>
            </TableRow>
          ) : (
            customers.map((c) => (
              <TableRow key={c.id} className="hover:bg-muted/10 transition-colors">
                <TableCell>
                  <Avatar className="size-8 rounded-lg border border-border shrink-0">
                    {c.avatar && <AvatarImage src={c.avatar} alt={c.name || "Customer"} className="rounded-lg" />}
                    <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold text-xs uppercase">
                      {getInitials(c.name)}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground text-xs">{c.name || "Guest Customer"}</span>
                    <span className="text-[10px] text-muted-foreground">{c.email || "-"}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right text-muted-foreground text-xs whitespace-nowrap">
                  {formatDate(c.created_at)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
