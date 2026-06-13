import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="p-6 space-y-6">
      {/* Back button and page header */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-24 rounded-lg" />
        <div className="space-y-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6 w-full animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[105px] w-full rounded-lg" />
        ))}
      </div>

      {/* Main Grid: Left Profile Card, Right Tab Details */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Profile Card Skeleton */}
        <Card className="lg:col-span-1 p-6 space-y-6 flex flex-col justify-between h-[360px] animate-pulse">
          <div className="flex flex-col items-center space-y-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="border-t border-border pt-4 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-5 w-full" />
          </div>
        </Card>

        {/* Right Details Tab Content Skeleton */}
        <div className="lg:col-span-3 space-y-6 animate-pulse">
          {/* Tabs header */}
          <div className="h-10 w-full max-w-md rounded-lg bg-muted flex p-1 gap-2">
            <Skeleton className="h-8 w-20 rounded" />
            <Skeleton className="h-8 w-24 rounded" />
            <Skeleton className="h-8 w-20 rounded" />
            <Skeleton className="h-8 w-20 rounded" />
            <Skeleton className="h-8 w-20 rounded" />
          </div>

          {/* Tab content area */}
          <Card className="p-6 border border-border bg-card shadow-2xs space-y-4 h-[240px]">
            <Skeleton className="h-5 w-48" />
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
