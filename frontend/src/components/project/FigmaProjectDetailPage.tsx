"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { getProjectModel, pickText } from "@/lib/mock-data";
import { formatNumber, getFoundationLabel } from "@/lib/utils";

const AXES = [
  { key: "attention", labelKo: "관심도", labelEn: "Attention", color: "#3366ff", weight: 34 },
  { key: "execution", labelKo: "실행력", labelEn: "Execution", color: "#22ab94", weight: 38 },
  { key: "health", labelKo: "건강도", labelEn: "Health", color: "#f0b90b", weight: 18 },
  { key: "trust", labelKo: "신뢰도", labelEn: "Trust", color: "#a855f7", weight: 10 },
] as const;

function stageTone(stage: string | null) {
  if (stage === "graduated") {
    return "border-[rgba(34,171,148,0.24)] bg-[rgba(34,171,148,0.12)] text-[#22ab94]";
  }
  if (stage === "incubating") {
    return "border-[rgba(51,102,255,0.24)] bg-[rgba(51,102,255,0.12)] text-[#3366ff]";
  }
  if (stage === "sandbox") {
    return "border-[rgba(240,185,11,0.24)] bg-[rgba(240,185,11,0.12)] text-[#f0b90b]";
  }
  return "border-[#2b2f36] bg-[rgba(43,47,54,0.42)] text-[#848e9c]";
}

function buildPath(points: { x: number; y: number }[]) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

function ScorePill({
  score,
}: {
  score: number;
}) {
  return (
    <span className="inline-flex h-8 items-center rounded-[4px] border border-[rgba(51,102,255,0.2)] bg-[rgba(51,102,255,0.12)] px-4 font-pretendard text-[14px] font-medium leading-5 text-[#3366ff]">
      {score.toFixed(1)}
    </span>
  );
}

function HeroStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-[4px] border border-[#2b2f36] bg-[rgba(24,28,33,0.72)] px-4 py-3">
      <p className="font-pretendard text-[11px] uppercase leading-[16.5px] tracking-[1.76px] text-[#64748b]">
        {label}
      </p>
      <p className="mt-2 font-pretendard text-[20px] leading-7 tracking-[-0.5px] text-[#d1d4dc]">
        {value}
      </p>
    </article>
  );
}

function MetricTile({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix?: string;
}) {
  return (
    <article className="rounded-[4px] border border-[#2b2f36] bg-[#1e2026] px-4 py-4">
      <p className="font-figma-mono text-[10px] uppercase leading-[15px] tracking-[1px] text-[#64748b]">{label}</p>
      <p className="mt-2 font-figma-display text-[28px] leading-7 tracking-[-0.64px] text-[#d1d4dc]">{value}</p>
      {suffix ? (
        <p className="mt-2 font-figma-mono text-[10px] uppercase leading-[15px] tracking-[0.8px] text-[#64748b]">
          {suffix}
        </p>
      ) : null}
    </article>
  );
}

