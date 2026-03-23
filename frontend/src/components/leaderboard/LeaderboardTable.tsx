"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { RankBadge } from "@/components/ui/RankBadge";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import {
  getFoundationLabel,
  getLanguageColor,
  getStageTone,
} from "@/lib/utils";
import type { LeaderboardEntry } from "@/types";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  const t = useTranslations("score");
  const locale = useLocale();

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:hidden">
        {entries.map((entry) => (
          <Link
            key={entry.project.slug}
            href={`/projects/${entry.project.slug}`}
            className="panel-muted block p-5 transition hover:-translate-y-0.5 hover:border-brand/20"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <RankBadge rank={entry.rank} />
                <h3 className="mt-3 text-lg font-semibold text-ink">
                  {locale === "ko"
                    ? entry.project.display_name_ko
                    : entry.project.display_name_en}
                </h3>
                <p className="mt-1 text-sm text-muted">
                  {entry.project.short_description_ko}
                </p>
              </div>
              <ScoreBadge score={entry.total_score} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-pill border border-line bg-white/70 px-2.5 py-1 text-muted">
                {getFoundationLabel(entry.project.foundation_type)}
              </span>
              {entry.project.primary_language ? (
                <span className="inline-flex items-center gap-1 rounded-pill border border-line bg-white/70 px-2.5 py-1 text-muted">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: getLanguageColor(entry.project.primary_language),
                    }}
                  />
                  {entry.project.primary_language}
                </span>
              ) : null}
              {entry.project.cncf_stage ? (
                <span
                  className={`rounded-pill px-2.5 py-1 ${getStageTone(
                    entry.project.cncf_stage
                  )}`}
                >
                  CNCF {entry.project.cncf_stage}
                </span>
              ) : null}
            </div>
          </Link>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[920px]">
          <thead>
            <tr className="border-b border-line/80 text-left text-xs uppercase tracking-[0.16em] text-muted">
              <th className="px-5 py-4 font-semibold">Rank</th>
              <th className="px-5 py-4 font-semibold">Project</th>
              <th className="px-5 py-4 text-center font-semibold">{t("total")}</th>
              <th className="px-5 py-4 text-center font-semibold">{t("attention")}</th>
              <th className="px-5 py-4 text-center font-semibold">{t("execution")}</th>
              <th className="px-5 py-4 text-center font-semibold">{t("health")}</th>
              <th className="px-5 py-4 text-center font-semibold">{t("trust")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/70">
            {entries.map((entry) => (
              <tr key={entry.project.slug} className="transition hover:bg-white/45">
                <td className="px-5 py-4 align-top">
                  <div className="space-y-2">
                    <RankBadge rank={entry.rank} />
                    {entry.rank_change ? (
                      <p
                        className={`text-xs font-medium ${
                          entry.rank_change > 0 ? "text-state-success" : "text-state-danger"
                        }`}
                      >
                        {entry.rank_change > 0 ? "+" : ""}
                        {entry.rank_change}
                      </p>
                    ) : (
                      <p className="text-xs text-muted">0</p>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <Link href={`/projects/${entry.project.slug}`} className="group block">
                    <p className="text-base font-semibold text-ink group-hover:text-brand-strong">
                      {locale === "ko"
                        ? entry.project.display_name_ko
                        : entry.project.display_name_en}
                    </p>
                    <p className="mt-1 max-w-xl text-sm text-muted">
                      {entry.project.short_description_ko}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-pill border border-line bg-white/75 px-2.5 py-1 text-muted">
                        {getFoundationLabel(entry.project.foundation_type)}
                      </span>
                      {entry.project.primary_language ? (
                        <span className="inline-flex items-center gap-1 rounded-pill border border-line bg-white/75 px-2.5 py-1 text-muted">
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full"
                            style={{
                              backgroundColor: getLanguageColor(
                                entry.project.primary_language
                              ),
                            }}
                          />
                          {entry.project.primary_language}
                        </span>
                      ) : null}
                      {entry.project.cncf_stage ? (
                        <span
                          className={`rounded-pill px-2.5 py-1 ${getStageTone(
                            entry.project.cncf_stage
                          )}`}
                        >
                          CNCF {entry.project.cncf_stage}
                        </span>
                      ) : null}
                    </div>
                  </Link>
                </td>
                <td className="px-5 py-4 text-center">
                  <ScoreBadge score={entry.total_score} size="lg" />
                </td>
                <td className="px-5 py-4 text-center text-sm font-semibold text-axis-attention">
                  {entry.attention_score.toFixed(1)}
                </td>
                <td className="px-5 py-4 text-center text-sm font-semibold text-axis-execution">
                  {entry.execution_score.toFixed(1)}
                </td>
                <td className="px-5 py-4 text-center text-sm font-semibold text-axis-health">
                  {entry.health_score.toFixed(1)}
                </td>
                <td className="px-5 py-4 text-center text-sm font-semibold text-axis-trust">
                  {entry.trust_score.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
