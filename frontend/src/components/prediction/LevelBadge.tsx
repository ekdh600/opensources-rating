"use client";

import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

interface LevelBadgeProps {
  level: number;
  titleKo: string;
  titleEn: string;
  size?: "sm" | "md" | "lg";
}

function getLevelColor(level: number): string {
  if (level >= 50) return "border-[rgba(240,185,11,0.24)] bg-[rgba(240,185,11,0.12)] text-[#f0b90b]";
  if (level >= 35) return "border-[rgba(51,102,255,0.24)] bg-[rgba(51,102,255,0.12)] text-[#3366ff]";
  if (level >= 20) return "border-[rgba(168,85,247,0.24)] bg-[rgba(168,85,247,0.12)] text-[#a855f7]";
  return "border-[#2b2f36] bg-[rgba(43,47,54,0.42)] text-[#848e9c]";
}

export function LevelBadge({
  level,
  titleKo,
  titleEn,
  size = "md",
}: LevelBadgeProps) {
  const locale = useLocale();
  const colorClass = getLevelColor(level);

  const sizeClass = {
    sm: "px-2.5 py-1 text-[10px]",
    md: "px-3 py-1.5 text-xs",
    lg: "px-4 py-2 text-sm",
  }[size];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-[4px] border font-medium",
        colorClass,
        sizeClass
      )}
    >
      <span className="font-figma-mono">LV.{level}</span>
      <span className="font-figma-body opacity-90">
        {locale === "ko" ? titleKo : titleEn}
      </span>
    </span>
  );
}
