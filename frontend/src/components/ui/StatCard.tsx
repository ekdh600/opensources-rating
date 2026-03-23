"use client";

import { Panel } from "@/components/ui/Panel";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
}

export function StatCard({ label, value, sub, icon }: StatCardProps) {
  return (
    <Panel tone="muted" className="h-full">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="overline">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">
            {value}
          </p>
          {sub ? <p className="mt-2 text-sm text-muted">{sub}</p> : null}
        </div>
        {icon ? (
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft text-brand-strong">
            {icon}
          </div>
        ) : null}
      </div>
    </Panel>
  );
}
