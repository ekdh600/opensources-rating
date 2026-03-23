"use client";

import type { ReactNode } from "react";
import { Panel } from "@/components/ui/Panel";
import { cn } from "@/lib/utils";

interface PageHeaderStat {
  label: string;
  value: string;
  note?: string;
}

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  stats?: PageHeaderStat[];
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  stats,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <Panel
      tone="glass"
      padding="lg"
      className={cn("relative overflow-hidden", className)}
    >
      <div className="hero-mesh absolute inset-y-0 right-0 hidden w-[24rem] opacity-60 lg:block" />

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          {eyebrow ? <span className="kicker">{eyebrow}</span> : null}
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink md:text-5xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted md:text-base">
              {description}
            </p>
          ) : null}
        </div>

        {actions ? <div className="relative z-10">{actions}</div> : null}
      </div>

      {stats?.length ? (
        <div className="relative mt-8 grid gap-3 md:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={`${stat.label}-${stat.value}`}
              className="surface-dim rounded-2xl border border-white/70 px-4 py-3"
            >
              <p className="overline">{stat.label}</p>
              <p className="mt-2 text-xl font-semibold tracking-tight text-ink">
                {stat.value}
              </p>
              {stat.note ? (
                <p className="mt-1 text-xs leading-5 text-muted">{stat.note}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </Panel>
  );
}
