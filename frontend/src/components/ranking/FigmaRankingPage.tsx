"use client";

import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { categorySummaries, cncfLeaderboard, globalLeaderboard } from "@/lib/mock-data";
import { formatScore, getFoundationLabel, getLanguageColor, getStageTone } from "@/lib/utils";

const COPY = {
  ko: {
    title: "전체 순위",
    subtitle: "종합 점수와 축별 신호를 기준으로 오픈소스 프로젝트를 정렬한 메인 리더보드입니다.",
    filtersTitle: "필터",
    filtersSubtitle: "카테고리, 재단, 언어, 정렬 기준을 빠르게 훑어볼 수 있습니다.",
    sections: {
      all: "전체 리더보드",
      insight: "랭킹 인사이트",
      insightSub: "현재 상위권에 공통으로 나타나는 신호를 요약합니다.",
      momentum: "카테고리 스냅샷",
      momentumSub: "각 카테고리의 대표 축과 추적 개수",
    },
    filters: {
      category: "전체 카테고리",
      foundation: "전체 재단",
      language: "전체 언어",
      sort: "종합 점수순",
    },
    options: {
      kubernetes: "쿠버네티스",
      observability: "관측성",
      networking: "네트워킹/CNI",
      cncf: "CNCF",
      independent: "독립 프로젝트",
      go: "Go",
      typescript: "TypeScript",
      python: "Python",
      total: "종합 점수순",
      attention: "관심도순",
      execution: "실행력순",
    },
    labels: {
      project: "프로젝트",
      foundation: "재단",
      language: "언어",
      score: "SCORE",
      tracked: "추적 프로젝트",
      cncf: "CNCF 포함",
      updated: "업데이트",
      focus: "상위권 특징",
      spread: "점수 분포",
      categoryCount: "카테고리 수",
      categoryProjects: "개 프로젝트",
    },
    insights: [
      {
        title: "실행력 중심 상위권",
        body: "상위권 프로젝트는 커밋 빈도와 릴리즈 cadence가 꾸준해 실행력 점수가 안정적으로 높습니다.",
      },
      {
        title: "CNCF 비중 확대",
        body: "상위 10위 중 다수가 CNCF 생태계에 속하며, 재단 프로젝트의 건강도와 신뢰도 지표가 강하게 반영됩니다.",
      },
      {
        title: "관심도와 건강도의 균형",
        body: "단순 스타 수보다 응답성, 병합 속도, 문서 품질 같은 유지보수 신호가 순위 차이를 만듭니다.",
      },
    ],
  },
  en: {
    title: "Leaderboard",
    subtitle: "The main ranking board orders open source projects by composite score and axis-level signals.",
    filtersTitle: "Filters",
    filtersSubtitle: "Quickly scan by category, foundation, language, and sort direction.",
    sections: {
      all: "All leaderboard",
      insight: "Ranking insights",
      insightSub: "Shared patterns found across the current top tier.",
      momentum: "Category snapshot",
      momentumSub: "Dominant axes and tracked volume by category.",
    },
    filters: {
      category: "All categories",
      foundation: "All foundations",
      language: "All languages",
      sort: "Sort by total score",
    },
    options: {
      kubernetes: "Kubernetes",
      observability: "Observability",
      networking: "Networking/CNI",
      cncf: "CNCF",
      independent: "Independent",
      go: "Go",
      typescript: "TypeScript",
      python: "Python",
      total: "Sort by total score",
      attention: "Sort by attention",
      execution: "Sort by execution",
    },
    labels: {
      project: "Project",
      foundation: "Foundation",
      language: "Language",
      score: "SCORE",
      tracked: "Tracked projects",
      cncf: "CNCF included",
      updated: "Updated",
      focus: "Top-tier pattern",
      spread: "Score spread",
      categoryCount: "Categories",
      categoryProjects: "projects",
    },
    insights: [
      {
        title: "Execution-led top tier",
        body: "The highest-ranked projects keep strong execution through steady commits and disciplined release cadence.",
      },
      {
        title: "CNCF weight stays high",
        body: "A large share of the top 10 belongs to the CNCF ecosystem, where health and trust signals stay resilient.",
      },
      {
        title: "Attention must be supported",
        body: "Stars alone do not sustain rank. Responsiveness, merge speed, and documentation quality separate peers.",
      },
    ],
  },
} as const;

