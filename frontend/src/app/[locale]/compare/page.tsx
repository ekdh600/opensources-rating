"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { ComparisonRadarCard } from "@/components/comparison/ComparisonRadarCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import {
  getComparisonItems,
  getProjectModel,
  pickText,
  projectCatalog,
} from "@/lib/mock-data";
import { formatNumber } from "@/lib/utils";
import type { ComparisonItem } from "@/types";

function normalizeSlugsFromQuery(raw: string | null): string[] {
  if (!raw) return ["cilium", "istio"];
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean)
    )
  ).slice(0, 3);
}

export default function ComparePage() {
  const t = useTranslations("compare");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialSlugs = useMemo(
    () => normalizeSlugsFromQuery(searchParams.get("projects")),
    [searchParams]
  );
  const [activeSlugs, setActiveSlugs] = useState<string[]>(initialSlugs);

  useEffect(() => {
    setActiveSlugs(initialSlugs);
  }, [initialSlugs]);

  const updateUrl = (slugs: string[]) => {
    router.replace(`${pathname}?projects=${encodeURIComponent(slugs.join(","))}`);
  };

  const updateSlot = (index: number, slug: string) => {
    setActiveSlugs((prev) => {
      const next = [...prev];
      next[index] = slug;
      const deduped = Array.from(new Set(next)).slice(0, 3);
      updateUrl(deduped);
      return deduped;
    });
  };

  const addSlot = () => {
    setActiveSlugs((prev) => {
      if (prev.length >= 3) return prev;
      const used = new Set(prev);
      const nextSlug = projectCatalog.find((project) => !used.has(project.slug))?.slug;
      if (!nextSlug) return prev;
      const next = [...prev, nextSlug];
      updateUrl(next);
      return next;
    });
  };

  const removeSlot = (index: number) => {
    setActiveSlugs((prev) => {
      if (prev.length <= 2) return prev;
      const next = prev.filter((_, slot) => slot !== index);
      updateUrl(next);
      return next;
    });
  };

  const items = getComparisonItems(activeSlugs);
  const metricRows: { label: string; key: keyof ComparisonItem }[] = [
    { label: "Stars", key: "stars_total" },
    { label: "Forks", key: "forks_total" },
    { label: "Contributors (30d)", key: "contributors_30d" },
    { label: "Commits (30d)", key: "commits_30d" },
    { label: "Merged PRs (30d)", key: "prs_merged_30d" },
    { label: "Closed issues (30d)", key: "issues_closed_30d" },
  ];

  return (
    <div className="page-shell space-y-8 py-8">
      <PageHeader
        eyebrow="Project compare"
        title={t("title")}
        description="선택한 프로젝트의 점수 축, 운영 신호, 커뮤니티 기대치를 한 화면에서 비교합니다."
        stats={[
          { label: "Selection", value: `${activeSlugs.length} projects` },
          { label: "Axes", value: "4", note: "Attention · Execution · Health · Trust" },
          { label: "Window", value: "30d", note: "Recent trend comparison" },
        ]}
      />

      <Panel tone="muted">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="overline">{t("selectProjects")}</p>
            <p className="mt-2 text-sm text-muted">
              주소의 `projects` 쿼리와 선택 상태가 함께 동기화됩니다.
            </p>
          </div>
          <button
            type="button"
            onClick={addSlot}
            disabled={activeSlugs.length >= 3}
            className="rounded-pill border border-line bg-white/80 px-4 py-2 text-sm font-medium text-ink transition hover:border-brand/20 hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-50"
          >
            세 번째 프로젝트 추가
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {activeSlugs.map((slug, index) => (
            <div key={`${slug}-${index}`} className="flex gap-2">
              <select
                value={slug}
                onChange={(event) => updateSlot(index, event.target.value)}
                className="w-full rounded-2xl border border-line bg-white/80 px-4 py-3 text-sm text-ink shadow-soft outline-none"
              >
                {projectCatalog.map((project) => (
                  <option key={project.slug} value={project.slug}>
                    {project.display_name_ko} ({project.slug})
                  </option>
                ))}
              </select>
              {activeSlugs.length > 2 ? (
                <button
                  type="button"
                  onClick={() => removeSlot(index)}
                  className="rounded-2xl border border-line bg-white/80 px-3 py-3 text-sm text-muted transition hover:border-state-danger/20 hover:text-state-danger"
                >
                  제거
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </Panel>

      {items.length < 2 ? (
        <EmptyState
          title="비교 대상이 부족합니다"
          description="최소 두 개 프로젝트를 선택하면 비교 레이아웃이 활성화됩니다."
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => {
              const project = getProjectModel(item.project.slug);
              return (
                <Panel key={item.project.slug} tone="muted">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-ink">
                        {locale === "ko"
                          ? item.project.display_name_ko
                          : item.project.display_name_en}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {pickText(locale, project.description)}
                      </p>
                    </div>
                    {item.latest_score ? (
                      <ScoreBadge score={item.latest_score.total_score} size="lg" />
                    ) : null}
                  </div>
                </Panel>
              );
            })}
          </div>

          <ComparisonRadarCard items={items} />

          <Panel tone="muted" className="overflow-hidden">
            <h3 className="text-xl font-semibold tracking-tight text-ink">
              {t("metricCompare")}
            </h3>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="border-b border-line/80 text-left text-xs uppercase tracking-[0.16em] text-muted">
                    <th className="px-4 py-3 font-semibold">Metric</th>
                    {items.map((item) => (
                      <th key={item.project.slug} className="px-4 py-3 text-right font-semibold">
                        {item.project.display_name_ko}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/70">
                  {metricRows.map((row) => (
                    <tr key={row.key}>
                      <td className="px-4 py-3 text-sm font-medium text-ink">{row.label}</td>
                      {items.map((item) => {
                        const value = item[row.key];
                        return (
                          <td key={`${item.project.slug}-${row.key}`} className="px-4 py-3 text-right text-sm font-semibold text-ink">
                            {typeof value === "number"
                              ? formatNumber(value, locale === "ko" ? "ko-KR" : "en-US")
                              : "—"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}
