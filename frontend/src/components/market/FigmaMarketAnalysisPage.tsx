"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { MarketPanel } from "@/components/market/MarketUi";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

type MarketLocale = "ko" | "en";
type Localized = Record<MarketLocale, string>;
type Tone = "up" | "down" | "neutral";

type Row = { rank: string; name: string; category: string; score: string; change: string; href: string };

type Insight = {
  title: Localized;
  body: Localized;
  tone: Tone;
  tags: string[];
};

type Report = {
  id: string;
  kind: string;
  readTime: string;
  title: Localized;
  body: Localized;
  date: string;
  analyst: string;
  tone: Tone;
  focus: string[];
  thesis: Localized;
  highlights: Localized[];
  risks: Localized[];
  actions: Array<{ label: Localized; href: string }>;
};

type Event = {
  id: string;
  day: string;
  month: Localized;
  title: string;
  subtitle: Localized;
  impact: Localized;
  tone: Tone;
  dateLabel: Localized;
  countdown: Localized;
  status: Localized;
  description: Localized;
  watch: Localized[];
  affected: string[];
  actions: Array<{ label: Localized; href: string }>;
};

interface TradingQuoteApi {
  slug: string;
  name: string;
  category: string | null;
  current_price: number;
  change_rate: number;
  rank_global: number | null;
  score_date: string;
}

interface LeaderboardEntryApi {
  rank: number;
  total_score: number;
  attention_score: number;
  execution_score: number;
  health_score: number;
  trust_score: number;
  project: {
    slug: string;
    display_name_ko: string | null;
    display_name_en: string | null;
    category?: {
      slug: string;
      name_ko: string;
      name_en: string;
    } | null;
  };
}

interface CompareItemApi {
  project: {
    slug: string;
    display_name_ko: string | null;
    display_name_en: string | null;
    category?: {
      name_ko: string;
      name_en: string;
    } | null;
  };
  latest_score?: {
    total_score: number;
    attention_score: number;
    execution_score: number;
    health_score: number;
    trust_score: number;
  } | null;
  stars_total?: number | null;
  contributors_30d?: number | null;
  commits_30d?: number | null;
}

interface SeasonApi {
  name: string;
  end_date: string;
}

const COPY = {
  ko: {
    title: "시장 분석",
    description: "실시간 리더보드, 추세 점수, 비교 데이터 기반으로 OSS 시장 흐름을 정리합니다.",
    briefingTitle: "시장 브리핑",
    keyPoints: "주요 요약",
    insightsTitle: "오늘의 인사이트",
    gainersTitle: "오늘의 상승 종목",
    losersTitle: "오늘의 하락 종목",
    reportsTitle: "실시간 리서치 리포트",
    reportsDesc: "현재 API 데이터로 자동 생성한 리포트입니다.",
    eventsTitle: "주요 관찰 이벤트",
    eventsDesc: "시즌 일정과 점수 변화 기준으로 지금 바로 볼 지점을 정리했습니다.",
    analyst: "담당 분석",
    focus: "주요 커버리지",
    thesis: "핵심 논지",
    highlights: "핵심 포인트",
    risks: "리스크 요인",
    affected: "영향 종목",
    watch: "관찰 포인트",
    actions: "바로가기",
    status: "상태",
    loading: "분석 데이터를 불러오는 중입니다.",
    errorPrefix: "분석 데이터 반영 중 문제가 발생했습니다.",
    bullish: "강세",
    bearish: "약세",
    neutral: "중립",
    analyses: "오늘의 분석",
    gainers: "상승 종목",
    losers: "하락 종목",
    watchItems: "관찰 항목",
  },
  en: {
    title: "Market Analysis",
    description: "Summarize OSS market flow from live leaderboards, score trends, and comparison data.",
    briefingTitle: "Market Briefing",
    keyPoints: "Key points",
    insightsTitle: "Today's insights",
    gainersTitle: "Today's gainers",
    losersTitle: "Today's decliners",
    reportsTitle: "Live research reports",
    reportsDesc: "These reports are generated from the current API data.",
    eventsTitle: "Watch events",
    eventsDesc: "What to watch now based on season timing and score movement.",
    analyst: "Analyst",
    focus: "Coverage",
    thesis: "Core thesis",
    highlights: "Highlights",
    risks: "Risks",
    affected: "Impacted names",
    watch: "Watch items",
    actions: "Quick actions",
    status: "Status",
    loading: "Loading market analysis.",
    errorPrefix: "There was a problem loading market analysis.",
    bullish: "Bullish",
    bearish: "Bearish",
    neutral: "Neutral",
    analyses: "Today's analyses",
    gainers: "Advancing names",
    losers: "Declining names",
    watchItems: "Watch items",
  },
} as const;

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function toneFromChange(value: number): Tone {
  if (value > 0.001) {
    return "up";
  }
  if (value < -0.001) {
    return "down";
  }
  return "neutral";
}

function formatScore(value: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number) {
  if (Math.abs(value) < 0.001) {
    return "0.00%";
  }
  return `${value > 0 ? "+" : "-"}${Math.abs(value).toFixed(2)}%`;
}

