"use client";

import { cn, formatScore, getScoreBgColor } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export function ScoreBadge({ score, label, size = "md" }: ScoreBadgeProps) {
  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-pill font-semibold",
        getScoreBgColor(score),
        sizeClasses[size]
      )}
    >
      <span className="h-2 w-2 rounded-full bg-current opacity-70" />
      {label ? <span className="font-normal opacity-80">{label}</span> : null}
      {formatScore(score)}
    </span>
  );
}
