import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function MarketPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={cn("market-panel", className)}>{children}</section>;
}

export function MarketMetricCard({
  label,
  value,
  note,
  accent = "text-[#d1d4dc]",
}: {
  label: string;
  value: string;
  note?: string;
  accent?: string;
}) {
  return (
    <article className="market-panel px-4 py-4">
      <p className="text-[10px] uppercase leading-[15px] tracking-[0.8px] text-[#848e9c]">{label}</p>
      <p className={cn("mt-3 text-[24px] font-semibold leading-7 tracking-[-0.4px]", accent)}>{value}</p>
      {note ? <p className="mt-2 text-[11px] leading-[16px] text-[#848e9c]">{note}</p> : null}
    </article>
  );
}

export function MarketPageIntro({
  eyebrow,
  title,
  description,
  stats,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  stats: { label: string; value: string; note?: string; accent?: string }[];
  actions?: ReactNode;
}) {
  return (
    <MarketPanel className="overflow-hidden">
      <div className="relative px-6 py-6 sm:px-7 sm:py-7">
        <div aria-hidden="true" className="market-grid absolute inset-y-0 right-0 hidden w-[34%] opacity-70 lg:block" />

        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[820px]">
              <span className="inline-flex items-center rounded-[4px] border border-[rgba(51,102,255,0.18)] bg-[rgba(51,102,255,0.1)] px-3 py-1 text-[10px] uppercase leading-[15px] tracking-[0.8px] text-[#3366ff]">
                {eyebrow}
              </span>
              <h1 className="mt-4 text-[34px] font-semibold leading-[1.02] tracking-[-0.9px] text-[#d1d4dc] sm:text-[40px]">
                {title}
              </h1>
              <p className="mt-3 max-w-[760px] text-[14px] leading-6 text-[#848e9c]">{description}</p>
            </div>

            {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <MarketMetricCard
                key={stat.label}
                accent={stat.accent}
                label={stat.label}
                note={stat.note}
                value={stat.value}
              />
            ))}
          </div>
        </div>
      </div>
    </MarketPanel>
  );
}
