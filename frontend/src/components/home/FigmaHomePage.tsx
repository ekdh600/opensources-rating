"use client";

import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";

type LocalizedText = {
  ko: string;
  en: string;
};

type StatCardItem = {
  label: LocalizedText;
  value: string;
  delta?: string;
  icon: "projects" | "new" | "commits" | "contributors";
};

type TableRow = {
  rank: number;
  trend?: "up" | "down";
  name: string;
  description: string;
  category: string;
  attention: number;
  execution: number;
  health: number;
  trust: number;
  score: number;
};

type TableVariant = "leaderboard" | "rising";

const COPY = {
  ko: {
    title: "OSS 리더보드 v2.0",
    subtitle: "한국어 우선 오픈소스 프로젝트 관측 플랫폼 · 다양한 지표로 프로젝트를 분석하고 평가합니다",
    propose: "제안하기",
    topTitle: "전체 순위",
    topSubtitle: "종합 점수 기준 상위 프로젝트",
    topAction: "전체 보기 →",
    averageTitle: "전체 평균",
    averageSubtitle: "커뮤니티 전체 프로젝트 평균",
    scoringTitle: "점수 기준",
    risingTitle: "급상승 프로젝트",
    risingSubtitle: "최근 30일 기준 순위 상승폭이 큰 프로젝트",
    risingAction: "전체 보기 →",
    headers: {
      project: "프로젝트",
      category: "카테고리",
      score: "SCORE",
    },
    metrics: {
      attention: "관심도",
      execution: "실행력",
      health: "건강도",
      trust: "신뢰도",
    },
    scoring: [
      { title: "관심도", body: "스타, 포크, 와치 등 커뮤니티 관심 지표" },
      { title: "실행력", body: "커밋 빈도, 릴리즈 주기 등 개발 활동" },
      { title: "건강도", body: "이슈 응답률, PR 처리 속도 등" },
      { title: "신뢰도", body: "문서 품질, 테스트 커버리지 등" },
    ],
  },
  en: {
    title: "OSS Leaderboard v2.0",
    subtitle: "A Korean-first open source observability platform that analyzes and scores projects through multiple signals.",
    propose: "Suggest",
    topTitle: "Leaderboard",
    topSubtitle: "Top projects by composite score",
    topAction: "View all →",
    averageTitle: "Global Average",
    averageSubtitle: "Community-wide project average",
    scoringTitle: "Scoring",
    risingTitle: "Rising Projects",
    risingSubtitle: "Projects with the sharpest rank gains in the last 30 days",
    risingAction: "View all →",
    headers: {
      project: "Project",
      category: "Category",
      score: "SCORE",
    },
    metrics: {
      attention: "Attention",
      execution: "Execution",
      health: "Health",
      trust: "Trust",
    },
    scoring: [
      { title: "Attention", body: "Community interest signals such as stars, forks, and buzz" },
      { title: "Execution", body: "Delivery activity such as commit tempo and release cadence" },
      { title: "Health", body: "Issue response rate, PR throughput, and maintenance quality" },
      { title: "Trust", body: "Documentation quality, tests, and reliability signals" },
    ],
  },
} as const;

const STAT_CARDS: StatCardItem[] = [
  {
    label: { ko: "전체 프로젝트", en: "Tracked Projects" },
    value: "2,847",
    delta: "+142",
    icon: "projects",
  },
  {
    label: { ko: "이번 주 신규", en: "New This Week" },
    value: "87",
    delta: "+12",
    icon: "new",
  },
  {
    label: { ko: "총 커밋 수", en: "Total Commits" },
    value: "1.2M",
    icon: "commits",
  },
  {
    label: { ko: "활성 기여자", en: "Active Contributors" },
    value: "45.2K",
    delta: "+2.3K",
    icon: "contributors",
  },
];

