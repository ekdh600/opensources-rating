"use client";

import { cn, getRankBadgeColor } from "@/lib/utils";

interface RankBadgeProps {
  rank: number;
}

export function RankBadge({ rank }: RankBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-w-12 items-center justify-center rounded-pill px-3 py-1 text-sm font-semibold",
        getRankBadgeColor(rank)
      )}
    >
      #{rank}
    </span>
  );
}
