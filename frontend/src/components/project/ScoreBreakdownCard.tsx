"use client";

import { useTranslations } from "next-intl";
import { Panel } from "@/components/ui/Panel";
import { ScoreBar } from "@/components/ui/ScoreBar";

interface ScoreBreakdownCardProps {
  attention: number;
  execution: number;
  health: number;
  trust: number;
  total: number;
}

export function ScoreBreakdownCard({
  attention,
  execution,
  health,
  trust,
  total,
}: ScoreBreakdownCardProps) {
  const t = useTranslations("score");

  return (
    <Panel tone="muted" className="h-full">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="overline">{t("total")}</p>
          <h3 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
            {total.toFixed(1)}
          </h3>
        </div>
        <div className="rounded-[1.75rem] border border-brand/20 bg-brand-soft px-4 py-3 text-right text-brand-strong">
          <p className="text-xs uppercase tracking-[0.16em]">Model</p>
          <p className="mt-1 text-sm font-semibold">v1.0</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <ScoreBar label={t("attention")} score={attention} tone="attention" />
        <ScoreBar label={t("execution")} score={execution} tone="execution" />
        <ScoreBar label={t("health")} score={health} tone="health" />
        <ScoreBar label={t("trust")} score={trust} tone="trust" />
      </div>

      <div className="mt-5 rounded-2xl border border-line/70 bg-white/70 p-4 text-sm text-muted">
        종합 점수 = 관심도 34% + 실행력 38% + 건강도 18% + 신뢰도 10%
      </div>
    </Panel>
  );
}
