"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PanelProps {
  children: ReactNode;
  className?: string;
  tone?: "default" | "muted" | "glass" | "brand";
  padding?: "sm" | "md" | "lg";
}

const toneClasses = {
  default: "panel",
  muted: "panel-muted",
  glass: "panel-glass",
  brand:
    "rounded-panel border border-brand/15 bg-brand-strong text-white shadow-glow",
} as const;

const paddingClasses = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
} as const;

export function Panel({
  children,
  className,
  tone = "default",
  padding = "md",
}: PanelProps) {
  return (
    <div className={cn(toneClasses[tone], paddingClasses[padding], className)}>
      {children}
    </div>
  );
}
