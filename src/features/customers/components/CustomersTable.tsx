"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, User, ShoppingBag } from "lucide-react";
import { CustomerListItem } from "../lib/types";

interface CustomersTableProps {
  customers: CustomerListItem[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function CustomersTable({ customers }: CustomersTableProps) {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Customer Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead className="text-center">Total Orders</TableHead>
            <TableHead className="text-right">Total Spend</TableHead>
            <TableHead>Last Order Date</TableHead>
            <TableHead>Joined Date</TableHead>
            <TableHead className="w-14" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                <div className="flex flex-col items-center justify-center space-y-1 py-8">
                  <span className="text-base font-semibold">No customers found</span>
                  <span className="text-sm text-muted-foreground">
                    Try adjusting your filters or search query.
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer) => {
              const name = customer.name || "Guest Customer";
              const initials = name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() || "?";

              return (
                <TableRow key={customer.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="py-2">
                    <Avatar className="h-8 w-8 border border-border">
                      {customer.avatar && <AvatarImage src={customer.avatar} alt={name} />}
                      <AvatarFallback className="bg-secondary/40 text-[10px] font-bold text-secondary-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-semibold text-foreground">
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="hover:text-primary transition-colors hover:underline"
                    >
                      {name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{customer.email || "-"}</TableCell>
                  <TableCell className="text-muted-foreground">{customer.phone || "-"}</TableCell>
                  <TableCell className="text-center font-semibold text-foreground">
                    {customer.calculated?.total_orders ?? 0}
                  </TableCell>
                  <TableCell className="text-right font-bold text-foreground">
                    {formatCurrency(customer.calculated?.total_spend ?? 0)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(customer.calculated?.last_order_date ?? null)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(customer.created_at)}</TableCell>
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
                        <DropdownMenuItem onClick={() => router.push(`/admin/customers/${customer.id}`)}>
                          <User className="mr-2 h-4 w-4 text-muted-foreground" />
                          View Customer
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            if (customer.email) {
                              router.push(`/admin/orders?search=${encodeURIComponent(customer.email)}`);
                            } else {
                              router.push(`/admin/orders?search=${encodeURIComponent(name)}`);
                            }
                          }}
                        >
                          <ShoppingBag className="mr-2 h-4 w-4 text-muted-foreground" />
                          View Orders
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
