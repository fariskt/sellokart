"use client";

import { RatingDistribution, ReviewStats } from "../lib/types";
import { ReviewRatingStars } from "./ReviewRatingStars";

interface RatingDistributionChartProps {
  distribution: RatingDistribution[];
  stats: ReviewStats;
}

export function RatingDistributionChart({
  distribution,
  stats,
}: RatingDistributionChartProps) {
  // Sort distribution descending by rating (5 to 1) just in case
  const sortedDist = [...distribution].sort((a, b) => b.rating - a.rating);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-card border border-border p-5 rounded-lg shadow-2xs">
      {/* Average Rating Summary */}
      <div className="flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-border">
        <span className="text-5xl font-extrabold text-foreground tracking-tight">
          {stats.averageRating.toFixed(1)}
        </span>
        <div className="mt-2">
          <ReviewRatingStars rating={Math.round(stats.averageRating)} starClassName="w-5 h-5" />
        </div>
        <p className="mt-2 text-xs font-medium text-muted-foreground">
          Based on {stats.total} {stats.total === 1 ? "review" : "reviews"}
        </p>
      </div>

      {/* Distribution Bars */}
      <div className="col-span-2 space-y-2.5 flex flex-col justify-center">
        {sortedDist.map((item) => (
          <div key={item.rating} className="flex items-center text-sm font-medium">
            {/* Star label */}
            <span className="w-12 text-xs text-muted-foreground font-semibold flex items-center justify-end gap-1">
              {item.rating} ★
            </span>

            {/* Bar container */}
            <div className="flex-1 mx-3 bg-muted h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${item.percentage}%` }}
              />
            </div>

            {/* Percentages and counts */}
            <span className="w-12 text-xs text-muted-foreground font-bold text-left">
              {item.percentage}%
            </span>
            <span className="text-[10px] text-muted-foreground/60 w-8 text-right font-medium">
              ({item.count})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
