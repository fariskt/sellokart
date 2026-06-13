"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewRatingStarsProps {
  rating: number;
  className?: string;
  starClassName?: string;
}

export function ReviewRatingStars({
  rating,
  className,
  starClassName,
}: ReviewRatingStarsProps) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={cn(
            "w-3.5 h-3.5",
            i < rating ? "text-amber-500 fill-amber-500" : "text-muted-foreground/30",
            starClassName
          )}
        />
      ))}
    </div>
  );
}
