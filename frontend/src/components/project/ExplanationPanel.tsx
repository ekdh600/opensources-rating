"use client";

import { useLocale, useTranslations } from "next-intl";
import { Panel } from "@/components/ui/Panel";
import type { ExplanationOut } from "@/types";

interface ExplanationPanelProps {
  explanation: ExplanationOut;
}

export function ExplanationPanel({ explanation }: ExplanationPanelProps) {
  const t = useTranslations("project");
  const locale = useLocale();

  const summary =
    locale === "ko" ? explanation.summary_ko : explanation.summary_en;

  return (
    <Panel tone="muted" className="h-full">
      <div className="mb-5">
        <p className="overline">{t("explanation")}</p>
        {summary ? (
          <p className="mt-3 text-sm leading-7 text-muted">{summary}</p>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-axis-execution/20 bg-axis-execution/10 p-4">
          <h4 className="text-sm font-semibold text-axis-execution">{t("strengths")}</h4>
          <div className="mt-3 space-y-2">
            {explanation.top_positive_factors?.map((factor) => (
              <div
                key={factor.factor}
                className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-2 text-sm"
              >
                <span className="text-ink">
                  {locale === "ko" ? factor.label_ko : factor.label_en}
                </span>
                <span className="font-semibold text-axis-execution">
                  {factor.score}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-state-danger/20 bg-state-danger/10 p-4">
          <h4 className="text-sm font-semibold text-state-danger">{t("weaknesses")}</h4>
          <div className="mt-3 space-y-2">
            {explanation.top_negative_factors?.map((factor) => (
              <div
                key={factor.factor}
                className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-2 text-sm"
              >
                <span className="text-ink">
                  {locale === "ko" ? factor.label_ko : factor.label_en}
                </span>
                <span className="font-semibold text-state-danger">
                  {factor.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {explanation.momentum_summary_ko ? (
        <div className="mt-4 rounded-2xl border border-brand/15 bg-brand-soft/70 p-4 text-sm text-brand-strong">
          {explanation.momentum_summary_ko}
        </div>
      ) : null}

      {explanation.anomaly_summary_ko ? (
        <div className="mt-3 rounded-2xl border border-state-warning/20 bg-state-warning/10 p-4 text-sm text-axis-trust">
          {explanation.anomaly_summary_ko}
        </div>
      ) : null}
    </Panel>
  );
}
