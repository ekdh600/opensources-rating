"use client";

import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { getProjectModel, pickText } from "@/lib/mock-data";

const trendArrowAsset = "https://www.figma.com/api/mcp/asset/6ea0364a-ac72-437a-8b2f-6e579b12724e";

type RisingRow = {
  rank: number;
  slug: string | null;
  nameKo: string;
  nameEn: string;
  foundation: string;
  attention: number;
  trust: number;
  execution: number;
  score: number;
  delta: number;
};

const risingRows: RisingRow[] = [
  { rank: 1, slug: "kubernetes", nameKo: "쿠버네티스", nameEn: "Kubernetes", foundation: "CNCF", attention: 91.2, trust: 89.5, execution: 90.1, score: 90.2, delta: 12.5 },
  { rank: 2, slug: "grafana", nameKo: "그라파나", nameEn: "Grafana", foundation: "INDEPENDENT", attention: 86.2, trust: 85.3, execution: 84.1, score: 84.6, delta: 8.2 },
  { rank: 3, slug: "prometheus", nameKo: "프로메테우스", nameEn: "Prometheus", foundation: "CNCF", attention: 81.7, trust: 79.8, execution: 76.1, score: 79.8, delta: 6.1 },
  { rank: 4, slug: "envoy", nameKo: "엔보이", nameEn: "Envoy", foundation: "CNCF", attention: 73.0, trust: 71.8, execution: 70.4, score: 71.8, delta: 5.8 },
  { rank: 5, slug: "docker", nameKo: "도커 (Moby)", nameEn: "Docker (Moby)", foundation: "INDEPENDENT", attention: 78.1, trust: 69.8, execution: 65.1, score: 69.8, delta: 4.3 },
  { rank: 6, slug: "cilium", nameKo: "실리움", nameEn: "Cilium", foundation: "CNCF", attention: 75.8, trust: 71.3, execution: 66.2, score: 71.3, delta: 3.9 },
  { rank: 7, slug: null, nameKo: "벡터", nameEn: "Vector", foundation: "INDEPENDENT", attention: 69.0, trust: 71.3, execution: 67.1, score: 69.0, delta: 3.5 },
];

const COPY = {
  ko: {
    intro: "최근 30일 내 가장 빠르게 성장한 프로젝트를 점수 증가율 기준으로 정리합니다.",
    stats: {
      current: "CURRENT",
      window: "WINDOW",
      avgDelta: "AVG DELTA",
      topMover: "TOP MOVER",
      windowValue: "30일",
      topMoverLabel: "쿠버네티스",
    },
    board: {
      title: "급상승 리더보드",
      subtitle: "이번 주 가장 빠르게 성장한 프로젝트들",
      count: "+7 PROJECTS",
      headers: {
        rank: "RANK",
        project: "PROJECT",
        attention: "관심도",
        trust: "신뢰도",
        execution: "실행력",
        score: "점수",
        delta: "상승폭",
      },
    },
    insights: [
      { title: "eBPF 릴레이션", badge: "+12.5%", body: "eBPF와 보안 포지셔닝이 함께 강화되며 최근 기대치가 크게 올랐습니다." },
      { title: "CNCF 채택 기조", body: "CNCF 프로젝트들의 전반적 상승세가 두드러지며 평균 +6.2% 증가했습니다." },
      { title: "독자적 테마 유지", body: "독립 프로젝트는 조용하지만 꾸준한 실행력으로 지표 개선 중입니다." },
    ],
    focus: {
      title: "쿠버네티스",
      coverage: "커버리지스",
      coverageBody: "상위 7개 프로젝트를 대상으로 30일 간격 추적 중",
      labels: {
        attention: "관심도",
        trust: "신뢰도",
      },
    },
  },
  en: {
    intro: "This board tracks the fastest-growing projects in the last 30 days by score delta.",
    stats: {
      current: "CURRENT",
      window: "WINDOW",
      avgDelta: "AVG DELTA",
      topMover: "TOP MOVER",
      windowValue: "30d",
      topMoverLabel: "Kubernetes",
    },
    board: {
      title: "Rising leaderboard",
      subtitle: "The projects accelerating fastest this week",
      count: "+7 PROJECTS",
      headers: {
        rank: "RANK",
        project: "PROJECT",
        attention: "Attention",
        trust: "Trust",
        execution: "Execution",
        score: "Score",
        delta: "Delta",
      },
    },
    insights: [
      { title: "eBPF relation", badge: "+12.5%", body: "eBPF momentum and security positioning are driving a sharp jump in expectations." },
      { title: "CNCF adoption", body: "CNCF projects are broadly trending upward with an average gain of +6.2%." },
      { title: "Independent theme", body: "Independent projects are improving quietly through steady execution discipline." },
    ],
    focus: {
      title: "Kubernetes",
      coverage: "Coverage",
      coverageBody: "Tracking the top 7 projects on a rolling 30-day window",
      labels: {
        attention: "Attention",
        trust: "Trust",
      },
    },
  },
} as const;

