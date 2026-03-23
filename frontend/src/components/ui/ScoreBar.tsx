"use client";

import { cn, getAxisClasses, type AxisKey } from "@/lib/utils";

interface ScoreBarProps {
  label: string;
  score: number;
  maxScore?: number;
  color?: string;
  tone?: AxisKey;
}

export function ScoreBar({
  label,
  score,
  maxScore = 100,
  color = "bg-brand",
  tone,
}: ScoreBarProps) {
  const pct = Math.min((score / maxScore) * 100, 100);
  const axis = tone ?? (label.toLowerCase() as AxisKey);
  const axisClasses =
    axis === "attention" ||
    axis === "execution" ||
    axis === "health" ||
    axis === "trust"
      ? getAxisClasses(axis)
      : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-ink">{label}</span>
        <span className={cn("font-semibold", axisClasses?.text)}>
          {score.toFixed(1)}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-pill bg-line/45">
        <div
          className={cn(
            "h-full rounded-pill transition-all duration-500",
            axisClasses?.bar ?? color
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