const TOP_ROWS: TableRow[] = [
  {
    rank: 1,
    name: "React",
    description: "A declarative, efficient, and flexible JavaScript library.",
    category: "Frontend",
    attention: 96,
    execution: 93,
    health: 92,
    trust: 95,
    score: 94,
  },
  {
    rank: 2,
    trend: "up",
    name: "Vue",
    description: "Progressive JavaScript framework for building user interfaces.",
    category: "Frontend",
    attention: 94,
    execution: 91,
    health: 90,
    trust: 93,
    score: 92,
  },
  {
    rank: 3,
    trend: "up",
    name: "Next.js",
    description: "The React Framework for Production - hybrid static and server rendering.",
    category: "Framework",
    attention: 95,
    execution: 90,
    health: 88,
    trust: 91,
    score: 91,
  },
  {
    rank: 4,
    trend: "down",
    name: "Svelte",
    description: "Cybernetically enhanced web apps - compile-time framework.",
    category: "Frontend",
    attention: 89,
    execution: 87,
    health: 88,
    trust: 88,
    score: 88,
  },
  {
    rank: 5,
    trend: "up",
    name: "Tailwind CSS",
    description: "A utility-first CSS framework for rapid UI development.",
    category: "CSS",
    attention: 92,
    execution: 85,
    health: 86,
    trust: 85,
    score: 87,
  },
];

const RISING_ROWS: TableRow[] = [
  {
    rank: 47,
    trend: "up",
    name: "Bun",
    description: "Incredibly fast JavaScript runtime, bundler, test runner, and package manager.",
    category: "Runtime",
    attention: 88,
    execution: 79,
    health: 80,
    trust: 81,
    score: 82,
  },
  {
    rank: 103,
    trend: "up",
    name: "Astro",
    description: "Build faster websites with less client-side JavaScript.",
    category: "Framework",
    attention: 84,
    execution: 76,
    health: 75,
    trust: 77,
    score: 78,
  },
  {
    rank: 156,
    trend: "up",
    name: "Hono",
    description: "Ultrafast web framework for the Edges.",
    category: "Backend",
    attention: 79,
    execution: 72,
    health: 73,
    trust: 72,
    score: 74,
  },
];

const AVERAGE_METRICS = [
  { key: "attention", value: 85, color: "#6b9bd1" },
  { key: "execution", value: 78, color: "#af87d7" },
  { key: "health", value: 82, color: "#87af87" },
  { key: "trust", value: 80, color: "#d7af5f" },
] as const;

function pick(locale: string, value: LocalizedText) {
  return locale === "ko" ? value.ko : value.en;
}

function ActionButton({ label }: { label: string }) {
  return (
    <Link
      href="/compare"
      className="font-figma-mono inline-flex h-8 min-w-[88px] items-center justify-center rounded-[4px] border border-[#87af87] bg-[rgba(135,175,135,0.1)] px-4 text-[12px] leading-4 tracking-[0.6px] text-[#87af87] transition hover:bg-[rgba(135,175,135,0.16)]"
    >
      {label}
    </Link>
  );
}

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
    <svg
      aria-hidden="true"
      height={size}
      viewBox="0 0 16 16"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8 3L12 8H9.5V13H6.5V8H4L8 3Z" fill={color} transform={rotation} />
    </svg>
  );
}

function ProjectsIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.5 3.5H10.5L12.5 5.5V12.5H3.5V3.5H5.5Z" stroke="currentColor" strokeWidth="1.1" />
      <path d="M10.5 3.5V5.5H12.5" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 3.5V12.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
      <path d="M3.5 8H12.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
    </svg>
  );
}

function CommitIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <rect x="2.5" y="8.2" width="2.2" height="4.3" rx="0.5" fill="currentColor" />
      <rect x="6.9" y="5.8" width="2.2" height="6.7" rx="0.5" fill="currentColor" />
      <rect x="11.3" y="3.5" width="2.2" height="9" rx="0.5" fill="currentColor" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <circle cx="6" cy="6" r="2" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="10.8" cy="6.8" r="1.6" stroke="currentColor" strokeWidth="1.1" />
      <path d="M2.8 12.5C3.2 10.7 4.5 9.8 6 9.8C7.5 9.8 8.8 10.7 9.2 12.5" stroke="currentColor" strokeWidth="1.1" />
      <path d="M9.6 12.3C9.9 11.2 10.8 10.5 11.9 10.5C13 10.5 13.8 11.2 14.1 12.3" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