function formatDateLabel(value: string) {
  const date = new Date(value);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

function formatCountdown(endDate: string, locale: MarketLocale) {
  const today = new Date();
  const target = new Date(endDate);
  const diff = Math.max(0, Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  return locale === "ko" ? `D-${diff}` : `D-${diff}`;
}

function projectName(project: LeaderboardEntryApi["project"], locale: MarketLocale) {
  return locale === "ko"
    ? project.display_name_ko || project.display_name_en || project.slug
    : project.display_name_en || project.display_name_ko || project.slug;
}

function compareProjectName(item: CompareItemApi["project"], locale: MarketLocale) {
  return locale === "ko"
    ? item.display_name_ko || item.display_name_en || item.slug
    : item.display_name_en || item.display_name_ko || item.slug;
}

function toMovementRow(quote: TradingQuoteApi): Row {
  return {
    rank: `#${quote.rank_global ?? "-"}`,
    name: quote.name,
    category: quote.category ?? "Other",
    score: formatScore(quote.current_price),
    change: formatPercent(quote.change_rate),
    href: `/market/trading/${quote.slug}`,
  };
}

function SectionHeading({ title }: { title: string }) {
  return <h2 className="text-[16px] font-semibold leading-6 text-[#d1d4dc]">{title}</h2>;
}

function TonePill({ label, tone }: { label: string; tone: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex h-[18px] items-center rounded-[4px] px-2 text-[9px] leading-[13.5px]",
        tone === "up" && "bg-[rgba(200,74,49,0.1)] text-[#c84a31]",
        tone === "down" && "bg-[rgba(18,97,196,0.1)] text-[#1261c4]",
        tone === "neutral" && "bg-[rgba(132,142,156,0.1)] text-[#848e9c]",
      )}
    >
      {label}
    </span>
  );
}