function TrendArrow() {
  return <img alt="" className="block h-3 w-3" src={trendArrowAsset} />;
}

function RisingStatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <article className="oss-panel min-h-[76px] px-[17px] pt-[13px]">
      <p className="font-figma-body text-[12px] uppercase leading-4 tracking-[0.6px] text-[#64748b]">{label}</p>
      <p className="mt-2 font-figma-body text-[24px] font-bold leading-6 tracking-[-0.4px] text-[#e2e8f0]">{value}</p>
      {accent ? <p className="mt-2 text-[12px] leading-4 tracking-[0.6px] text-[#6b9bd1]">{accent}</p> : null}
    </article>
  );
}

function FoundationChip({ foundation }: { foundation: string }) {
  return (
    <span className="inline-flex h-[24px] min-w-[96px] items-center rounded-[4px] border border-[#2d3548] bg-[#1a1f2e] px-[9px] text-[10px] uppercase leading-[15px] tracking-[0.5px] text-[#94a3b8]">
      {foundation}
    </span>
  );
}

function ScoreBadge({ score }: { score: number }) {
  return (
    <span className="inline-flex h-6 min-w-10 items-center justify-center rounded-[4px] bg-[#b4d59d] px-2 text-[12px] font-bold leading-4 text-[#0a0e17]">
      {score.toFixed(1)}
    </span>
  );
}

function DeltaBadge({ delta }: { delta: number }) {
  return (
    <span className="inline-flex items-center gap-[6px] text-[16px] font-bold leading-5 text-[#87af87]">
      <TrendArrow />
      +{delta.toFixed(1)}%
    </span>
  );
}

