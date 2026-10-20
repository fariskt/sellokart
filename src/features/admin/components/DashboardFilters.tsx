"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { AppSelect } from "@/components/AppSelect";

const rangeOptions = [
  { label: "Today", value: "today" },
  { label: "Last 7 Days", value: "7days" },
  { label: "Last 30 Days", value: "30days" },
  { label: "Last 12 Months", value: "12months" },
  { label: "Custom Range", value: "custom" },
];

export function DashboardFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const range = searchParams.get("range") ?? "30days";
  const startDate = searchParams.get("startDate") ?? "";
  const endDate = searchParams.get("endDate") ?? "";

  function updateParams(newParams: Record<string, string | null>) {
    const params = new URLSearchParams(window.location.search);

    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === "") {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });

    router.push(`?${params.toString()}`);
  }

  return (
    <div className="space-y-4">

      {/* Custom Date Picker (rendered conditionally) */}
      <AppSelect
        key={`range-${range}`}
        name="range"
        value={range}
        onValueChange={(val) => {
          if (val !== "custom") {
            updateParams({ range: val, startDate: null, endDate: null });
          } else {
            updateParams({ range: val });
          }
        }}
        options={rangeOptions}
        placeholder="Select Range"
      />
      {range === "custom" && (
        <div className="flex flex-wrap items-end gap-3 bg-muted/30 p-4 rounded-lg border border-dashed border-border/80">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Start Date
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => updateParams({ startDate: e.target.value })}
              className="h-10 w-44 bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              End Date
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => updateParams({ endDate: e.target.value })}
              className="h-10 w-44 bg-background"
            />
          </div>
        </div>
      )}
    </div>
  );
}
