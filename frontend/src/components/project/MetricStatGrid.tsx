"use client";

import { useLocale, useTranslations } from "next-intl";
import { Panel } from "@/components/ui/Panel";
import { formatNumber } from "@/lib/utils";

interface MetricStatGridProps {
  stars?: number | null;
  forks?: number | null;
  contributors?: number | null;
  commits?: number | null;
  prsMerged?: number | null;
  issuesClosed?: number | null;
  releases?: number | null;
}

export function MetricStatGrid({
  stars,
  forks,
  contributors,
  commits,
  prsMerged,
  issuesClosed,
  releases,
}: MetricStatGridProps) {
  const t = useTranslations("project");
  const locale = useLocale();
  const numberLocale = locale === "ko" ? "ko-KR" : "en-US";

  const metrics = [
    { label: t("stars"), value: stars, suffix: null },
    { label: t("forks"), value: forks, suffix: null },
    { label: t("contributors"), value: contributors, suffix: "30d" },
    { label: t("commits"), value: commits, suffix: "30d" },
    { label: t("prsMerged"), value: prsMerged, suffix: "30d" },
    { label: t("issuesClosed"), value: issuesClosed, suffix: "30d" },
    { label: t("releases"), value: releases, suffix: "90d" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {metrics.map((metric) =>
        metric.value != null ? (
          <Panel key={metric.label} tone="muted" padding="sm" className="h-full">
            <p className="overline">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              {formatNumber(metric.value, numberLocale as "ko-KR" | "en-US")}
            </p>
            {metric.suffix ? (
              <p className="mt-1 text-xs text-muted">{metric.suffix}</p>
            ) : null}
          </Panel>
        ) : null
      )}
    </div>
  );
}