function StatIcon({ icon }: { icon: StatCardItem["icon"] }) {
  const base = "flex h-9 w-9 items-center justify-center rounded-[4px] bg-[#1a1f2e] text-[#334155]";

  switch (icon) {
    case "projects":
      return (
        <div className={base}>
          <ProjectsIcon />
        </div>
      );
    case "new":
      return (
        <div className={base}>
          <PlusIcon />
        </div>
      );
    case "commits":
      return (
        <div className={base}>
          <CommitIcon />
        </div>
      );
    case "contributors":
      return (
        <div className={base}>
          <UsersIcon />
        </div>
      );
  }
}

function StatCard({ locale, item }: { locale: string; item: StatCardItem }) {
  return (
    <article className="oss-panel h-[123px] p-[17px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-figma-mono text-[10px] leading-[15px] tracking-[1px] text-[#64748b]">{pick(locale, item.label)}</p>
          <p className="font-figma-display mt-[8px] text-[30px] leading-[30px] tracking-[-0.75px] text-[#e2e8f0]">
            {item.value}
          </p>
          {item.delta ? (
            <div className="mt-3 inline-flex items-center gap-[6px] text-[#87af87]">
              <TrendArrow size={14} trend="up" />
              <span className="font-figma-display text-[16px] leading-6">{item.delta}</span>
            </div>
          ) : (
            <div className="mt-3 h-6" />
          )}
        </div>
        <StatIcon icon={item.icon} />
      </div>
    </article>
  );
}

function ScorePill({ score }: { score: number }) {
  const tone =
    score >= 80
      ? "bg-[#b4d59d] text-[#0a0e17] shadow-[0_0_10px_rgba(135,175,135,0.3)]"
      : "bg-[#f0ca69] text-[#0a0e17] shadow-[0_0_10px_rgba(215,175,95,0.3)]";

  return (
    <span
      className={`font-figma-mono inline-flex h-6 w-10 items-center justify-center rounded-[4px] text-[12px] font-bold leading-4 ${tone}`}
    >
      {score}
    </span>
  );
}

function CategoryChip({ category }: { category: string }) {
  return (
    <span className="font-figma-mono inline-flex h-[21px] items-center rounded-[4px] border border-[#2d3548] bg-[#1a1f2e] px-[8px] text-[10px] leading-[15px] tracking-[0.5px] text-[#64748b] uppercase">
      {category}
    </span>
  );
}