function BulletList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-[#a7b0bd]">{title}</p>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li key={`${title}-${item}`} className="flex items-start gap-2 text-[12px] leading-5 text-[#d1d4dc]">
            <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[#3366ff]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MovementTable({ title, rows, tone }: { title: string; rows: Row[]; tone: Tone }) {
  return (
    <MarketPanel className="overflow-hidden">
      <div className="border-b border-[#2b2f36] px-4 py-3">
        <h3 className="text-[14px] font-semibold text-[#d1d4dc]">{title}</h3>
      </div>
      {rows.map((row) => (
        <Link
          key={`${title}-${row.name}`}
          className="grid grid-cols-[44px_minmax(0,1fr)_64px] items-center gap-3 border-b border-[#2b2f36] px-4 py-3 transition hover:bg-[rgba(255,255,255,0.02)] last:border-b-0"
          href={row.href}
        >
          <span className="text-[11px] text-[#848e9c]">{row.rank}</span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-[#d1d4dc]">{row.name}</p>
            <p className="mt-1 truncate text-[10px] text-[#848e9c]">{row.category}</p>
          </div>
          <div className="text-right">
            <p className="text-[13px] text-[#d1d4dc]">{row.score}</p>
            <p className={cn("mt-1 text-[10px]", tone === "up" ? "text-[#c84a31]" : "text-[#1261c4]")}>{row.change}</p>
          </div>
        </Link>
      ))}
    </MarketPanel>
  );
}

export function FigmaMarketAnalysisPage() {
  const locale = (useLocale() === "ko" ? "ko" : "en") as MarketLocale;
  const text = COPY[locale];
  const [quotes, setQuotes] = useState<TradingQuoteApi[]>([]);
  const [globalEntries, setGlobalEntries] = useState<LeaderboardEntryApi[]>([]);
  const [cncfEntries, setCncfEntries] = useState<LeaderboardEntryApi[]>([]);
  const [risingEntries, setRisingEntries] = useState<LeaderboardEntryApi[]>([]);
  const [season, setSeason] = useState<SeasonApi | null>(null);
  const [comparison, setComparison] = useState<CompareItemApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportId, setReportId] = useState("overall");
  const [eventId, setEventId] = useState("season");

  useEffect(() => {
    let cancelled = false;

    async function loadAnalysis() {
      setLoading(true);
      setError(null);

      try {
        const [quoteRows, globalBoard, cncfBoard, risingBoard, currentSeason, compareData] = await Promise.all([
          api.trading.quotes(12),
          api.leaderboards.global({ page_size: "8" }),
          api.leaderboards.cncf({ page_size: "8" }),
          api.leaderboards.rising({ page_size: "6" }),
          api.seasons.current(),
          api.compare(["kubernetes", "prometheus", "argo-cd"]),
        ]);

        if (cancelled) {
          return;
        }

        setQuotes(Array.isArray(quoteRows) ? (quoteRows as TradingQuoteApi[]) : []);
        setGlobalEntries(Array.isArray(globalBoard?.entries) ? (globalBoard.entries as LeaderboardEntryApi[]) : []);
        setCncfEntries(Array.isArray(cncfBoard?.entries) ? (cncfBoard.entries as LeaderboardEntryApi[]) : []);
        setRisingEntries(Array.isArray(risingBoard?.entries) ? (risingBoard.entries as LeaderboardEntryApi[]) : []);
        setSeason((currentSeason as SeasonApi) ?? null);
        setComparison(Array.isArray(compareData?.items) ? (compareData.items as CompareItemApi[]) : []);
      } catch (loadError) {
        if (cancelled) {
          return;
        }
        setError(loadError instanceof Error ? loadError.message : "분석 데이터를 불러오지 못했습니다.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadAnalysis();

    return () => {
      cancelled = true;
    };
  }, []);

  const positiveCount = quotes.filter((quote) => quote.change_rate > 0).length;
  const negativeCount = quotes.filter((quote) => quote.change_rate < 0).length;
  const averageChange = average(quotes.map((quote) => quote.change_rate));
  const sortedByChange = useMemo(
    () => [...quotes].sort((left, right) => right.change_rate - left.change_rate),
    [quotes],
  );
  const topGainers = sortedByChange.slice(0, 5).map(toMovementRow);
  const topLosers = [...sortedByChange].reverse().slice(0, 5).map(toMovementRow);
  const strongestQuote = sortedByChange[0];
  const weakestQuote = [...sortedByChange].reverse()[0];

  const categoryLeaders = useMemo(() => {
    const groups = new Map<string, TradingQuoteApi[]>();
    quotes.forEach((quote) => {
      const key = quote.category ?? (locale === "ko" ? "기타" : "Other");
      groups.set(key, [...(groups.get(key) ?? []), quote]);
    });
    return [...groups.entries()]
      .map(([category, rows]) => ({
        category,
        averageChange: average(rows.map((row) => row.change_rate)),
        names: rows.map((row) => row.name),
      }))
      .sort((left, right) => right.averageChange - left.averageChange);
  }, [locale, quotes]);

  const strongestCategory = categoryLeaders[0];
  const weakestCategory = [...categoryLeaders].reverse()[0];
  const marketTone = toneFromChange(averageChange);
  const latestDate = quotes[0]?.score_date ?? new Date().toISOString().slice(0, 10);

  const briefingPoints = useMemo(() => {
    return [
      locale === "ko"
        ? `상승 종목 ${positiveCount}개, 하락 종목 ${negativeCount}개로 시장 폭은 ${positiveCount >= negativeCount ? "우호적" : "방어적"}입니다.`
        : `${positiveCount} advancing names versus ${negativeCount} decliners keeps breadth ${positiveCount >= negativeCount ? "constructive" : "defensive"}.`,
      strongestCategory
        ? locale === "ko"
          ? `${strongestCategory.category} 카테고리가 평균 ${formatPercent(strongestCategory.averageChange)}로 가장 강합니다.`
          : `${strongestCategory.category} leads with an average move of ${formatPercent(strongestCategory.averageChange)}.`
        : locale === "ko"
          ? "카테고리 강세 데이터가 아직 없습니다."
          : "No category breadth data is available yet.",
      strongestQuote && weakestQuote
        ? locale === "ko"
          ? `${strongestQuote.name} 강세와 ${weakestQuote.name} 약세가 오늘 변동성의 중심입니다.`
          : `${strongestQuote.name} on the upside and ${weakestQuote.name} on the downside are driving today's dispersion.`
        : locale === "ko"
          ? "대표 종목 변동 정보가 아직 없습니다."
          : "Lead movers are not available yet.",
    ];
  }, [locale, negativeCount, positiveCount, strongestCategory, strongestQuote, weakestQuote]);

  const insights = useMemo<Insight[]>(() => {
    return [
      {
        title: {
          ko: strongestCategory ? `${strongestCategory.category} 섹터 강세` : "섹터 강세 대기",
          en: strongestCategory ? `${strongestCategory.category} leads the tape` : "Sector leadership pending",
        },
        body: {
          ko: strongestCategory
            ? `${strongestCategory.category} 카테고리는 평균 ${formatPercent(strongestCategory.averageChange)}로 가장 높은 상대 강도를 보이고 있습니다.`
            : "카테고리 리더십을 계산할 데이터가 아직 충분하지 않습니다.",
          en: strongestCategory
            ? `${strongestCategory.category} is showing the strongest relative move at ${formatPercent(strongestCategory.averageChange)} on average.`
            : "There is not enough data yet to rank category leadership.",
        },
        tone: strongestCategory ? toneFromChange(strongestCategory.averageChange) : "neutral",
        tags: strongestCategory?.names.slice(0, 3) ?? [],
      },
      {
        title: {
          ko: strongestQuote ? `${strongestQuote.name} 모멘텀 확대` : "모멘텀 관찰 중",
          en: strongestQuote ? `${strongestQuote.name} expands momentum` : "Momentum watch",
        },
        body: {
          ko: strongestQuote
            ? `${strongestQuote.name}는 오늘 ${formatPercent(strongestQuote.change_rate)} 움직이며 단기 모멘텀을 주도하고 있습니다.`
            : "상승 주도 종목 데이터가 아직 없습니다.",
          en: strongestQuote
            ? `${strongestQuote.name} is leading short-term momentum with a move of ${formatPercent(strongestQuote.change_rate)} today.`
            : "Leader data is not available yet.",
        },
        tone: strongestQuote ? toneFromChange(strongestQuote.change_rate) : "neutral",
        tags: risingEntries.slice(0, 3).map((entry) => projectName(entry.project, locale)),
      },
      {
        title: {
          ko: weakestCategory ? `${weakestCategory.category} 약세 점검` : "약세 섹터 점검",
          en: weakestCategory ? `${weakestCategory.category} lags` : "Lagging sector check",
        },
        body: {
          ko: weakestCategory
            ? `${weakestCategory.category} 카테고리는 평균 ${formatPercent(weakestCategory.averageChange)}로 가장 약한 흐름입니다.`
            : "약세 카테고리를 식별할 데이터가 아직 부족합니다.",
          en: weakestCategory
            ? `${weakestCategory.category} is the weakest group with an average move of ${formatPercent(weakestCategory.averageChange)}.`
            : "There is not enough data yet to identify the weakest category.",
        },
        tone: weakestCategory ? toneFromChange(weakestCategory.averageChange) : "neutral",
        tags: weakestCategory?.names.slice(0, 3) ?? [],
      },
      {
        title: {
          ko: "시장 폭과 리더십",
          en: "Breadth and leadership",
        },
        body: {
          ko: `전체 평균 변동률은 ${formatPercent(averageChange)}이며, 상위 글로벌 리더는 ${globalEntries.slice(0, 3).map((entry) => projectName(entry.project, locale)).join(", ")}입니다.`,
          en: `Average market move is ${formatPercent(averageChange)}, while the global leaders are ${globalEntries.slice(0, 3).map((entry) => projectName(entry.project, locale)).join(", ")}.`,
        },
        tone: marketTone,
        tags: globalEntries.slice(0, 3).map((entry) => projectName(entry.project, locale)),
      },
    ];
  }, [averageChange, globalEntries, locale, marketTone, risingEntries, strongestCategory, strongestQuote, weakestCategory]);

  const reports = useMemo<Report[]>(() => {
    const globalFocus = globalEntries.slice(0, 4).map((entry) => projectName(entry.project, locale));
    const cncfFocus = cncfEntries.slice(0, 4).map((entry) => projectName(entry.project, locale));
    const compareFocus = comparison.slice(0, 3).map((item) => compareProjectName(item.project, locale));
    const compareLeader = comparison
      .filter((item) => item.latest_score)
      .sort((left, right) => (right.latest_score?.total_score ?? 0) - (left.latest_score?.total_score ?? 0))[0];

    return [
      {
        id: "overall",
        kind: "Live Brief",
        readTime: locale === "ko" ? "5분" : "5 min",
        title: {
          ko: "실시간 OSS 시장 리더십 보고서",
          en: "Live OSS Leadership Report",
        },
        body: {
          ko: `글로벌 리더보드와 실시간 호가 기준으로 현재 시장 리더십과 약세 구간을 정리한 보고서입니다.`,
          en: "A live view of market leadership and weak pockets from the global board and latest quotes.",
        },
        date: formatDateLabel(latestDate),
        analyst: "Codex Market Engine",
        tone: marketTone,
        focus: globalFocus,
        thesis: {
          ko: strongestCategory
            ? `${strongestCategory.category}가 시장 주도 섹터이며, 평균 변동률 ${formatPercent(strongestCategory.averageChange)}가 전체 시장 대비 강합니다.`
            : "시장 주도 섹터를 판단할 데이터가 아직 부족합니다.",
          en: strongestCategory
            ? `${strongestCategory.category} is the lead group, outperforming the market with an average move of ${formatPercent(strongestCategory.averageChange)}.`
            : "There is not enough data to determine the lead group yet.",
        },
        highlights: [
          {
            ko: `${globalFocus.join(", ")}가 현재 글로벌 상위권을 형성하고 있습니다.`,
            en: `${globalFocus.join(", ")} currently define the top of the global board.`,
          },
          {
            ko: `상승 종목 ${positiveCount}개, 하락 종목 ${negativeCount}개로 시장 폭은 ${positiveCount >= negativeCount ? "우호적" : "불안정"}입니다.`,
            en: `Breadth sits at ${positiveCount} advancers versus ${negativeCount} decliners.`,
          },
        ],
        risks: [
          {
            ko: weakestCategory ? `${weakestCategory.category} 약세가 인접 섹터로 번지면 단기 조정이 커질 수 있습니다.` : "하위 섹터 약세가 확대되면 지수 피로도가 커질 수 있습니다.",
            en: weakestCategory ? `Further weakness in ${weakestCategory.category} could spread and deepen any pullback.` : "Weak pockets could spread and raise index fatigue.",
          },
          {
            ko: `상승 종목 수가 줄면 현재 리더십이 일부 종목에만 집중될 수 있습니다.`,
            en: "If breadth narrows, leadership may become too concentrated in a few names.",
          },
        ],
        actions: globalEntries.slice(0, 2).map((entry) => ({
          label: {
            ko: `${projectName(entry.project, locale)} 보기`,
            en: `Open ${projectName(entry.project, locale)}`,
          },
          href: `/market/trading/${entry.project.slug}`,
        })),
      },
      {
        id: "cncf",
        kind: "CNCF Pulse",
        readTime: locale === "ko" ? "6분" : "6 min",
        title: {
          ko: "CNCF 핵심 종목 모멘텀 점검",
          en: "CNCF Momentum Check",
        },
        body: {
          ko: "CNCF 리더보드와 급상승 랭킹으로 현재 재단 핵심 종목의 상대 강도를 정리했습니다.",
          en: "A CNCF-specific read on relative strength using the foundation board and rising list.",
        },
        date: formatDateLabel(latestDate),
        analyst: "Foundation Flow Desk",
        tone: toneFromChange(average(cncfEntries.slice(0, 5).map((entry) => entry.total_score))),
        focus: cncfFocus,
        thesis: {
          ko: cncfFocus.length > 0
            ? `${cncfFocus.join(", ")}가 CNCF 상위권을 유지하며 재단 내 리더십을 형성하고 있습니다.`
            : "CNCF 리더십을 해석할 데이터가 아직 부족합니다.",
          en: cncfFocus.length > 0
            ? `${cncfFocus.join(", ")} are defining leadership inside the CNCF complex.`
            : "There is not enough data to interpret CNCF leadership yet.",
        },
        highlights: [
          {
            ko: `급상승 상위권에는 ${risingEntries.slice(0, 3).map((entry) => projectName(entry.project, locale)).join(", ")}가 포함됩니다.`,
            en: `The rising board includes ${risingEntries.slice(0, 3).map((entry) => projectName(entry.project, locale)).join(", ")} near the top.`,
          },
          {
            ko: `CNCF 상위 종목 평균 점수는 ${formatScore(average(cncfEntries.map((entry) => entry.total_score)))}입니다.`,
            en: `Average score across leading CNCF names is ${formatScore(average(cncfEntries.map((entry) => entry.total_score)))}.`,
          },
        ],
        risks: [
          {
            ko: "재단 내 점수 격차가 커질수록 특정 리더 종목 의존도가 높아질 수 있습니다.",
            en: "A wider score gap inside CNCF can overconcentrate leadership.",
          },
          {
            ko: "급상승 랭킹 상위권이 빠르게 바뀌면 단기 추세 신뢰도가 낮아질 수 있습니다.",
            en: "Rapid turnover in the rising board can weaken short-term trend confidence.",
          },
        ],
        actions: cncfEntries.slice(0, 2).map((entry) => ({
          label: {
            ko: `${projectName(entry.project, locale)} 보기`,
            en: `Open ${projectName(entry.project, locale)}`,
          },
          href: `/market/trading/${entry.project.slug}`,
        })),
      },
      {
        id: "compare",
        kind: "Compare Snapshot",
        readTime: locale === "ko" ? "4분" : "4 min",
        title: {
          ko: "대표 종목 비교 스냅샷",
          en: "Core Name Comparison Snapshot",
        },
        body: {
          ko: "Kubernetes, Prometheus, Argo CD를 동일 기준 점수와 활동성으로 비교한 요약입니다.",
          en: "A same-basis comparison of Kubernetes, Prometheus, and Argo CD on scores and activity.",
        },
        date: formatDateLabel(latestDate),
        analyst: "Comparison Engine",
        tone: "neutral",
        focus: compareFocus,
        thesis: {
          ko: compareLeader
            ? `${compareProjectName(compareLeader.project, locale)}가 비교 그룹에서 가장 높은 종합 점수를 기록하고 있습니다.`
            : "비교 그룹 리더를 판단할 데이터가 아직 없습니다.",
          en: compareLeader
            ? `${compareProjectName(compareLeader.project, locale)} currently posts the highest total score in the comparison set.`
            : "There is not enough data to determine the leader in the comparison set yet.",
        },
        highlights: comparison.slice(0, 2).map((item) => ({
          ko: `${compareProjectName(item.project, locale)}는 점수 ${formatScore(item.latest_score?.total_score ?? 0)}, 최근 30일 커밋 ${item.commits_30d ?? 0}건입니다.`,
          en: `${compareProjectName(item.project, locale)} shows a score of ${formatScore(item.latest_score?.total_score ?? 0)} with ${item.commits_30d ?? 0} commits over 30 days.`,
        })),
        risks: [
          {
            ko: "동일 비교군이라도 카테고리와 생태계가 달라 단순 순위 해석은 왜곡될 수 있습니다.",
            en: "Cross-category comparisons can overstate a simple rank ordering.",
          },
          {
            ko: "활동성 지표가 높아도 건강도와 신뢰도가 동반되지 않으면 지속 강세로 이어지지 않을 수 있습니다.",
            en: "High activity without health and trust confirmation may not sustain strength.",
          },
        ],
        actions: comparison.slice(0, 2).map((item) => ({
          label: {
            ko: `${compareProjectName(item.project, locale)} 보기`,
            en: `Open ${compareProjectName(item.project, locale)}`,
          },
          href: `/market/trading/${item.project.slug}`,
        })),
      },
    ];
  }, [averageChange, cncfEntries, comparison, globalEntries, latestDate, locale, marketTone, negativeCount, positiveCount, risingEntries, strongestCategory, weakestCategory]);

  const events = useMemo<Event[]>(() => {
    const seasonFocus = globalEntries.slice(0, 4).map((entry) => projectName(entry.project, locale));
    const risingFocus = risingEntries.slice(0, 4).map((entry) => projectName(entry.project, locale));
    const rotationFocus = strongestCategory?.names.slice(0, 2).concat(weakestCategory?.names.slice(0, 2) ?? []) ?? [];

    return [
      {
        id: "season",
        day: season ? String(new Date(season.end_date).getDate()).padStart(2, "0") : "--",
        month: season
          ? {
              ko: `${new Date(season.end_date).getMonth() + 1}월`,
              en: new Date(season.end_date).toLocaleString("en-US", { month: "short" }),
            }
          : { ko: "-", en: "-" },
        title: season ? `${season.name} 정산 구간` : locale === "ko" ? "시즌 정산 대기" : "Season watch",
        subtitle: {
          ko: "현재 시즌 종료일까지 남은 기간과 상위 종목 흐름 점검",
          en: "Track the remaining window and current leadership into settlement.",
        },
        impact: { ko: "높은 영향", en: "High impact" },
        tone: marketTone,
        dateLabel: {
          ko: season ? formatDateLabel(season.end_date) : "-",
          en: season ? formatDateLabel(season.end_date) : "-",
        },
        countdown: {
          ko: season ? formatCountdown(season.end_date, locale) : "D-0",
          en: season ? formatCountdown(season.end_date, locale) : "D-0",
        },
        status: {
          ko: marketTone === "up" ? "리더십 유지 구간" : marketTone === "down" ? "방어적 관리 구간" : "방향성 탐색 구간",
          en: marketTone === "up" ? "Leadership holding" : marketTone === "down" ? "Defensive management" : "Direction search",
        },
        description: {
          ko: "현재 시즌 종료일까지 남은 기간 동안 상위 종목 집중도와 시장 폭 변화가 핵심 체크 포인트입니다.",
          en: "Into season end, concentration in top names and changes in breadth are the main checkpoints.",
        },
        watch: [
          {
            ko: "상위 랭크 종목 집중도 확대 여부",
            en: "Whether leadership concentration expands",
          },
          {
            ko: "상승 종목 수 유지 여부",
            en: "Whether the number of advancers holds",
          },
          {
            ko: "약세 카테고리 반등 여부",
            en: "Whether lagging groups stabilize",
          },
        ],
        affected: seasonFocus,
        actions: globalEntries.slice(0, 2).map((entry) => ({
          label: {
            ko: `${projectName(entry.project, locale)} 보기`,
            en: `Open ${projectName(entry.project, locale)}`,
          },
          href: `/market/trading/${entry.project.slug}`,
        })),
      },
      {
        id: "rising",
        day: latestDate.slice(-2),
        month: {
          ko: `${Number(latestDate.slice(5, 7))}월`,
          en: new Date(latestDate).toLocaleString("en-US", { month: "short" }),
        },
        title: locale === "ko" ? "급상승 종목 추적" : "Rising names watch",
        subtitle: {
          ko: "급상승 랭킹 상위 종목의 지속성 확인",
          en: "Check whether the current rising leaders can sustain momentum.",
        },
        impact: { ko: "중간 영향", en: "Medium impact" },
        tone: risingEntries.length > 0 ? "up" : "neutral",
        dateLabel: {
          ko: formatDateLabel(latestDate),
          en: formatDateLabel(latestDate),
        },
        countdown: {
          ko: "실시간",
          en: "Live",
        },
        status: {
          ko: risingEntries.length > 0 ? "상승 탄력 점검 중" : "데이터 대기 중",
          en: risingEntries.length > 0 ? "Momentum under review" : "Waiting for data",
        },
        description: {
          ko: "급상승 랭킹은 최근 점수 변화가 빠른 종목을 보여주며, 단기 테마 전환을 파악하는 데 유용합니다.",
          en: "The rising board highlights the fastest score movers and helps spot short-term rotation.",
        },
        watch: [
          {
            ko: "급상승 상위권 종목의 다음 날 유지 여부",
            en: "Whether top rising names hold into the next session",
          },
          {
            ko: "리더보드 상위권 편입 여부",
            en: "Whether they break into the top leaderboard tier",
          },
          {
            ko: "급상승이 단발성인지 확인",
            en: "Whether the move is durable or one-off",
          },
        ],
        affected: risingFocus,
        actions: risingEntries.slice(0, 2).map((entry) => ({
          label: {
            ko: `${projectName(entry.project, locale)} 보기`,
            en: `Open ${projectName(entry.project, locale)}`,
          },
          href: `/market/trading/${entry.project.slug}`,
        })),
      },
      {
        id: "rotation",
        day: latestDate.slice(-2),
        month: {
          ko: `${Number(latestDate.slice(5, 7))}월`,
          en: new Date(latestDate).toLocaleString("en-US", { month: "short" }),
        },
        title: locale === "ko" ? "카테고리 로테이션 점검" : "Category rotation check",
        subtitle: {
          ko: "강한 섹터와 약한 섹터의 상대 강도 차이를 확인합니다.",
          en: "Watch the spread between leading and lagging categories.",
        },
        impact: { ko: "중간 영향", en: "Medium impact" },
        tone: strongestCategory && weakestCategory ? toneFromChange(strongestCategory.averageChange - weakestCategory.averageChange) : "neutral",
        dateLabel: {
          ko: formatDateLabel(latestDate),
          en: formatDateLabel(latestDate),
        },
        countdown: {
          ko: "실시간",
          en: "Live",
        },
        status: {
          ko: strongestCategory && weakestCategory ? `${strongestCategory.category} 강세 / ${weakestCategory.category} 약세` : "카테고리 데이터 대기",
          en: strongestCategory && weakestCategory ? `${strongestCategory.category} leading / ${weakestCategory.category} lagging` : "Waiting for category data",
        },
        description: {
          ko: "카테고리 간 평균 변동률 차이는 다음 순환매 방향을 읽는 데 가장 유용한 신호 중 하나입니다.",
          en: "The gap between category averages is one of the clearest signals for rotation.",
        },
        watch: [
          {
            ko: "강한 섹터의 종목 수 확장 여부",
            en: "Whether leadership broadens inside the strongest sector",
          },
          {
            ko: "약한 섹터의 낙폭 축소 여부",
            en: "Whether the weakest sector starts to stabilize",
          },
          {
            ko: "평균 변동률 격차 축소 또는 확대 여부",
            en: "Whether the average-move gap compresses or widens",
          },
        ],
        affected: rotationFocus,
        actions: [
          {
            label: {
              ko: locale === "ko" ? "시장 보기" : "Open market",
              en: "Open market",
            },
            href: "/market",
          },
          {
            label: {
              ko: locale === "ko" ? "스크리너 보기" : "Open screener",
              en: "Open screener",
            },
            href: "/market/screener",
          },
        ],
      },
    ];
  }, [globalEntries, latestDate, locale, marketTone, risingEntries, season, strongestCategory, weakestCategory]);

  const summary = [
    { label: { ko: text.analyses, en: text.analyses }, value: { ko: `${reports.length}건`, en: `${reports.length}` }, tone: "neutral" as Tone },
    { label: { ko: text.gainers, en: text.gainers }, value: { ko: `${positiveCount}개`, en: `${positiveCount}` }, tone: "up" as Tone },
    { label: { ko: text.losers, en: text.losers }, value: { ko: `${negativeCount}개`, en: `${negativeCount}` }, tone: "down" as Tone },
    { label: { ko: text.watchItems, en: text.watchItems }, value: { ko: `${events.length}개`, en: `${events.length}` }, tone: "neutral" as Tone },
  ];

  const report = reports.find((item) => item.id === reportId) ?? reports[0];
  const event = events.find((item) => item.id === eventId) ?? events[0];

  return (
    <div className="space-y-5 font-figma-body">
      <section className="relative left-1/2 -mx-4 -mt-5 w-screen -translate-x-1/2 border-b border-[#2b2f36] bg-[rgba(30,32,38,0.28)] sm:-mx-6 xl:mx-0">
        <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-4 px-4 py-5 sm:px-6 2xl:px-8">
          <div>
            <h1 className="text-[24px] font-bold text-[#d1d4dc]">{text.title}</h1>
            <p className="mt-1 text-[12px] text-[#848e9c]">{text.description}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {summary.map((item) => (
              <MarketPanel key={item.label.ko} className="px-[13px] py-[12px]">
                <p className="text-[10px] text-[#848e9c]">{item.label[locale]}</p>
                <p
                  className={cn(
                    "mt-1 text-[18px] font-bold text-[#d1d4dc]",
                    item.tone === "up" && "text-[#c84a31]",
                    item.tone === "down" && "text-[#1261c4]",
                  )}
                >
                  {item.value[locale]}
                </p>
              </MarketPanel>
            ))}
          </div>
          {loading ? <p className="text-[11px] text-[#848e9c]">{text.loading}</p> : null}
          {error ? (
            <div className="rounded-[4px] border border-[rgba(200,74,49,0.24)] bg-[rgba(200,74,49,0.08)] px-3 py-2 text-[11px] leading-4 text-[#f1b6aa]">
              {text.errorPrefix} {error}
            </div>
          ) : null}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeading title={text.briefingTitle} />
        <MarketPanel className="px-5 py-5">
          <p className="text-[12px] text-[#848e9c]">{formatDateLabel(latestDate)}</p>
          <h2 className="mt-1 text-[18px] font-semibold text-[#d1d4dc]">
            {locale === "ko" ? "일일 시장 브리핑" : "Daily market briefing"}
          </h2>
          <p className="mt-4 text-[14px] leading-[22px] text-[#d1d4dc]">
            {locale === "ko"
              ? `시장 평균 변동률은 ${formatPercent(averageChange)}입니다. ${strongestCategory?.category ?? "주도 카테고리"}가 상대 강세를 보이고, ${strongestQuote?.name ?? "대표 종목"} 움직임이 오늘 테이프를 주도하고 있습니다.`
              : `Average market move is ${formatPercent(averageChange)}. ${strongestCategory?.category ?? "The leading category"} is showing relative strength, while ${strongestQuote?.name ?? "the top mover"} is setting today's tone.`}
          </p>
          <div className="mt-4">
            <p className="text-[12px] font-semibold text-[#848e9c]">{text.keyPoints}</p>
            <ul className="mt-2 space-y-2">
              {briefingPoints.map((point) => (
                <li key={point} className="flex items-start gap-2 text-[12px] text-[#848e9c]">
                  <span className="text-[#3366ff]">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </MarketPanel>
      </section>

      <section className="space-y-3">
        <SectionHeading title={text.insightsTitle} />
        <div className="grid gap-3 xl:grid-cols-2">
          {insights.map((item) => (
            <MarketPanel key={item.title.ko} className="px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-[14px] font-semibold text-[#d1d4dc]">{item.title[locale]}</h3>
                <TonePill
                  label={item.tone === "up" ? text.bullish : item.tone === "down" ? text.bearish : text.neutral}
                  tone={item.tone}
                />
              </div>
              <p className="mt-3 text-[11px] leading-[18px] text-[#848e9c]">{item.body[locale]}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span key={`${item.title.ko}-${tag}`} className="inline-flex h-[18px] items-center rounded-[4px] bg-[rgba(132,142,156,0.1)] px-2 text-[9px] text-[#848e9c]">
                    {tag}
                  </span>
                ))}
              </div>
            </MarketPanel>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="space-y-3">
          <SectionHeading title={text.gainersTitle} />
          <MovementTable rows={topGainers} title={text.gainersTitle} tone="up" />
        </div>
        <div className="space-y-3">
          <SectionHeading title={text.losersTitle} />
          <MovementTable rows={topLosers} title={text.losersTitle} tone="down" />
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeading title={text.reportsTitle} />
        <p className="text-[11px] text-[#848e9c]">{text.reportsDesc}</p>
        <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
          <MarketPanel className="overflow-hidden">
            {reports.map((item) => (
              <button
                key={item.id}
                className={cn(
                  "w-full border-b border-[#2b2f36] px-4 py-4 text-left transition last:border-b-0",
                  item.id === report?.id ? "bg-[rgba(51,102,255,0.08)]" : "hover:bg-[rgba(255,255,255,0.02)]",
                )}
                onClick={() => setReportId(item.id)}
                type="button"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex h-[18px] items-center rounded-[4px] bg-[rgba(51,102,255,0.1)] px-2 text-[9px] text-[#3366ff]">
                        {item.kind}
                      </span>
                      <span className="text-[9px] text-[#848e9c]">{item.readTime}</span>
                    </div>
                    <h3 className="mt-3 text-[14px] font-semibold text-[#d1d4dc]">{item.title[locale]}</h3>
                    <p className="mt-2 line-clamp-2 text-[11px] leading-[18px] text-[#848e9c]">{item.body[locale]}</p>
                  </div>
                  <TonePill label={item.date} tone={item.tone} />
                </div>
              </button>
            ))}
          </MarketPanel>

          {report ? (
            <MarketPanel className="px-5 py-5">
              <div className="border-b border-[#2b2f36] pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex h-[18px] items-center rounded-[4px] bg-[rgba(51,102,255,0.1)] px-2 text-[9px] text-[#3366ff]">
                    {report.kind}
                  </span>
                  <TonePill label={report.date} tone={report.tone} />
                  <span className="text-[10px] text-[#848e9c]">{report.readTime}</span>
                </div>
                <h3 className="mt-3 text-[18px] font-semibold text-[#d1d4dc]">{report.title[locale]}</h3>
                <p className="mt-2 text-[12px] leading-6 text-[#9aa4b2]">{report.body[locale]}</p>
              </div>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <p className="text-[11px] font-semibold text-[#a7b0bd]">{text.analyst}</p>
                    <p className="mt-2 text-[12px] text-[#d1d4dc]">{report.analyst}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-[#a7b0bd]">{text.focus}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {report.focus.map((item) => (
                        <span key={`${report.id}-${item}`} className="inline-flex h-[20px] items-center rounded-[4px] bg-[rgba(132,142,156,0.1)] px-2 text-[10px] text-[#d1d4dc]">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-[#a7b0bd]">{text.thesis}</p>
                    <p className="mt-2 text-[12px] leading-6 text-[#d1d4dc]">{report.thesis[locale]}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <BulletList title={text.highlights} items={report.highlights.map((item) => item[locale])} />
                  <BulletList title={text.risks} items={report.risks.map((item) => item[locale])} />
                </div>
              </div>
              <div className="mt-5 border-t border-[#2b2f36] pt-4">
                <p className="text-[11px] font-semibold text-[#a7b0bd]">{text.actions}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {report.actions.map((action) => (
                    <Link
                      key={`${report.id}-${action.href}`}
                      className="inline-flex h-9 items-center rounded-[4px] border border-[rgba(51,102,255,0.22)] bg-[rgba(51,102,255,0.1)] px-3 text-[12px] font-medium text-[#d1d4dc] transition hover:bg-[rgba(51,102,255,0.16)]"
                      href={action.href}
                    >
                      {action.label[locale]}
                    </Link>
                  ))}
                </div>
              </div>
            </MarketPanel>
          ) : null}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeading title={text.eventsTitle} />
        <p className="text-[11px] text-[#848e9c]">{text.eventsDesc}</p>
        <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
          <MarketPanel className="overflow-hidden">
            {events.map((item) => (
              <button
                key={item.id}
                className={cn(
                  "grid w-full grid-cols-[56px_minmax(0,1fr)] gap-4 border-b border-[#2b2f36] px-4 py-4 text-left transition last:border-b-0",
                  item.id === event?.id ? "bg-[rgba(51,102,255,0.08)]" : "hover:bg-[rgba(255,255,255,0.02)]",
                )}
                onClick={() => setEventId(item.id)}
                type="button"
              >
                <div className="text-center">
                  <p className="text-[24px] font-semibold text-[#d1d4dc]">{item.day}</p>
                  <p className="mt-1 text-[9px] text-[#848e9c]">{item.month[locale]}</p>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="truncate text-[14px] font-semibold text-[#d1d4dc]">{item.title}</h3>
                    <TonePill label={item.countdown[locale]} tone={item.tone} />
                  </div>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-[18px] text-[#848e9c]">{item.subtitle[locale]}</p>
                </div>
              </button>
            ))}
          </MarketPanel>

          {event ? (
            <MarketPanel className="px-5 py-5">
              <div className="border-b border-[#2b2f36] pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <TonePill label={event.impact[locale]} tone={event.tone} />
                  <span className="text-[10px] text-[#848e9c]">{event.dateLabel[locale]}</span>
                  <span className="text-[10px] text-[#848e9c]">{event.countdown[locale]}</span>
                </div>
                <h3 className="mt-3 text-[18px] font-semibold text-[#d1d4dc]">{event.title}</h3>
                <p className="mt-1 text-[12px] text-[#a7b0bd]">{event.subtitle[locale]}</p>
                <p className="mt-4 rounded-[6px] border border-[#2b2f36] bg-[#10151d] px-3 py-3 text-[12px] leading-6 text-[#d1d4dc]">
                  {event.description[locale]}
                </p>
              </div>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <p className="text-[11px] font-semibold text-[#a7b0bd]">{text.status}</p>
                    <p className="mt-2 text-[12px] text-[#d1d4dc]">{event.status[locale]}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-[#a7b0bd]">{text.affected}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {event.affected.map((item) => (
                        <span key={`${event.id}-${item}`} className="inline-flex h-[20px] items-center rounded-[4px] bg-[rgba(132,142,156,0.1)] px-2 text-[10px] text-[#d1d4dc]">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <BulletList title={text.watch} items={event.watch.map((item) => item[locale])} />
              </div>
              <div className="mt-5 border-t border-[#2b2f36] pt-4">
                <p className="text-[11px] font-semibold text-[#a7b0bd]">{text.actions}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {event.actions.map((action) => (
                    <Link
                      key={`${event.id}-${action.href}`}
                      className="inline-flex h-9 items-center rounded-[4px] border border-[rgba(51,102,255,0.22)] bg-[rgba(51,102,255,0.1)] px-3 text-[12px] font-medium text-[#d1d4dc] transition hover:bg-[rgba(51,102,255,0.16)]"
                      href={action.href}
                    >
                      {action.label[locale]}
                    </Link>
                  ))}
                </div>
              </div>
            </MarketPanel>
          ) : null}
        </div>
      </section>
    </div>
  );
}
