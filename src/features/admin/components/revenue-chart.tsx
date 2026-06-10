"use client";

import {
  Card,
} from "@/components/ui/card";

interface RevenuePoint {
  month: string;
  revenue: number;
}

interface Props {
  data: RevenuePoint[];
}

export function RevenueChart({
  data,
}: Props) {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="font-medium">
          Revenue Analytics
        </h3>

        <p className="text-sm text-muted-foreground">
          Monthly revenue overview
        </p>
      </div>

      {/* Recharts component here */}
    </Card>
  );
}