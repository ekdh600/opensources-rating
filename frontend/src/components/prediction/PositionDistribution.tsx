"use client";

import { useTranslations } from "next-intl";
import { Panel } from "@/components/ui/Panel";
import { formatPercent } from "@/lib/utils";

interface PositionDistributionProps {
  upRatio: number;
  neutralRatio: number;
  downRatio: number;
  weightedUp?: number;
  weightedNeutral?: number;
  weightedDown?: number;
  totalPredictions: number;
}

export function PositionDistribution({
  upRatio,
  neutralRatio,
  downRatio,
  weightedUp,
  weightedNeutral,
  weightedDown,
  totalPredictions,
}: PositionDistributionProps) {
  const t = useTranslations("market");

  return (
    <Panel tone="muted" className="h-full">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="overline">{t("positionDistribution")}</p>
          <p className="mt-2 text-sm text-muted">{totalPredictions}명 참여</p>
        </div>
      </div>

      <div className="mt-5 flex h-4 overflow-hidden rounded-pill bg-line/40">
        <div className="bg-state-success" style={{ width: `${upRatio * 100}%` }} />
        <div className="bg-line" style={{ width: `${neutralRatio * 100}%` }} />
        <div className="bg-state-danger" style={{ width: `${downRatio * 100}%` }} />
      </div>

      <div className="mt-5 space-y-3 text-sm">
        <div className="flex items-center justify-between rounded-2xl border border-line/70 bg-white/70 px-3 py-2">
          <span className="text-state-success">{t("positionUp")}</span>
          <span className="font-semibold text-state-success">{formatPercent(upRatio)}</span>
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-line/70 bg-white/70 px-3 py-2">
          <span className="text-muted">{t("positionNeutral")}</span>
          <span className="font-semibold text-muted">{formatPercent(neutralRatio)}</span>
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-line/70 bg-white/70 px-3 py-2">
          <span className="text-state-danger">{t("positionDown")}</span>
          <span className="font-semibold text-state-danger">{formatPercent(downRatio)}</span>
        </div>
      </div>

      {weightedUp !== undefined && weightedNeutral !== undefined && weightedDown !== undefined ? (
        <div className="mt-5 rounded-2xl border border-brand/15 bg-brand-soft/60 p-4 text-sm">
          <p className="overline">{t("weightedExpect")}</p>
          <div className="mt-3 flex flex-wrap gap-4">
            <span className="font-semibold text-state-success">
              {t("positionUp")} {formatPercent(weightedUp)}
            </span>
            <span className="font-semibold text-muted">
              {t("positionNeutral")} {formatPercent(weightedNeutral)}
            </span>
            <span className="font-semibold text-state-danger">
              {t("positionDown")} {formatPercent(weightedDown)}
            </span>
          </div>
        </div>
      ) : null}
    </Panel>
  );
}