function TrendChart({
  data,
  baseScore,
}: {
  data: { date: string; score: number; expected: number }[];
  baseScore: number;
}) {
  const width = 940;
  const height = 245;
  const allValues = [...data.map((point) => point.score), ...data.map((point) => point.expected), baseScore];
  const maxValue = Math.max(...allValues) + 0.8;
  const minValue = Math.min(...allValues) - 0.8;
  const range = maxValue - minValue || 1;
  const ticks = Array.from({ length: 5 }, (_, index) => Number((maxValue - (range / 4) * index).toFixed(1)));

  const scorePoints = data.map((point, index) => ({
    x: (width / (data.length - 1)) * index,
    y: ((maxValue - point.score) / range) * height,
  }));

  const expectedPoints = data.map((point, index) => ({
    x: (width / (data.length - 1)) * index,
    y: ((maxValue - point.expected) / range) * height,
  }));

  const baseY = ((maxValue - baseScore) / range) * height;

  return (
    <section className="rounded-[4px] border border-[#2b2f36] bg-[#1e2026] shadow-[0_18px_44px_rgba(15,23,42,0.18)]">
      <div className="px-6 pb-6 pt-6">
        <p className="font-pretendard text-[11px] leading-[16.5px] tracking-[1.76px] text-[#64748b]">점수 추세</p>
        <h2 className="mt-2 font-pretendard text-[28px] leading-7 tracking-[-0.5px] text-[#d1d4dc]">
          점수와 기대치 흐름
        </h2>

        <div className="mt-6 overflow-x-auto">
          <div className="min-w-[980px]">
            <div className="relative h-[280px] pl-[60px] pr-5 pt-[6px]">
              <div className="absolute bottom-[30px] left-[60px] right-5 top-[6px]">
                <svg className="h-full w-full" viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
                  {ticks.map((_, index) => {
                    const y = (height / (ticks.length - 1)) * index;
                    return (
                      <line
                        key={`h-${index}`}
                        x1="0"
                        x2={width}
                        y1={y}
                        y2={y}
                        stroke="#2b2f36"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />
                    );
                  })}

                  {data.map((_, index) => {
                    const x = (width / (data.length - 1)) * index;
                    return (
                      <line
                        key={`v-${index}`}
                        x1={x}
                        x2={x}
                        y1="0"
                        y2={height}
                        stroke="#2b2f36"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />
                    );
                  })}

                  <line
                    x1="0"
                    x2={width}
                    y1={baseY}
                    y2={baseY}
                    stroke="#2b2f36"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />

                  <path
                    d={buildPath(expectedPoints)}
                    fill="none"
                    stroke="#f0b90b"
                    strokeDasharray="4 3"
                    strokeLinecap="round"
                    strokeWidth="2"
                  />
                  <path
                    d={buildPath(scorePoints)}
                    fill="none"
                    stroke="#3366ff"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                  />
                </svg>
              </div>

              {ticks.map((label, index) => {
                const top = 6 + (245 / (ticks.length - 1)) * index;
                return (
                  <span
                    key={label}
                    className="absolute left-0 -translate-y-1/2 font-figma-body text-[11px] leading-[13px] text-[#64748b]"
                    style={{ top }}
                  >
                    {label.toFixed(1)}
                  </span>
                );
              })}

              {data.map((point, index) => {
                const left = 60 + (940 / (data.length - 1)) * index;
                return (
                  <span
                    key={point.date}
                    className="absolute bottom-0 -translate-x-1/2 font-figma-body text-[11px] leading-[13px] text-[#64748b]"
                    style={{ left }}
                  >
                    {point.date}
                  </span>
                );
              })}

              <span
                className="absolute font-figma-body text-[10px] leading-3 text-[#64748b]"
                style={{ left: "50%", top: `${6 + baseY - 12}px` }}
              >
                Base
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <span className="font-pretendard text-[12px] leading-4 text-[#64748b]">Y-axis: score</span>
          <span className="font-pretendard text-[12px] leading-4 text-[#64748b]">Expectation is community-weighted</span>
        </div>
      </div>
    </section>
  );
}

