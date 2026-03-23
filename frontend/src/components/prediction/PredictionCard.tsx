"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { PredictionItem } from "@/types";

interface PredictionCardProps {
  prediction: PredictionItem;
  projectName: string;
}

const STATUS_STYLES = {
  active: "border-[rgba(51,102,255,0.2)] bg-[rgba(51,102,255,0.06)]",
  settled_hit: "border-[rgba(200,74,49,0.22)] bg-[rgba(200,74,49,0.08)]",
  settled_miss: "border-[rgba(18,97,196,0.22)] bg-[rgba(18,97,196,0.08)]",
  cancelled: "border-[#2b2f36] bg-[#1e2026]",
};

const POSITION_STYLES = {
  up: "border-[rgba(200,74,49,0.24)] bg-[rgba(200,74,49,0.12)] text-[#c84a31]",
  neutral: "border-[#2b2f36] bg-[rgba(43,47,54,0.42)] text-[#848e9c]",
  down: "border-[rgba(18,97,196,0.24)] bg-[rgba(18,97,196,0.12)] text-[#1261c4]",
};

export function PredictionCard({ prediction, projectName }: PredictionCardProps) {
  const t = useTranslations("market");
  const statusStyle =
    STATUS_STYLES[prediction.status as keyof typeof STATUS_STYLES] ||
    STATUS_STYLES.active;
  const positionStyle = POSITION_STYLES[prediction.position];

  return (
    <article className={cn("rounded-[4px] border bg-[#1e2026] p-5", statusStyle)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-lg font-semibold text-[#d1d4dc]">{projectName}</h4>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={cn("rounded-[4px] border px-3 py-1 text-sm font-semibold", positionStyle)}>
              {t(
                `position${prediction.position.charAt(0).toUpperCase() + prediction.position.slice(1)}` as never
              )}
            </span>
            <span className="rounded-[4px] border border-[#2b2f36] bg-[rgba(43,47,54,0.42)] px-3 py-1 text-sm text-[#848e9c]">
              {prediction.points_staked} {t("points")}
            </span>
          </div>
        </div>
        <span className="rounded-[4px] border border-[#2b2f36] bg-[rgba(43,47,54,0.42)] px-3 py-1 text-xs font-semibold text-[#848e9c]">
          {prediction.status === "active"
            ? t("active")
            : prediction.status === "settled_hit"
              ? t("hit")
              : prediction.status === "settled_miss"
                ? t("miss")
                : "—"}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-[4px] border border-[#2b2f36] bg-[rgba(24,28,33,0.72)] p-3">
          <p className="text-[10px] uppercase tracking-[0.8px] text-[#848e9c]">Base</p>
          <p className="mt-2 font-semibold text-[#d1d4dc]">{prediction.base_score.toFixed(1)}</p>
        </div>
        <div className="rounded-[4px] border border-[#2b2f36] bg-[rgba(24,28,33,0.72)] p-3">
          <p className="text-[10px] uppercase tracking-[0.8px] text-[#848e9c]">{t("maturity")}</p>
          <p className="mt-2 font-semibold text-[#d1d4dc]">{prediction.maturity_date}</p>
        </div>
        {prediction.final_score != null ? (
          <div className="rounded-[4px] border border-[#2b2f36] bg-[rgba(24,28,33,0.72)] p-3">
            <p className="text-[10px] uppercase tracking-[0.8px] text-[#848e9c]">Final</p>
            <p className="mt-2 font-semibold text-[#d1d4dc]">{prediction.final_score.toFixed(1)}</p>
          </div>
        ) : null}
        {prediction.score_change_pct != null ? (
          <div className="rounded-[4px] border border-[#2b2f36] bg-[rgba(24,28,33,0.72)] p-3">
            <p className="text-[10px] uppercase tracking-[0.8px] text-[#848e9c]">Delta</p>
            <p
              className={cn(
                "mt-2 font-semibold",
                prediction.score_change_pct > 0
                  ? "text-[#c84a31]"
                  : prediction.score_change_pct < 0
                    ? "text-[#1261c4]"
                    : "text-[#848e9c]"
              )}
            >
              {prediction.score_change_pct > 0 ? "+" : ""}
              {prediction.score_change_pct}%
            </p>
          </div>
        ) : null}
      </div>

      {prediction.points_earned != null ? (
        <div className="mt-4 rounded-[4px] border border-[#2b2f36] bg-[rgba(24,28,33,0.72)] p-4">
          <p className="text-[10px] uppercase tracking-[0.8px] text-[#848e9c]">{t("pointsEarned")}</p>
          <p
            className={cn(
              "mt-2 text-2xl font-semibold",
              prediction.points_earned > 0 ? "text-[#c84a31]" : "text-[#1261c4]"
            )}
          >
            {prediction.points_earned > 0 ? "+" : ""}
            {prediction.points_earned}
          </p>
        </div>
      ) : null}

      {prediction.reason ? (
        <p className="mt-4 rounded-[4px] border border-[#2b2f36] bg-[rgba(24,28,33,0.72)] p-4 text-sm leading-6 text-[#848e9c]">
          {prediction.reason}
        </p>
      ) : null}
    </article>
  );
}