function TrendArrow({
  trend,
  size = 12,
}: {
  trend?: "up" | "down";
  size?: number;
}) {
  if (!trend) {
    return <span aria-hidden="true" className="inline-block" style={{ height: size, width: size }} />;
  }

  const color = trend === "up" ? "#87af87" : "#d77979";
  const rotation = trend === "up" ? "" : "rotate(180 8 8)";

  return (
    <svg aria-hidden="true" height={size} viewBox="0 0 16 16" width={size} xmlns="http://www.w3.org/2000/svg">
      <path d="M8 3L12 8H9.5V13H6.5V8H4L8 3Z" fill={color} transform={rotation} />
    </svg>
  );
}

function ScorePill({ score }: { score: number }) {
  const tone =
    score >= 80
      ? "bg-[#b4d59d] text-[#0a0e17] shadow-[0_0_10px_rgba(135,175,135,0.3)]"
      : "bg-[#f0ca69] text-[#0a0e17] shadow-[0_0_10px_rgba(215,175,95,0.3)]";

  return (
    <span
      className={`font-figma-mono inline-flex h-6 min-w-10 items-center justify-center rounded-[4px] px-2 text-[12px] font-bold leading-4 ${tone}`}
    >
      {Math.round(score)}
    </span>
  );
}

function FilterSelect({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-figma-mono text-[10px] leading-[15px] tracking-[1px] text-[#64748b] uppercase">{label}</span>
      <select className="h-11 rounded-[4px] border border-[#2d3548] bg-[#12161f] px-4 font-figma-body text-[13px] text-[#cbd5e1] outline-none transition focus:border-[#6b9bd1]">
        {children}
      </select>
    </label>
  );
}

function AxisValue({
  value,
  color,
}: {
  value: number;
  color: string;
}) {
  return (
    <span className="font-figma-mono text-[14px] font-bold leading-5" style={{ color }}>
      {formatScore(value)}
    </span>
  );
}

function LanguageChip({ language }: { language: string | null }) {
  if (!language) {
    return <span className="font-figma-mono text-[12px] leading-4 text-[#475569]">-</span>;
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-[4px] border border-[#2d3548] bg-[#1a1f2e] px-[8px] py-[3px]">
      <span
        aria-hidden="true"
        className="inline-block h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: getLanguageColor(language) }}
      />
      <span className="font-figma-mono text-[10px] leading-[15px] tracking-[0.5px] text-[#94a3b8] uppercase">
        {language}
      </span>
    </span>
  );
}

function FoundationChip({
  foundation,
  cncfStage,
}: {
  foundation: string | null;
  cncfStage: string | null;
}) {
  if (cncfStage) {
    return (
      <span className={`rounded-[4px] px-[8px] py-[3px] text-[10px] leading-[15px] tracking-[0.5px] uppercase ${getStageTone(cncfStage)}`}>
        CNCF {cncfStage}
      </span>
    );
  }

  return (
    <span className="font-figma-mono inline-flex rounded-[4px] border border-[#2d3548] bg-[#1a1f2e] px-[8px] py-[3px] text-[10px] leading-[15px] tracking-[0.5px] text-[#94a3b8] uppercase">
      {getFoundationLabel(foundation)}
    </span>
  );
}

export function FigmaRankingPage() {
  const locale = useLocale();
  const copy = COPY[locale === "ko" ? "ko" : "en"];
  const topProject = globalLeaderboard[0];
  const cncfCount = globalLeaderboard.filter((entry) => entry.project.foundation_type === "cncf").length;
  const averageScore =
    globalLeaderboard.reduce((sum, entry) => sum + entry.total_score, 0) / globalLeaderboard.length;

  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 oss-frame">
      <section className="border-b border-[#2d3548] bg-[#12161f]">
        <div className="mx-auto max-w-[1440px] px-4 py-6 md:px-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-px w-8 bg-[#6b9bd1]" />
                <h1 className="font-figma-display text-[32px] leading-[35.2px] tracking-[-0.64px] text-[#6b9bd1]">
                  {copy.title}
                </h1>
              </div>
              <p className="font-figma-body mt-[6px] max-w-[720px] text-[12px] leading-[19.5px] text-[#64748b]">
                {copy.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="oss-panel min-w-[132px] px-4 py-3">
                <p className="font-figma-mono text-[10px] leading-[15px] tracking-[1px] text-[#64748b] uppercase">
                  {copy.labels.tracked}
                </p>
                <p className="font-figma-display mt-2 text-[26px] leading-[26px] tracking-[-0.64px] text-[#e2e8f0]">
                  {globalLeaderboard.length}
                </p>
              </div>
              <div className="oss-panel min-w-[132px] px-4 py-3">
                <p className="font-figma-mono text-[10px] leading-[15px] tracking-[1px] text-[#64748b] uppercase">
                  {copy.labels.cncf}
                </p>
                <p className="font-figma-display mt-2 text-[26px] leading-[26px] tracking-[-0.64px] text-[#e2e8f0]">
                  {cncfCount}
                </p>
              </div>
              <div className="oss-panel min-w-[132px] px-4 py-3">
                <p className="font-figma-mono text-[10px] leading-[15px] tracking-[1px] text-[#64748b] uppercase">
                  {copy.labels.updated}
                </p>
                <p className="font-figma-display mt-2 text-[26px] leading-[26px] tracking-[-0.64px] text-[#e2e8f0]">
                  03.20
                </p>
              </div>
              <div className="oss-panel min-w-[132px] px-4 py-3">
                <p className="font-figma-mono text-[10px] leading-[15px] tracking-[1px] text-[#64748b] uppercase">
                  {copy.labels.spread}
                </p>
                <p className="font-figma-display mt-2 text-[26px] leading-[26px] tracking-[-0.64px] text-[#e2e8f0]">
                  {averageScore.toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-4 py-6 md:px-6">
        <section className="oss-panel px-5 pb-5 pt-4">
          <div className="border-b border-[#2d3548] pb-4">
            <h2 className="font-figma-display text-[22px] leading-[26.4px] text-[#e2e8f0]">{copy.filtersTitle}</h2>
            <p className="font-figma-body mt-1 text-[12px] leading-[19.5px] text-[#64748b]">{copy.filtersSubtitle}</p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <FilterSelect label={copy.filters.category}>
              <option>{copy.filters.category}</option>
              <option>{copy.options.kubernetes}</option>
              <option>{copy.options.observability}</option>
              <option>{copy.options.networking}</option>
            </FilterSelect>
            <FilterSelect label={copy.filters.foundation}>
              <option>{copy.filters.foundation}</option>
              <option>{copy.options.cncf}</option>
              <option>{copy.options.independent}</option>
            </FilterSelect>
            <FilterSelect label={copy.filters.language}>
              <option>{copy.filters.language}</option>
              <option>{copy.options.go}</option>
              <option>{copy.options.typescript}</option>
              <option>{copy.options.python}</option>
            </FilterSelect>
            <FilterSelect label={copy.filters.sort}>
              <option>{copy.options.total}</option>
              <option>{copy.options.attention}</option>
              <option>{copy.options.execution}</option>
            </FilterSelect>
          </div>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,980px)_minmax(0,392px)]">
          <section className="oss-panel overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-[#2d3548] px-5 pb-[15px] pt-[14px] md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="font-figma-display text-[22px] leading-[26.4px] text-[#e2e8f0]">{copy.sections.all}</h2>
                <p className="font-figma-mono mt-[2px] text-[12px] leading-4 tracking-[0.3px] text-[#64748b] uppercase">
                  Total {globalLeaderboard.length} projects
                </p>
              </div>
              <Link
                href={`/projects/${topProject.project.slug}`}
                className="font-figma-mono text-[12px] leading-4 tracking-[0.6px] text-[#6b9bd1] uppercase transition hover:text-[#9fc1e7]"
              >
                #{topProject.rank} {locale === "ko" ? topProject.project.display_name_ko : topProject.project.display_name_en}
              </Link>
            </div>

            <div className="md:hidden">
              {globalLeaderboard.map((entry) => (
                <Link
                  key={entry.project.slug}
                  href={`/projects/${entry.project.slug}`}
                  className="block border-b border-[#2d3548] px-4 py-4 last:border-b-0"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-figma-mono flex items-center gap-2 text-[13px] text-[#e2e8f0]">
                        <span>{entry.rank}</span>
                        <TrendArrow
                          trend={entry.rank_change ? (entry.rank_change > 0 ? "up" : "down") : undefined}
                        />
                      </div>
                      <p className="font-figma-body mt-2 text-base font-semibold text-[#e2e8f0]">
                        {locale === "ko" ? entry.project.display_name_ko : entry.project.display_name_en}
                      </p>
                      <p className="font-figma-body mt-1 text-sm leading-6 text-[#64748b]">
                        {entry.project.short_description_ko}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <FoundationChip
                          cncfStage={entry.project.cncf_stage}
                          foundation={entry.project.foundation_type}
                        />
                        <LanguageChip language={entry.project.primary_language} />
                      </div>
                    </div>
                    <ScorePill score={entry.total_score} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-[4px] border border-[#2d3548] bg-[#111622] px-3 py-2">
                      <p className="font-figma-mono text-[10px] leading-[15px] tracking-[1px] text-[#6b9bd1] uppercase">INT</p>
                      <AxisValue color="#6b9bd1" value={entry.attention_score} />
                    </div>
                    <div className="rounded-[4px] border border-[#2d3548] bg-[#111622] px-3 py-2">
                      <p className="font-figma-mono text-[10px] leading-[15px] tracking-[1px] text-[#af87d7] uppercase">EXE</p>
                      <AxisValue color="#af87d7" value={entry.execution_score} />
                    </div>
                    <div className="rounded-[4px] border border-[#2d3548] bg-[#111622] px-3 py-2">
                      <p className="font-figma-mono text-[10px] leading-[15px] tracking-[1px] text-[#87af87] uppercase">HLT</p>
                      <AxisValue color="#87af87" value={entry.health_score} />
                    </div>
                    <div className="rounded-[4px] border border-[#2d3548] bg-[#111622] px-3 py-2">
                      <p className="font-figma-mono text-[10px] leading-[15px] tracking-[1px] text-[#d7af5f] uppercase">TRS</p>
                      <AxisValue color="#d7af5f" value={entry.trust_score} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[980px]">
                <thead>
                  <tr className="h-[39.5px] border-b border-[#2d3548]">
                    <th className="font-figma-mono w-[72px] px-4 py-3 text-left text-[10px] leading-[15px] tracking-[1px] text-[#64748b]">#</th>
                    <th className="font-figma-mono px-4 py-3 text-left text-[10px] leading-[15px] tracking-[1px] text-[#64748b]">
                      {copy.labels.project}
                    </th>
                    <th className="font-figma-mono w-[144px] px-4 py-3 text-left text-[10px] leading-[15px] tracking-[1px] text-[#64748b]">
                      {copy.labels.foundation}
                    </th>
                    <th className="font-figma-mono w-[128px] px-4 py-3 text-left text-[10px] leading-[15px] tracking-[1px] text-[#64748b]">
                      {copy.labels.language}
                    </th>
                    <th className="font-figma-mono w-[80px] px-4 py-3 text-center text-[10px] leading-[15px] tracking-[1px] text-[#6b9bd1]">INT</th>
                    <th className="font-figma-mono w-[80px] px-4 py-3 text-center text-[10px] leading-[15px] tracking-[1px] text-[#af87d7]">EXE</th>
                    <th className="font-figma-mono w-[80px] px-4 py-3 text-center text-[10px] leading-[15px] tracking-[1px] text-[#87af87]">HLT</th>
                    <th className="font-figma-mono w-[80px] px-4 py-3 text-center text-[10px] leading-[15px] tracking-[1px] text-[#d7af5f]">TRS</th>
                    <th className="font-figma-mono w-[96px] px-4 py-3 text-right text-[10px] leading-[15px] tracking-[1px] text-[#64748b]">
                      {copy.labels.score}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {globalLeaderboard.map((entry) => (
                    <tr key={entry.project.slug} className="h-[86px] border-b border-[#2d3548] last:border-b-0">
                      <td className="px-4 align-middle">
                        <div className="font-figma-mono flex items-center gap-2 text-[14px] font-bold leading-5 text-[#e2e8f0]">
                          <span>{entry.rank}</span>
                          <TrendArrow
                            trend={entry.rank_change ? (entry.rank_change > 0 ? "up" : "down") : undefined}
                          />
                        </div>
                      </td>
                      <td className="px-4 align-middle">
                        <Link href={`/projects/${entry.project.slug}`} className="block transition hover:opacity-90">
                          <p className="font-figma-body text-[16px] font-semibold leading-6 text-[#e2e8f0]">
                            {locale === "ko" ? entry.project.display_name_ko : entry.project.display_name_en}
                          </p>
                          <p className="font-figma-body mt-[2px] max-w-[360px] text-[12px] leading-4 text-[#64748b]">
                            {entry.project.short_description_ko}
                          </p>
                        </Link>
                      </td>
                      <td className="px-4 align-middle">
                        <FoundationChip
                          cncfStage={entry.project.cncf_stage}
                          foundation={entry.project.foundation_type}
                        />
                      </td>
                      <td className="px-4 align-middle">
                        <LanguageChip language={entry.project.primary_language} />
                      </td>
                      <td className="px-4 text-center align-middle">
                        <AxisValue color="#6b9bd1" value={entry.attention_score} />
                      </td>
                      <td className="px-4 text-center align-middle">
                        <AxisValue color="#af87d7" value={entry.execution_score} />
                      </td>
                      <td className="px-4 text-center align-middle">
                        <AxisValue color="#87af87" value={entry.health_score} />
                      </td>
                      <td className="px-4 text-center align-middle">
                        <AxisValue color="#d7af5f" value={entry.trust_score} />
                      </td>
                      <td className="px-4 text-right align-middle">
                        <div className="flex justify-end">
                          <ScorePill score={entry.total_score} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="space-y-5">
            <section className="oss-panel overflow-hidden">
              <div className="border-b border-[#2d3548] px-5 pb-[15px] pt-[14px]">
                <h2 className="font-figma-display text-[22px] leading-[26.4px] text-[#e2e8f0]">{copy.sections.insight}</h2>
                <p className="font-figma-body mt-1 text-[12px] leading-[19.5px] text-[#64748b]">{copy.sections.insightSub}</p>
              </div>
              <div className="space-y-4 px-5 py-5">
                {copy.insights.map((item) => (
                  <div key={item.title} className="rounded-[4px] border border-[#2d3548] bg-[#12161f] px-4 py-4">
                    <p className="font-figma-body text-[13px] font-semibold leading-4 text-[#e2e8f0]">{item.title}</p>
                    <p className="font-figma-body mt-2 text-[12px] leading-[19.5px] text-[#64748b]">{item.body}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="oss-panel overflow-hidden">
              <div className="border-b border-[#2d3548] px-5 pb-[15px] pt-[14px]">
                <h2 className="font-figma-display text-[22px] leading-[26.4px] text-[#e2e8f0]">{copy.sections.momentum}</h2>
                <p className="font-figma-body mt-1 text-[12px] leading-[19.5px] text-[#64748b]">{copy.sections.momentumSub}</p>
              </div>
              <div className="space-y-3 px-5 py-5">
                {categorySummaries.slice(0, 5).map((category) => (
                  <div key={category.slug} className="rounded-[4px] border border-[#2d3548] bg-[#12161f] px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-figma-body text-[15px] font-semibold leading-5 text-[#e2e8f0]">
                          {locale === "ko" ? category.name.ko : category.name.en}
                        </p>
                        <p className="font-figma-body mt-1 text-[12px] leading-[19.5px] text-[#64748b]">
                          {locale === "ko" ? category.summary.ko : category.summary.en}
                        </p>
                      </div>
                      <span className="font-figma-mono inline-flex rounded-[4px] border border-[#2d3548] bg-[#1a1f2e] px-[8px] py-[3px] text-[10px] leading-[15px] tracking-[0.5px] text-[#94a3b8] uppercase">
                        {category.dominantAxis}
                      </span>
                    </div>
                    <p className="font-figma-mono mt-3 text-[10px] leading-[15px] tracking-[1px] text-[#64748b] uppercase">
                      {category.count} {copy.labels.categoryProjects}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="oss-panel px-5 pb-5 pt-4">
              <p className="font-figma-mono text-[10px] leading-[15px] tracking-[1px] text-[#64748b] uppercase">
                Top project
              </p>
              <p className="font-figma-display mt-2 text-[26px] leading-[26px] tracking-[-0.64px] text-[#e2e8f0]">
                {locale === "ko" ? topProject.project.display_name_ko : topProject.project.display_name_en}
              </p>
              <p className="font-figma-body mt-2 text-[12px] leading-[19.5px] text-[#64748b]">
                {topProject.project.short_description_ko}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <ScorePill score={topProject.total_score} />
                <FoundationChip
                  cncfStage={topProject.project.cncf_stage}
                  foundation={topProject.project.foundation_type}
                />
                <LanguageChip language={topProject.project.primary_language} />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-[4px] border border-[#2d3548] bg-[#12161f] px-4 py-3">
                  <p className="font-figma-mono text-[10px] leading-[15px] tracking-[1px] text-[#64748b] uppercase">INT</p>
                  <AxisValue color="#6b9bd1" value={topProject.attention_score} />
                </div>
                <div className="rounded-[4px] border border-[#2d3548] bg-[#12161f] px-4 py-3">
                  <p className="font-figma-mono text-[10px] leading-[15px] tracking-[1px] text-[#64748b] uppercase">EXE</p>
                  <AxisValue color="#af87d7" value={topProject.execution_score} />
                </div>
                <div className="rounded-[4px] border border-[#2d3548] bg-[#12161f] px-4 py-3">
                  <p className="font-figma-mono text-[10px] leading-[15px] tracking-[1px] text-[#64748b] uppercase">HLT</p>
                  <AxisValue color="#87af87" value={topProject.health_score} />
                </div>
                <div className="rounded-[4px] border border-[#2d3548] bg-[#12161f] px-4 py-3">
                  <p className="font-figma-mono text-[10px] leading-[15px] tracking-[1px] text-[#64748b] uppercase">TRS</p>
                  <AxisValue color="#d7af5f" value={topProject.trust_score} />
                </div>
              </div>
            </section>
          </div>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-2">
          <section className="oss-panel overflow-hidden">
            <div className="border-b border-[#2d3548] px-5 pb-[15px] pt-[14px]">
              <h2 className="font-figma-display text-[22px] leading-[26.4px] text-[#e2e8f0]">CNCF Top</h2>
              <p className="font-figma-body mt-1 text-[12px] leading-[19.5px] text-[#64748b]">
                CNCF 재단 프로젝트만 분리한 서브 리더보드입니다.
              </p>
            </div>
            <div className="divide-y divide-[#2d3548]">
              {cncfLeaderboard.slice(0, 5).map((entry) => (
                <Link
                  key={entry.project.slug}
                  href={`/projects/${entry.project.slug}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-[#12161f]"
                >
                  <div className="min-w-0">
                    <p className="font-figma-mono text-[12px] leading-4 tracking-[0.6px] text-[#6b9bd1]">
                      #{entry.rank}
                    </p>
                    <p className="mt-1 truncate font-figma-body text-[15px] font-semibold text-[#e2e8f0]">
                      {locale === "ko" ? entry.project.display_name_ko : entry.project.display_name_en}
                    </p>
                  </div>
                  <ScorePill score={entry.total_score} />
                </Link>
              ))}
            </div>
          </section>

          <section className="oss-panel overflow-hidden">
            <div className="border-b border-[#2d3548] px-5 pb-[15px] pt-[14px]">
              <h2 className="font-figma-display text-[22px] leading-[26.4px] text-[#e2e8f0]">Focus Axis</h2>
              <p className="font-figma-body mt-1 text-[12px] leading-[19.5px] text-[#64748b]">
                상위권 프로젝트가 강하게 확보한 축의 색상 체계를 그대로 유지합니다.
              </p>
            </div>
            <div className="space-y-4 px-5 py-5">
              {[
                { label: "관심도", value: 92, color: "#6b9bd1" },
                { label: "실행력", value: 90, color: "#af87d7" },
                { label: "건강도", value: 86, color: "#87af87" },
                { label: "신뢰도", value: 84, color: "#d7af5f" },
              ].map((axis) => (
                <div key={axis.label}>
                  <div className="flex items-center justify-between">
                    <span className="font-figma-body text-[12px] leading-4 text-[#64748b]">{axis.label}</span>
                    <span className="font-figma-mono text-[14px] font-bold leading-5" style={{ color: axis.color }}>
                      {axis.value}
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-[#12161f]">
                    <div className="h-2 rounded-full" style={{ width: `${axis.value}%`, backgroundColor: axis.color }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}