export function FigmaProjectDetailPage({
  slug,
}: {
  slug: string;
}) {
  const locale = useLocale();
  const t = useTranslations("project");
  const marketT = useTranslations("market");
  const project = getProjectModel(slug);
  const relatedProjects = project.relatedSlugs.map(getProjectModel);
  const positiveFactors = project.explanation.top_positive_factors ?? [];
  const negativeFactors = project.explanation.top_negative_factors ?? [];
  const language = project.summary.primary_language ?? "Unknown";
  const foundation = getFoundationLabel(project.summary.foundation_type);
  const localeKey = locale === "ko" ? "ko" : "en";
  const numberLocale = locale === "ko" ? "ko-KR" : "en-US";

  const stats = [
    { label: "GLOBAL RANK", value: `#${project.ranking.global}` },
    { label: "RISING", value: project.ranking.rising ? `#${project.ranking.rising}` : "—" },
    { label: "CATEGORY", value: project.ranking.category ? `#${project.ranking.category}` : "—" },
    { label: "PREDICTIONS", value: `${project.market.totalPredictions}` },
  ];

  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 bg-[#181c21] text-[#d1d4dc]">
      <div className="mx-auto w-full max-w-[1280px] px-4 pb-8 pt-8 md:px-6 xl:px-0">
        <section className="rounded-[4px] border border-[#2b2f36] bg-[#1e2026] shadow-[0_18px_44px_rgba(15,23,42,0.18)]">
          <div className="relative overflow-hidden rounded-[24px] px-8 py-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 hidden w-[32%] opacity-60 md:block"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, rgba(43,47,54,0.42) 0.8px, transparent 0.8px), linear-gradient(90deg, rgba(43,47,54,0.42) 0.8px, transparent 0.8px)",
                backgroundSize: "24px 24px",
              }}
            />

            <div className="relative z-10 flex flex-wrap items-center gap-3">
              <Link
                href="/market"
                className="inline-flex h-[30px] items-center rounded-[4px] border border-[#2b2f36] bg-[rgba(43,47,54,0.42)] px-4 font-pretendard text-[13px] leading-5 text-[#848e9c] transition hover:border-[#4b5262] hover:text-[#d1d4dc]"
              >
                {locale === "ko" ? "예측 시장으로 돌아가기" : "Back to market"}
              </Link>
              <span className="inline-flex h-[26px] items-center rounded-[4px] border border-[rgba(51,102,255,0.24)] bg-[rgba(51,102,255,0.12)] px-[13px] font-pretendard text-[11px] uppercase leading-[16.5px] tracking-[1.98px] text-[#3366ff]">
                {foundation}
              </span>
              {project.summary.cncf_stage ? (
                <span
                  className={`inline-flex h-[26px] items-center rounded-full border px-[13px] font-pretendard text-[11px] uppercase leading-[16.5px] tracking-[1.98px] ${stageTone(
                    project.summary.cncf_stage
                  )}`}
                >
                  CNCF {project.summary.cncf_stage}
                </span>
              ) : null}
              <span className="inline-flex h-[26px] items-center rounded-[4px] border border-[#2b2f36] bg-[rgba(43,47,54,0.42)] px-[13px] font-pretendard text-[11px] uppercase leading-[16.5px] tracking-[1.98px] text-[#848e9c]">
                {language}
              </span>
            </div>

            <div className="relative z-10 mt-6 flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-[640px]">
                <h1 className="font-pretendard text-[48px] leading-[1.05] tracking-[-1.2px] text-[#d1d4dc]">
                  {locale === "ko" ? project.summary.display_name_ko : project.summary.display_name_en}
                </h1>
                <p className="mt-4 font-pretendard text-[16px] leading-6 text-[#64748b]">
                  {pickText(locale, project.description)}
                </p>
                <p className="mt-4 font-pretendard text-[14px] leading-6 text-[#94a3b8]">
                  {pickText(locale, project.highlight)}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={project.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-[38px] items-center rounded-[4px] border border-[#2b2f36] bg-[rgba(43,47,54,0.42)] px-[18px] font-pretendard text-[14px] leading-5 text-[#d1d4dc] transition hover:border-[#4b5262]"
                  >
                    {t("viewRepo")}
                  </a>
                  <a
                    href={project.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-[38px] items-center rounded-[4px] bg-[#3366ff] px-[18px] font-pretendard text-[14px] font-medium leading-5 text-white transition hover:bg-[#4d7dff]"
                  >
                    {t("viewHomepage")}
                  </a>
                  <Link
                    href={`/compare?projects=${slug},${project.relatedSlugs[0]}`}
                    className="inline-flex h-[38px] items-center rounded-[4px] border border-[#2b2f36] bg-[rgba(43,47,54,0.42)] px-[18px] font-pretendard text-[14px] leading-5 text-[#848e9c] transition hover:border-[#4b5262] hover:text-[#d1d4dc]"
                  >
                    {locale === "ko" ? "비교 열기" : "Compare"}
                  </Link>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:w-[430px]">
                {stats.map((item) => (
                  <HeroStat key={item.label} label={item.label} value={item.value} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
          <section className="rounded-[4px] border border-[#2b2f36] bg-[#1e2026] shadow-[0_18px_44px_rgba(15,23,42,0.18)]">
            <div className="border-b border-[#2b2f36] px-5 pb-[15px] pt-[14px]">
              <p className="font-figma-mono text-[10px] uppercase leading-[15px] tracking-[1px] text-[#64748b]">
                SCORE MODEL
              </p>
              <div className="mt-3 flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-figma-display text-[32px] leading-[35.2px] tracking-[-0.64px] text-[#d1d4dc]">
                    {project.scores.total.toFixed(1)}
                  </h2>
                  <p className="font-figma-body mt-1 text-[12px] leading-[19.5px] text-[#64748b]">
                    {locale === "ko" ? "종합 점수" : "Total score"}
                  </p>
                </div>
                <ScorePill score={project.scores.total} />
              </div>
            </div>

            <div className="space-y-5 px-5 py-5">
              {AXES.map((axis) => {
                const label = localeKey === "ko" ? axis.labelKo : axis.labelEn;
                const value = project.scores[axis.key];
                return (
                  <div key={axis.key}>
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-figma-body text-[12px] leading-4 text-[#cbd5e1]">
                        {label} ({axis.weight}%)
                      </span>
                      <span className="font-figma-mono text-[12px] font-bold leading-4" style={{ color: axis.color }}>
                        {value.toFixed(1)}
                      </span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-[#181c21]">
                      <div className="h-2 rounded-full" style={{ width: `${value}%`, backgroundColor: axis.color }} />
                    </div>
                  </div>
                );
              })}

              <div className="rounded-[4px] border border-[#2b2f36] bg-[#181c21] px-4 py-4 font-figma-mono text-[13px] leading-5 text-[#3366ff]">
                total = 0.34 × attention + 0.38 × execution + 0.18 × health + 0.10 × trust
              </div>
            </div>
          </section>

          <section className="rounded-[4px] border border-[#2b2f36] bg-[#1e2026] shadow-[0_18px_44px_rgba(15,23,42,0.18)]">
            <div className="border-b border-[#2b2f36] px-5 pb-[15px] pt-[14px]">
              <h2 className="font-figma-display text-[22px] leading-[26.4px] text-[#d1d4dc]">{t("explanation")}</h2>
              <p className="font-figma-body mt-1 text-[12px] leading-[19.5px] text-[#64748b]">
                {locale === "ko" ? project.explanation.summary_ko : project.explanation.summary_en}
              </p>
            </div>

            <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
              <div className="rounded-[4px] border border-[rgba(34,171,148,0.22)] bg-[rgba(34,171,148,0.08)] px-4 py-4">
                <h3 className="font-figma-body text-[13px] font-semibold leading-4 text-[#22ab94]">{t("strengths")}</h3>
                <div className="mt-3 space-y-2">
                  {positiveFactors.map((factor) => (
                    <div
                      key={factor.factor}
                      className="flex items-center justify-between rounded-[4px] border border-[#2b2f36] bg-[#181c21] px-3 py-2"
                    >
                      <span className="font-figma-body text-[12px] leading-4 text-[#cbd5e1]">
                        {locale === "ko" ? factor.label_ko : factor.label_en}
                      </span>
                      <span className="font-figma-mono text-[12px] font-bold leading-4 text-[#22ab94]">
                        {factor.score.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[4px] border border-[rgba(18,97,196,0.22)] bg-[rgba(18,97,196,0.08)] px-4 py-4">
                <h3 className="font-figma-body text-[13px] font-semibold leading-4 text-[#1261c4]">{t("weaknesses")}</h3>
                <div className="mt-3 space-y-2">
                  {negativeFactors.map((factor) => (
                    <div
                      key={factor.factor}
                      className="flex items-center justify-between rounded-[4px] border border-[#2b2f36] bg-[#181c21] px-3 py-2"
                    >
                      <span className="font-figma-body text-[12px] leading-4 text-[#cbd5e1]">
                        {locale === "ko" ? factor.label_ko : factor.label_en}
                      </span>
                      <span className="font-figma-mono text-[12px] font-bold leading-4 text-[#1261c4]">
                        {factor.score.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {locale === "ko" && project.explanation.momentum_summary_ko ? (
              <div className="px-5 pb-5">
                <div className="rounded-[4px] border border-[rgba(51,102,255,0.22)] bg-[rgba(51,102,255,0.08)] px-4 py-4 font-figma-body text-[13px] leading-6 text-[#848e9c]">
                  {project.explanation.momentum_summary_ko}
                </div>
              </div>
            ) : null}
          </section>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <TrendChart data={project.trend} baseScore={project.scores.total - 6} />

          <section className="rounded-[4px] border border-[#2b2f36] bg-[#1e2026] shadow-[0_18px_44px_rgba(15,23,42,0.18)]">
            <div className="border-b border-[#2b2f36] px-5 pb-[15px] pt-[14px]">
              <h2 className="font-figma-display text-[22px] leading-[26.4px] text-[#d1d4dc]">{marketT("positionDistribution")}</h2>
              <p className="font-figma-body mt-1 text-[12px] leading-[19.5px] text-[#64748b]">
                {project.market.totalPredictions}명 참여
              </p>
            </div>

            <div className="px-5 py-5">
              <div className="flex h-4 overflow-hidden rounded-full bg-[rgba(43,47,54,0.42)]">
                <div className="h-4 bg-[#c84a31]" style={{ width: `${project.market.upRatio * 100}%` }} />
                <div className="h-4 bg-[#848e9c]" style={{ width: `${project.market.neutralRatio * 100}%` }} />
                <div className="h-4 bg-[#1261c4]" style={{ width: `${project.market.downRatio * 100}%` }} />
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-[4px] border border-[#2b2f36] bg-[#181c21] px-3 py-2">
                  <span className="font-figma-body text-[12px] leading-4 text-[#c84a31]">{marketT("positionUp")}</span>
                  <span className="font-figma-mono text-[12px] font-bold leading-4 text-[#c84a31]">
                    {(project.market.upRatio * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-[4px] border border-[#2b2f36] bg-[#181c21] px-3 py-2">
                  <span className="font-figma-body text-[12px] leading-4 text-[#848e9c]">{marketT("positionNeutral")}</span>
                  <span className="font-figma-mono text-[12px] font-bold leading-4 text-[#848e9c]">
                    {(project.market.neutralRatio * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-[4px] border border-[#2b2f36] bg-[#181c21] px-3 py-2">
                  <span className="font-figma-body text-[12px] leading-4 text-[#1261c4]">{marketT("positionDown")}</span>
                  <span className="font-figma-mono text-[12px] font-bold leading-4 text-[#1261c4]">
                    {(project.market.downRatio * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="mt-5 rounded-[4px] border border-[rgba(51,102,255,0.22)] bg-[rgba(51,102,255,0.08)] px-4 py-4">
                <p className="font-figma-mono text-[10px] uppercase leading-[15px] tracking-[1px] text-[#64748b]">
                  WEIGHTED EXPECTATION
                </p>
                <div className="mt-3 flex flex-wrap gap-4">
                  <span className="font-figma-body text-[12px] font-semibold leading-4 text-[#c84a31]">
                    {marketT("positionUp")} {(project.market.weightedUp * 100).toFixed(1)}%
                  </span>
                  <span className="font-figma-body text-[12px] font-semibold leading-4 text-[#848e9c]">
                    {marketT("positionNeutral")} {(project.market.weightedNeutral * 100).toFixed(1)}%
                  </span>
                  <span className="font-figma-body text-[12px] font-semibold leading-4 text-[#1261c4]">
                    {marketT("positionDown")} {(project.market.weightedDown * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </section>
        </section>

        <section className="mt-5 rounded-[4px] border border-[#2b2f36] bg-[#1e2026] shadow-[0_18px_44px_rgba(15,23,42,0.18)]">
          <div className="border-b border-[#2b2f36] px-5 pb-[15px] pt-[14px]">
            <h2 className="font-figma-display text-[22px] leading-[26.4px] text-[#d1d4dc]">{t("metrics")}</h2>
            <p className="font-figma-body mt-1 text-[12px] leading-[19.5px] text-[#64748b]">
              {locale === "ko" ? "프로젝트 운영 강도와 규모를 읽을 수 있는 핵심 수치입니다." : "Core operating metrics that explain scale and maintenance intensity."}
            </p>
          </div>

          <div className="grid gap-3 px-5 py-5 sm:grid-cols-2 xl:grid-cols-4">
            <MetricTile label={t("stars")} value={formatNumber(project.metrics.stars, numberLocale as "ko-KR" | "en-US")} />
            <MetricTile label={t("forks")} value={formatNumber(project.metrics.forks, numberLocale as "ko-KR" | "en-US")} />
            <MetricTile label={t("contributors")} value={formatNumber(project.metrics.contributors, numberLocale as "ko-KR" | "en-US")} suffix="30D" />
            <MetricTile label={t("commits")} value={formatNumber(project.metrics.commits, numberLocale as "ko-KR" | "en-US")} suffix="30D" />
            <MetricTile label={t("prsMerged")} value={formatNumber(project.metrics.prsMerged, numberLocale as "ko-KR" | "en-US")} suffix="30D" />
            <MetricTile label={t("issuesClosed")} value={formatNumber(project.metrics.issuesClosed, numberLocale as "ko-KR" | "en-US")} suffix="30D" />
            <MetricTile label={t("releases")} value={formatNumber(project.metrics.releases, numberLocale as "ko-KR" | "en-US")} suffix="90D" />
          </div>
        </section>

        <section className="mt-5 rounded-[4px] border border-[#2b2f36] bg-[#1e2026] shadow-[0_18px_44px_rgba(15,23,42,0.18)]">
          <div className="flex items-center justify-between gap-4 border-b border-[#2b2f36] px-5 pb-[15px] pt-[14px]">
            <div>
              <h2 className="font-figma-display text-[22px] leading-[26.4px] text-[#d1d4dc]">{t("similar")}</h2>
              <p className="font-figma-body mt-1 text-[12px] leading-[19.5px] text-[#64748b]">
                {locale === "ko" ? "예측 시장에서 같이 볼 만한 연관 프로젝트입니다." : "Related projects worth comparing inside the market flow."}
              </p>
            </div>
            <Link
              href={`/compare?projects=${slug},${project.relatedSlugs[0]}`}
              className="font-figma-mono text-[12px] uppercase leading-4 tracking-[0.6px] text-[#6b9bd1] transition hover:text-[#9fc1e7]"
            >
              {locale === "ko" ? "비교 열기" : "Compare"}
            </Link>
          </div>

          <div className="grid gap-4 px-5 py-5 md:grid-cols-3">
            {relatedProjects.map((item) => (
              <Link
                key={item.summary.slug}
                href={`/compare?projects=${slug},${item.summary.slug}`}
              className="rounded-[4px] border border-[#2b2f36] bg-[#181c21] px-4 py-4 transition hover:border-[#4b5262]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-figma-body text-[15px] font-semibold leading-5 text-[#d1d4dc]">
                      {locale === "ko" ? item.summary.display_name_ko : item.summary.display_name_en}
                    </p>
                    <p className="font-figma-body mt-2 text-[12px] leading-[19.5px] text-[#64748b]">
                      {pickText(locale, item.description)}
                    </p>
                  </div>
                  <ScorePill score={item.scores.total} />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-figma-mono text-[10px] uppercase leading-[15px] tracking-[0.8px] text-[#64748b]">
                    #{item.ranking.global}
                  </span>
                  <span className="font-figma-mono text-[10px] uppercase leading-[15px] tracking-[0.8px] text-[#94a3b8]">
                    {getFoundationLabel(item.summary.foundation_type)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