function MetricCell({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-[4px] border border-[#2d3548] bg-[#111622] px-3 py-2">
      <p className="font-figma-mono text-[10px] leading-[15px] tracking-[1px] uppercase" style={{ color }}>
        {label}
      </p>
      <p className="font-figma-mono mt-1 text-base font-bold text-[#e2e8f0]">{value}</p>
    </div>
  );
}

function TableSection({
  locale,
  title,
  subtitle,
  actionHref,
  actionLabel,
  rows,
  variant,
}: {
  locale: string;
  title: string;
  subtitle: string;
  actionHref: string;
  actionLabel: string;
  rows: TableRow[];
  variant: TableVariant;
}) {
  const copy = COPY[locale === "ko" ? "ko" : "en"];

  return (
    <section className="oss-panel overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-[#2d3548] px-5 pb-[15px] pt-[14px] md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="font-figma-display text-[22px] leading-[26.4px] text-[#e2e8f0]">{title}</h2>
          <p className="font-figma-mono mt-[2px] text-[12px] leading-4 tracking-[0.3px] text-[#64748b] uppercase">
            {subtitle}
          </p>
        </div>
        <Link
          href={actionHref}
          className="font-figma-mono text-[12px] leading-4 tracking-[0.6px] text-[#6b9bd1] uppercase transition hover:text-[#9fc1e7]"
        >
          {actionLabel}
        </Link>
      </div>

      <div className="md:hidden">
        {rows.map((row) => (
          <div key={`${title}-${row.rank}-${row.name}`} className="border-b border-[#2d3548] px-4 py-4 last:border-b-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-figma-mono flex items-center gap-2 text-[13px] text-[#e2e8f0]">
                  <span>{row.rank}</span>
                  <TrendArrow trend={row.trend} />
                </div>
                <p className="font-figma-body mt-2 text-base font-semibold text-[#e2e8f0]">{row.name}</p>
                <p className="font-figma-body mt-1 text-sm leading-6 text-[#64748b]">{row.description}</p>
                <div className="mt-3">
                  <CategoryChip category={row.category} />
                </div>
              </div>
              <ScorePill score={row.score} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <MetricCell color="#6b9bd1" label="INT" value={row.attention} />
              <MetricCell color="#af87d7" label="EXE" value={row.execution} />
              <MetricCell color="#87af87" label="HLT" value={row.health} />
              <MetricCell color="#d7af5f" label="TRS" value={row.trust} />
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full">
          <colgroup>
            {variant === "leaderboard" ? (
              <>
                <col style={{ width: "64px" }} />
                <col style={{ width: "271.328px" }} />
                <col style={{ width: "128px" }} />
              </>
            ) : (
              <>
                <col style={{ width: "77.203px" }} />
                <col style={{ width: "728.797px" }} />
                <col style={{ width: "128px" }} />
              </>
            )}
            <col style={{ width: "80px" }} />
            <col style={{ width: "80px" }} />
            <col style={{ width: "80px" }} />
            <col style={{ width: "80px" }} />
            <col style={{ width: "96px" }} />
          </colgroup>
          <thead>
            <tr className="h-[39.5px] border-b border-[#2d3548]">
              <th className="font-figma-mono px-4 py-3 text-left text-[10px] leading-[15px] tracking-[1px] text-[#64748b]">#</th>
              <th className="font-figma-mono px-4 py-3 text-left text-[10px] leading-[15px] tracking-[1px] text-[#64748b]">
                {copy.headers.project}
              </th>
              <th className="font-figma-mono px-4 py-3 text-left text-[10px] leading-[15px] tracking-[1px] text-[#64748b]">
                {copy.headers.category}
              </th>
              <th className="font-figma-mono px-4 py-3 text-center text-[10px] leading-[15px] tracking-[1px] text-[#6b9bd1]">
                INT
              </th>
              <th className="font-figma-mono px-4 py-3 text-center text-[10px] leading-[15px] tracking-[1px] text-[#af87d7]">
                EXE
              </th>
              <th className="font-figma-mono px-4 py-3 text-center text-[10px] leading-[15px] tracking-[1px] text-[#87af87]">
                HLT
              </th>
              <th className="font-figma-mono px-4 py-3 text-center text-[10px] leading-[15px] tracking-[1px] text-[#d7af5f]">
                TRS
              </th>
              <th className="font-figma-mono px-4 py-3 text-right text-[10px] leading-[15px] tracking-[1px] text-[#64748b]">
                {copy.headers.score}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${title}-${row.rank}-${row.name}`} className="h-[71px] border-b border-[#2d3548] last:border-b-0">
                <td className="px-4 align-middle">
                  <div className="font-figma-mono flex items-center gap-2 text-[14px] font-bold leading-5 text-[#e2e8f0]">
                    <span>{row.rank}</span>
                    <TrendArrow trend={row.trend} />
                  </div>
                </td>
                <td className="px-4 align-middle">
                  <p className="font-figma-body text-[16px] font-semibold leading-6 text-[#e2e8f0]">{row.name}</p>
                  <p className="font-figma-body overflow-hidden text-ellipsis whitespace-nowrap text-[12px] leading-4 text-[#64748b]">
                    {row.description}
                  </p>
                </td>
                <td className="px-4 align-middle">
                  <CategoryChip category={row.category} />
                </td>
                <td className="font-figma-mono px-4 text-center text-[14px] font-bold leading-5 text-[#6b9bd1]">{row.attention}</td>
                <td className="font-figma-mono px-4 text-center text-[14px] font-bold leading-5 text-[#af87d7]">{row.execution}</td>
                <td className="font-figma-mono px-4 text-center text-[14px] font-bold leading-5 text-[#87af87]">{row.health}</td>
                <td className="font-figma-mono px-4 text-center text-[14px] font-bold leading-5 text-[#d7af5f]">{row.trust}</td>
                <td className="px-4 align-middle text-right">
                  <div className="flex justify-end">
                    <ScorePill score={row.score} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MetricBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const activeBlocks = Math.max(0, Math.min(20, Math.round(value / 5)));
  const inactiveBlocks = 20 - activeBlocks;

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="font-figma-body text-[12px] leading-4 text-[#64748b]">{label}</span>
        <span className="font-figma-mono text-[14px] font-bold leading-5" style={{ color }}>
          {value}
        </span>
      </div>
      <div className="mt-1 h-6 overflow-hidden">
        <div className="font-figma-mono text-[16px] leading-5 tracking-[0.2px]" style={{ color }}>
          <span>{"█".repeat(activeBlocks)}</span>
          <span className="opacity-35">{"░".repeat(inactiveBlocks)}</span>
        </div>
      </div>
      <div className="font-figma-mono flex items-center justify-between text-[10px] leading-[15px] text-[#64748b]">
        <span>0</span>
        <span>100</span>
      </div>
    </div>
  );
}

function AveragePanel({ locale }: { locale: string }) {
  const copy = COPY[locale === "ko" ? "ko" : "en"];

  return (
    <section className="oss-panel overflow-hidden">
      <div className="border-b border-[#2d3548] px-5 pb-[15px] pt-[14px]">
        <h2 className="font-figma-display text-[22px] leading-[26.4px] text-[#e2e8f0]">{copy.averageTitle}</h2>
        <p className="font-figma-mono mt-[2px] text-[12px] leading-4 tracking-[0.3px] text-[#64748b] uppercase">
          {copy.averageSubtitle}
        </p>
      </div>
      <div className="space-y-[18px] px-5 py-5">
        {AVERAGE_METRICS.map((metric) => (
          <MetricBar
            key={metric.key}
            label={copy.metrics[metric.key]}
            value={metric.value}
            color={metric.color}
          />
        ))}
      </div>
    </section>
  );
}

function ScoringPanel({ locale }: { locale: string }) {
  const copy = COPY[locale === "ko" ? "ko" : "en"];
  const colors = ["#6b9bd1", "#af87d7", "#87af87", "#d7af5f"];

  return (
    <section className="oss-panel overflow-hidden">
      <div className="border-b border-[#2d3548] px-5 pb-[15px] pt-[14px]">
        <h2 className="font-figma-display text-[22px] leading-[26.4px] text-[#e2e8f0]">{copy.scoringTitle}</h2>
      </div>
      <div className="space-y-3 px-5 py-5">
        {copy.scoring.map((item, index) => (
          <div key={item.title} className="flex gap-3">
            <span
              aria-hidden="true"
              className="mt-1.5 h-[6px] w-[6px] rounded-full"
              style={{ backgroundColor: colors[index] }}
            />
            <div>
              <p className="font-figma-body text-[13px] font-semibold leading-4 text-[#e2e8f0]">{item.title}</p>
              <p className="font-figma-body mt-[2px] text-[12px] leading-[19.5px] text-[#64748b]">{item.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FigmaHomePage() {
  const locale = useLocale();
  const copy = COPY[locale === "ko" ? "ko" : "en"];

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
              <p className="font-figma-body mt-[6px] max-w-[672px] text-[12px] leading-[19.5px] text-[#64748b]">
                {copy.subtitle}
              </p>
            </div>
            <ActionButton label={copy.propose} />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-4 py-6 md:px-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {STAT_CARDS.map((item) => (
            <StatCard key={item.icon} locale={locale} item={item} />
          ))}
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,921px)_minmax(0,451px)]">
          <TableSection
            locale={locale}
            title={copy.topTitle}
            subtitle={copy.topSubtitle}
            actionHref="/ranking"
            actionLabel={copy.topAction}
            rows={TOP_ROWS}
            variant="leaderboard"
          />
          <div className="space-y-5">
            <AveragePanel locale={locale} />
            <ScoringPanel locale={locale} />
          </div>
        </section>

        <div className="mt-6 pb-6">
          <TableSection
            locale={locale}
            title={copy.risingTitle}
            subtitle={copy.risingSubtitle}
            actionHref="/rising"
            actionLabel={copy.risingAction}
            rows={RISING_ROWS}
            variant="rising"
          />
        </div>
      </div>
    </div>
  );
}