function SidebarInsight({
  title,
  body,
  badge,
}: {
  title: string;
  body: string;
  badge?: string;
}) {
  return (
    <div className="border-b border-[#2d3548] px-5 py-5 last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-figma-body text-[15px] font-bold leading-[22.5px] text-[#e2e8f0]">{title}</h3>
        {badge ? (
          <span className="inline-flex h-[24px] items-center rounded-[4px] border border-[#2d3548] bg-[#1a1f2e] px-[10px] text-[12px] font-bold leading-4 text-[#87af87]">
            {badge}
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-[12px] leading-4 tracking-[0.2px] text-[#6b9bd1]">{body}</p>
    </div>
  );
}

function DesktopRow({
  row,
  locale,
}: {
  row: RisingRow;
  locale: string;
}) {
  const project = row.slug ? getProjectModel(row.slug) : null;
  const description = project
    ? pickText(locale, project.description)
    : locale === "ko"
      ? "경량 로그 파이프라인과 실행력 개선으로 점진적 상승을 이어가고 있습니다."
      : "A lightweight log pipeline showing steady gains through consistent execution.";

  const content = (
    <>
      <div className="px-5 py-8 text-[15px] font-bold leading-5 text-[#e2e8f0]">{row.rank}</div>
      <div className="flex min-w-0 flex-col justify-center gap-2 px-2 py-4">
        <div className="truncate text-[15px] font-bold leading-5 text-[#e2e8f0]">
          {locale === "ko" ? row.nameKo : row.nameEn}
        </div>
        <FoundationChip foundation={row.foundation} />
      </div>
      <div className="flex items-center justify-center text-[14px] font-bold leading-5 text-[#6b9bd1]">{row.attention.toFixed(1)}</div>
      <div className="flex items-center justify-center text-[14px] font-bold leading-5 text-[#af87d7]">{row.trust.toFixed(1)}</div>
      <div className="flex items-center justify-center text-[14px] font-bold leading-5 text-[#87af87]">{row.execution.toFixed(1)}</div>
      <div className="flex items-center justify-center">
        <ScoreBadge score={row.score} />
      </div>
      <div className="flex items-center justify-center">
        <DeltaBadge delta={row.delta} />
      </div>
      <div className="sr-only">{description}</div>
    </>
  );

  const className =
    "grid min-h-[86px] grid-cols-[68px_minmax(0,220px)_80px_80px_80px_100px_120px] border-b border-[#2d3548] transition hover:bg-[#111622]";

  if (row.slug) {
    return (
      <Link className={className} href={`/projects/${row.slug}`}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}

function MobileRow({
  row,
  locale,
  labels,
}: {
  row: RisingRow;
  locale: string;
  labels: {
    rank: string;
    project: string;
    attention: string;
    trust: string;
    execution: string;
    score: string;
    delta: string;
  };
}) {
  const project = row.slug ? getProjectModel(row.slug) : null;
  const description = project
    ? pickText(locale, project.description)
    : locale === "ko"
      ? "경량 로그 파이프라인과 실행력 개선으로 점진적 상승을 이어가고 있습니다."
      : "A lightweight log pipeline showing steady gains through consistent execution.";

  const content = (
    <div className="border-b border-[#2d3548] px-4 py-4 last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[13px] font-bold leading-4 text-[#e2e8f0]">#{row.rank}</p>
          <p className="mt-3 truncate text-[16px] font-bold leading-5 text-[#e2e8f0]">{locale === "ko" ? row.nameKo : row.nameEn}</p>
          <div className="mt-3">
            <FoundationChip foundation={row.foundation} />
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <ScoreBadge score={row.score} />
          <DeltaBadge delta={row.delta} />
        </div>
      </div>

      <p className="mt-4 text-[13px] leading-5 text-[#64748b]">{description}</p>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-[4px] border border-[#2d3548] bg-[#111622] px-3 py-2">
          <p className="text-[10px] uppercase leading-[15px] tracking-[1px] text-[#64748b]">{labels.attention}</p>
          <p className="mt-1 text-[15px] font-bold leading-5 text-[#6b9bd1]">{row.attention.toFixed(1)}</p>
        </div>
        <div className="rounded-[4px] border border-[#2d3548] bg-[#111622] px-3 py-2">
          <p className="text-[10px] uppercase leading-[15px] tracking-[1px] text-[#64748b]">{labels.trust}</p>
          <p className="mt-1 text-[15px] font-bold leading-5 text-[#af87d7]">{row.trust.toFixed(1)}</p>
        </div>
        <div className="rounded-[4px] border border-[#2d3548] bg-[#111622] px-3 py-2">
          <p className="text-[10px] uppercase leading-[15px] tracking-[1px] text-[#64748b]">{labels.execution}</p>
          <p className="mt-1 text-[15px] font-bold leading-5 text-[#87af87]">{row.execution.toFixed(1)}</p>
        </div>
      </div>
    </div>
  );

  if (row.slug) {
    return (
      <Link className="block transition hover:bg-[#111622]" href={`/projects/${row.slug}`}>
        {content}
      </Link>
    );
  }

  return content;
}

export function FigmaRisingPage() {
  const locale = useLocale();
  const copy = COPY[locale === "ko" ? "ko" : "en"];

  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 oss-frame">
      <div className="mx-auto w-full max-w-[1152px] px-4 pb-0 pt-0 md:px-6 xl:px-0">
        <section className="border-b border-[#2d3548] px-0 py-6">
          <p className="text-[13px] leading-5 text-[#64748b]">{copy.intro}</p>
        </section>

        <section className="border-b border-[#2d3548] py-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <RisingStatCard label={copy.stats.current} value="10" />
            <RisingStatCard label={copy.stats.window} value="7" accent={copy.stats.windowValue} />
            <RisingStatCard label={copy.stats.avgDelta} value="03:20" />
            <RisingStatCard label={copy.stats.topMover} value="74.9" accent={copy.stats.topMoverLabel} />
          </div>
        </section>

        <section className="grid gap-5 py-5 xl:grid-cols-[minmax(0,747px)_320px]">
          <section className="oss-panel overflow-hidden">
            <div className="border-b border-[#2d3548] px-5 pb-5 pt-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-[18px] font-bold leading-6 tracking-[-0.4px] text-[#e2e8f0]">{copy.board.title}</h2>
                  <p className="mt-1 text-[13px] leading-5 text-[#64748b]">{copy.board.subtitle}</p>
                </div>
                <span className="pt-[2px] text-[12px] uppercase leading-4 tracking-[0.6px] text-[#6b9bd1]">{copy.board.count}</span>
              </div>
            </div>

            <div className="hidden border-b border-[#2d3548] px-5 py-[14px] text-[12px] uppercase leading-4 tracking-[0.6px] text-[#64748b] md:grid md:grid-cols-[68px_minmax(0,220px)_80px_80px_80px_100px_120px]">
              <span>{copy.board.headers.rank}</span>
              <span>{copy.board.headers.project}</span>
              <span className="text-center">{copy.board.headers.attention}</span>
              <span className="text-center">{copy.board.headers.trust}</span>
              <span className="text-center">{copy.board.headers.execution}</span>
              <span className="text-center">{copy.board.headers.score}</span>
              <span className="text-center">{copy.board.headers.delta}</span>
            </div>

            <div className="hidden md:block">
              {risingRows.map((row) => (
                <DesktopRow key={`${row.rank}-${row.nameEn}`} locale={locale} row={row} />
              ))}
            </div>

            <div className="md:hidden">
              {risingRows.map((row) => (
                <MobileRow key={`${row.rank}-${row.nameEn}`} labels={copy.board.headers} locale={locale} row={row} />
              ))}
            </div>
          </section>

          <aside className="space-y-4">
            <section className="oss-panel overflow-hidden">
              {copy.insights.map((insight) => (
                <SidebarInsight
                  key={insight.title}
                  badge={"badge" in insight ? insight.badge : undefined}
                  body={insight.body}
                  title={insight.title}
                />
              ))}
            </section>

            <section className="oss-panel px-5 py-5">
              <h3 className="text-[15px] font-bold leading-[22.5px] text-[#e2e8f0]">{copy.focus.title}</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex h-7 items-center gap-[4px] rounded-[4px] border border-[#2d3548] bg-[#1a1f2e] px-[10px] text-[12px] font-bold leading-4 text-[#87af87]">
                  <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#87af87]" />
                  90.2
                </span>
                <span className="inline-flex h-7 items-center gap-[6px] rounded-[4px] border border-[#2d3548] bg-[#1a1f2e] px-[10px] text-[12px] font-bold leading-4 text-[#87af87]">
                  <TrendArrow />
                  +12.5%
                </span>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[12px] leading-4 text-[#64748b]">{copy.focus.labels.attention}</span>
                  <span className="text-[12px] font-bold leading-4 text-[#6b9bd1]">91.2</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[12px] leading-4 text-[#64748b]">{copy.focus.labels.trust}</span>
                  <span className="text-[12px] font-bold leading-4 text-[#af87d7]">89.5</span>
                </div>
              </div>
            </section>

            <section className="oss-panel px-5 py-5">
              <h3 className="text-[15px] font-bold leading-[22.5px] text-[#e2e8f0]">{copy.focus.coverage}</h3>
              <p className="mt-3 text-[13px] leading-5 text-[#64748b]">{copy.focus.coverageBody}</p>
            </section>
          </aside>
        </section>

        <section className="border-t border-[#2d3548] py-7">
          <div className="flex flex-col gap-3 text-[11px] uppercase leading-5 tracking-[0.6px] text-[#64748b] md:flex-row md:items-center md:justify-between">
            <p>GITHUB · CNCF DEVSTATS · API RELAY · DEPS.DEV</p>
            <p>© 2026 OSS LEADERBOARD</p>
          </div>
        </section>
      </div>
    </div>
  );
}
