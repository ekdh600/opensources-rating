"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocale } from "next-intl";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Link } from "@/i18n/routing";
import { MarketPanel } from "@/components/market/MarketUi";
import { cn } from "@/lib/utils";
import {
  MARKET_HEATMAP_TILES as MARKET_HEATMAP_DATA,
  MARKET_HOME_STOCKS as MARKET_STOCK_DATA,
  MARKET_INDEX_CARDS as MARKET_INDEX_DATA,
} from "@/lib/market-data";
import { api } from "@/lib/api";

type MarketLocale = "ko" | "en";
type Localized = Record<MarketLocale, string>;
type TrendTone = "up" | "down" | "neutral";
type TimeframeKey = "1h" | "4h" | "1d" | "1w" | "1m";
type ChartSeriesKey = "closeBar" | "close" | "ma5" | "ma20";

interface ChartMetric {
  label: Localized;
  value: string;
  tone: TrendTone;
}

interface ChartDataset {
  key: TimeframeKey;
  currentValue: string;
  changeValue: string;
  dates: string[];
  bars: number[];
  lineValues: number[];
  leftAxis: string[];
  rightAxis: string[];
  metrics: ChartMetric[];
}

interface MarketChartPoint {
  date: string;
  label: string;
  value: number;
  closeBar: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ma5: number | null;
  ma20: number | null;
  ma60: number | null;
}

interface SummaryCardData {
  key: string;
  label: Localized;
  value: Localized;
  tone: "blue" | "emerald" | "red" | "gray";
}

interface IndexCardData {
  key: string;
  eyebrow: Localized;
  label: string;
  value: string;
  delta: string;
  change: string;
  tone: TrendTone;
  spark: number[];
}

interface HeatTileData {
  name: string;
  change: string;
  tone: TrendTone;
  desktopCol: 1 | 2 | 3 | 4 | 5 | 6;
  desktopRow: 1 | 2;
}

interface StockCardData {
  key: string;
  name: string;
  category: string;
  rank: number;
  score: string;
  delta: string;
  change: string;
  tone: TrendTone;
  trust: string;
  attention: number;
  execution: number;
  health: number;
  spark: number[];
  href?: string;
}

interface TradingQuoteApi {
  project_id: number;
  slug: string;
  name: string;
  category: string | null;
  current_price: number;
  previous_close: number;
  change_points: number;
  change_rate: number;
  rank_global: number | null;
  score_date: string;
}

interface LeaderboardProjectApi {
  slug: string;
  display_name_ko: string | null;
  display_name_en: string | null;
  foundation_type: string | null;
  category?: {
    slug: string;
    name_ko: string;
    name_en: string;
  } | null;
}

interface LeaderboardEntryApi {
  rank: number;
  total_score: number;
  attention_score: number;
  execution_score: number;
  health_score: number;
  trust_score: number;
  project: LeaderboardProjectApi;
}

interface SeasonApi {
  name: string;
  start_date: string;
  end_date: string;
}

interface CategoryApi {
  slug: string;
  name_ko: string;
  name_en: string;
}

const COPY = {
  ko: {
    pageTitle: "오픈소스 트레이딩",
    pageDescription: "오픈소스 프로젝트의 흐름을 시장 메타포로 해석한 데이터 분석 플랫폼",
    indexesTitle: "시장 지수",
    regimeTitle: "시장 현황: 상승장",
    regimeDescription: "시장은 현재 강한 상승 흐름을 보이고 있습니다",
    chartTitle: "오픈소스 트레이딩 지수",
    heatmapTitle: "시장 히트맵",
    heatmapDescription: "붉은색은 강세, 파란색은 약세",
    stocksTitle: "주요 종목",
    stocksAction: "전체 보기 ->",
    distribution: "점수 구성",
    trustLabel: "신뢰",
    attentionLabel: "주목",
    executionLabel: "실행",
    healthLabel: "건전",
    timeframes: ["1시간", "4시간", "1일", "1주", "1개월"],
    fullscreenOpen: "차트 전체화면",
    fullscreenClose: "전체화면 닫기",
    hoverPrefix: "지수",
    loading: "시장 데이터를 불러오는 중입니다.",
    errorPrefix: "시장 데이터 반영 중 문제가 발생했습니다.",
    methodologyTitle: "데이터 출처와 계산 방식",
    methodologyBody:
      "현재 화면의 시장 지수와 종목 가격은 백엔드 API 응답을 기반으로 계산한 오픈소스 트레이딩 게임 지표입니다. 실거래 가격이 아니라 프로젝트 점수 기반 지수입니다.",
    methodologyBullet1:
      "종목 현재가: /api/v1/trading/quotes 의 current_price이며, 각 프로젝트의 최신 total_score를 가격처럼 표시합니다.",
    methodologyBullet2:
      "종목 변동률: 최신 total_score와 직전 total_score를 비교한 change_rate입니다.",
    methodologyBullet3:
      "OSS Index / CNCF Index / 카테고리 Index: 해당 묶음의 점수 평균과 변동률 평균을 프런트에서 다시 계산한 합성 지수입니다.",
    methodologyBullet4:
      "프로젝트 total_score 계산식: 0.34*관심도 + 0.38*실행력 + 0.18*건강도 + 0.10*신뢰도",
    methodologyBullet5:
      "현재 데이터 원천: 실수집 운영 데이터가 아니라 개발용 시드 데이터 기반 API 응답입니다.",
    regimeBullTitle: "시장 현황: 상승장",
    regimeBullDescription: "실시간 지표 기준으로 주요 OSS 종목이 전반적으로 강세입니다.",
    regimeBearTitle: "시장 현황: 조정장",
    regimeBearDescription: "실시간 지표 기준으로 주요 OSS 종목이 전반적으로 약세입니다.",
    regimeNeutralTitle: "시장 현황: 관망장",
    regimeNeutralDescription: "실시간 지표 기준으로 주요 OSS 종목이 뚜렷한 방향성 없이 움직이고 있습니다.",
    topGainersTitle: "상승 종목",
    topLosersTitle: "하락 종목",
    movementEmpty: "표시할 종목이 아직 없습니다.",
  },
  en: {
    pageTitle: "Open Source Trading",
    pageDescription: "A market-style analytics view that interprets open source project momentum as a tradable dashboard.",
    indexesTitle: "Market indices",
    regimeTitle: "Market regime: Bullish",
    regimeDescription: "The market is currently showing a strong upward trend.",
    chartTitle: "Open Source Trading Index",
    heatmapTitle: "Market heatmap",
    heatmapDescription: "Red indicates strength, blue indicates weakness",
    stocksTitle: "Core stocks",
    stocksAction: "View all ->",
    distribution: "Score mix",
    trustLabel: "Trust",
    attentionLabel: "Attention",
    executionLabel: "Execution",
    healthLabel: "Health",
    timeframes: ["1h", "4h", "1d", "1w", "1mo"],
    fullscreenOpen: "Expand chart",
    fullscreenClose: "Close fullscreen",
    hoverPrefix: "Index",
    loading: "Loading live market data.",
    errorPrefix: "There was a problem loading live market data.",
    methodologyTitle: "Data Source and Methodology",
    methodologyBody:
      "The market indices and instrument prices on this screen are API-backed open source trading game metrics. They are score-based synthetic values, not real tradable market prices.",
    methodologyBullet1:
      "Instrument price: current_price from /api/v1/trading/quotes, displayed from the latest project total_score.",
    methodologyBullet2:
      "Instrument change: change_rate calculated from the latest total_score versus the previous total_score.",
    methodologyBullet3:
      "OSS Index / CNCF Index / category indices: composite frontend indices rebuilt from grouped average scores and average changes.",
    methodologyBullet4:
      "Project total_score formula: 0.34*attention + 0.38*execution + 0.18*health + 0.10*trust",
    methodologyBullet5:
      "Current source data: API responses backed by development seed data, not production live collection.",
    regimeBullTitle: "Market regime: Bullish",
    regimeBullDescription: "Live signals show broad strength across major OSS instruments.",
    regimeBearTitle: "Market regime: Corrective",
    regimeBearDescription: "Live signals show broad weakness across major OSS instruments.",
    regimeNeutralTitle: "Market regime: Sideways",
    regimeNeutralDescription: "Live signals show mixed movement without a strong directional trend.",
    topGainersTitle: "Top Gainers",
    topLosersTitle: "Top Losers",
    movementEmpty: "No movers are available yet.",
  },
} as const;

const SUMMARY_CARDS: SummaryCardData[] = [
  { key: "season", label: { ko: "현재 시즌", en: "Current season" }, value: { ko: "2026 Q1", en: "2026 Q1" }, tone: "blue" },
  { key: "days", label: { ko: "남은 일수", en: "Days left" }, value: { ko: "9일", en: "9 days" }, tone: "emerald" },
  { key: "predictions", label: { ko: "활성 예측", en: "Active predictions" }, value: { ko: "12,847", en: "12,847" }, tone: "red" },
  { key: "participants", label: { ko: "참여자", en: "Participants" }, value: { ko: "3,542", en: "3,542" }, tone: "gray" },
];

const INDEX_CARDS: IndexCardData[] = [
  {
    key: "oss",
    eyebrow: { ko: "전체 오픈소스 시장 지수", en: "Overall open source market index" },
    label: "OSS Index",
    value: "1,247.82",
    delta: "▲ 18.42",
    change: "+1.50%",
    tone: "up",
    spark: [76, 84, 90, 98, 88, 92, 95, 99],
  },
  {
    key: "cncf",
    eyebrow: { ko: "CNCF 프로젝트 지수", en: "CNCF project index" },
    label: "CNCF Index",
    value: "892.15",
    delta: "▼ 5.23",
    change: "-0.58%",
    tone: "down",
    spark: [88, 86, 85, 83, 82, 80, 79, 78],
  },
  {
    key: "observability",
    eyebrow: { ko: "관측성 지수", en: "Observability sector index" },
    label: "Observability Index",
    value: "634.92",
    delta: "▲ 12.87",
    change: "+2.07%",
    tone: "up",
    spark: [48, 50, 49, 53, 56, 60, 62, 66],
  },
  {
    key: "infra",
    eyebrow: { ko: "인프라 성장 지수", en: "Infra growth index" },
    label: "Infra Growth Index",
    value: "1,089.34",
    delta: "▲ 24.56",
    change: "+2.31%",
    tone: "up",
    spark: [68, 72, 74, 78, 82, 86, 90, 94],
  },
  {
    key: "runtime",
    eyebrow: { ko: "컨테이너 런타임 지수", en: "Container runtime index" },
    label: "Runtime Index",
    value: "742.18",
    delta: "▲ 6.42",
    change: "+0.87%",
    tone: "up",
    spark: [58, 60, 59, 61, 64, 65, 67, 69],
  },
  {
    key: "platform",
    eyebrow: { ko: "플랫폼 운영 지수", en: "Platform operations index" },
    label: "Platform Ops Index",
    value: "913.44",
    delta: "▲ 11.26",
    change: "+1.25%",
    tone: "up",
    spark: [62, 66, 65, 68, 70, 73, 76, 79],
  },
  {
    key: "devtools",
    eyebrow: { ko: "개발자 도구 지수", en: "Developer tooling index" },
    label: "Dev Toolchain Index",
    value: "688.27",
    delta: "▼ 3.11",
    change: "-0.45%",
    tone: "down",
    spark: [80, 79, 77, 76, 75, 74, 73, 72],
  },
  {
    key: "mesh",
    eyebrow: { ko: "서비스 메시/게이트웨이 지수", en: "Service mesh and gateway index" },
    label: "Mesh & Gateway Index",
    value: "571.63",
    delta: "▲ 7.84",
    change: "+1.39%",
    tone: "up",
    spark: [46, 48, 47, 50, 53, 54, 57, 60],
  },
];

function formatDecimal(value: number, decimals = 2) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

function formatInteger(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDayCount(days: number, locale: MarketLocale) {
  return locale === "ko" ? `${days}일` : `${days} days`;
}

function buildLocalizedValue(value: string): Localized {
  return { ko: value, en: value };
}

function getToneFromNumber(value: number): TrendTone {
  if (value > 0.001) {
    return "up";
  }
  if (value < -0.001) {
    return "down";
  }
  return "neutral";
}

function formatArrowDelta(value: number, decimals = 2) {
  if (Math.abs(value) < 0.001) {
    return `• ${formatDecimal(0, decimals)}`;
  }
  return `${value >= 0 ? "▲" : "▼"} ${formatDecimal(Math.abs(value), decimals)}`;
}

function formatSignedPercentValue(value: number, decimals = 2) {
  if (Math.abs(value) < 0.001) {
    return "0.00%";
  }
  return `${value > 0 ? "+" : "-"}${formatDecimal(Math.abs(value), decimals)}%`;
}

function buildSparkline(baseValue: number, changeRate: number, points = 8) {
  const safeBase = Number.isFinite(baseValue) ? baseValue : 50;
  const drift = safeBase * (changeRate / 100);
  const values = Array.from({ length: points }, (_, index) => {
    const progress = points === 1 ? 1 : index / (points - 1);
    const wobble = Math.sin((index + 1) * 1.25) * Math.max(safeBase * 0.018, 1.4);
    return Number((safeBase - drift / 2 + drift * progress + wobble).toFixed(3));
  });
  const min = Math.min(...values);
  const offset = min <= 0 ? Math.abs(min) + 8 : 0;
  return values.map((value) => Math.round(value + offset));
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function daysUntil(endDate: string) {
  const today = new Date();
  const end = new Date(endDate);
  const diff = end.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function normalizeBreakdown(values: number[]) {
  const safe = values.map((value) => Math.max(0, Math.round(value)));
  const total = safe.reduce((sum, value) => sum + value, 0);
  if (total <= 0) {
    return [34, 33, 33];
  }

  const scaled = safe.map((value) => Math.round((value / total) * 100));
  const delta = 100 - scaled.reduce((sum, value) => sum + value, 0);
  scaled[0] = scaled[0] + delta;
  return scaled;
}

function categoryLabel(category: CategoryApi | undefined, locale: MarketLocale) {
  if (!category) {
    return locale === "ko" ? "기타" : "Other";
  }
  return locale === "ko" ? category.name_ko : category.name_en;
}

function buildSummaryCardsFromApi({
  locale,
  season,
  quotes,
  categories,
}: {
  locale: MarketLocale;
  season: SeasonApi | null;
  quotes: TradingQuoteApi[];
  categories: CategoryApi[];
}) {
  if (!season) {
    return SUMMARY_CARDS;
  }

  return [
    {
      key: "season",
      label: { ko: "현재 시즌", en: "Current season" },
      value: buildLocalizedValue(season.name),
      tone: "blue" as const,
    },
    {
      key: "days",
      label: { ko: "남은 일수", en: "Days left" },
      value: buildLocalizedValue(formatDayCount(daysUntil(season.end_date), locale)),
      tone: "emerald" as const,
    },
    {
      key: "projects",
      label: { ko: "활성 종목", en: "Active listings" },
      value: buildLocalizedValue(formatInteger(quotes.length)),
      tone: "red" as const,
    },
    {
      key: "categories",
      label: { ko: "추적 카테고리", en: "Tracked categories" },
      value: buildLocalizedValue(formatInteger(categories.length)),
      tone: "gray" as const,
    },
  ];
}

function buildIndexCardsFromApi({
  locale,
  quotes,
  globalEntries,
  cncfEntries,
  categories,
}: {
  locale: MarketLocale;
  quotes: TradingQuoteApi[];
  globalEntries: LeaderboardEntryApi[];
  cncfEntries: LeaderboardEntryApi[];
  categories: CategoryApi[];
}) {
  if (quotes.length === 0 || globalEntries.length === 0) {
    return MARKET_INDEX_DATA;
  }

  const categoryByName = new Map(
    categories.flatMap((category) => [
      [category.name_ko, category],
      [category.name_en, category],
    ]),
  );

  const buildCard = ({
    key,
    eyebrow,
    label,
    scoreValues,
    changeValues,
  }: {
    key: string;
    eyebrow: Localized;
    label: string;
    scoreValues: number[];
    changeValues: number[];
  }): IndexCardData => {
    const avgScore = average(scoreValues);
    const avgChangeRate = average(changeValues);
    const deltaPoints = avgScore * (avgChangeRate / 100);
    return {
      key,
      eyebrow,
      label,
      value: formatDecimal(avgScore),
      delta: formatArrowDelta(deltaPoints),
      change: formatSignedPercentValue(avgChangeRate),
      tone: getToneFromNumber(avgChangeRate),
      spark: buildSparkline(avgScore, avgChangeRate),
    };
  };

  const cards: IndexCardData[] = [
    buildCard({
      key: "oss",
      eyebrow: { ko: "실시간 전체 OSS 시장 지수", en: "Live overall OSS market index" },
      label: "OSS Index",
      scoreValues: globalEntries.map((entry) => entry.total_score),
      changeValues: quotes.map((quote) => quote.change_rate),
    }),
    buildCard({
      key: "cncf",
      eyebrow: { ko: "실시간 CNCF 프로젝트 지수", en: "Live CNCF project index" },
      label: "CNCF Index",
      scoreValues: cncfEntries.map((entry) => entry.total_score),
      changeValues: quotes
        .filter((quote) => cncfEntries.some((entry) => entry.project.slug === quote.slug))
        .map((quote) => quote.change_rate),
    }),
  ];

  const groupedQuotes = new Map<string, TradingQuoteApi[]>();
  quotes.forEach((quote) => {
    const key = quote.category ?? "other";
    groupedQuotes.set(key, [...(groupedQuotes.get(key) ?? []), quote]);
  });

  const categoryCards = [...groupedQuotes.entries()]
    .sort((left, right) => right[1].length - left[1].length)
    .slice(0, 6)
    .map(([name, rows]) => {
      const category = categoryByName.get(name);
      const labelBase = categoryLabel(category, locale);
      return buildCard({
        key: category?.slug ?? name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        eyebrow: {
          ko: `${labelBase} 카테고리 지수`,
          en: `${labelBase} category index`,
        },
        label: `${labelBase} Index`,
        scoreValues: rows.map((quote) => quote.current_price),
        changeValues: rows.map((quote) => quote.change_rate),
      });
    });

  return [...cards, ...categoryCards];
}

function buildHeatmapFromApi(quotes: TradingQuoteApi[]) {
  if (quotes.length === 0) {
    return MARKET_HEATMAP_DATA;
  }

  return [...quotes]
    .sort((left, right) => {
      const gap = Math.abs(right.change_rate) - Math.abs(left.change_rate);
      if (Math.abs(gap) > 0.001) {
        return gap;
      }
      return (left.rank_global ?? Number.MAX_SAFE_INTEGER) - (right.rank_global ?? Number.MAX_SAFE_INTEGER);
    })
    .slice(0, 12)
    .map((quote, index) => ({
      name: quote.name,
      change: formatSignedPercentValue(quote.change_rate),
      tone: getToneFromNumber(quote.change_rate),
      desktopCol: ((index % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6,
      desktopRow: (index < 6 ? 1 : 2) as 1 | 2,
    }));
}

function buildFallbackStockCards(): StockCardData[] {
  return MARKET_STOCK_DATA.map((stock) => ({
    key: stock.key,
    name: stock.name,
    category: stock.category,
    rank: stock.rank,
    score: stock.score,
    delta: stock.delta,
    change: stock.change,
    tone: stock.tone,
    trust: "80.0",
    attention: stock.up,
    execution: stock.flat,
    health: stock.down,
    spark: stock.spark,
    href: stock.href,
  }));
}

function buildStockCardsFromApi({
  locale,
  quotes,
  entries,
}: {
  locale: MarketLocale;
  quotes: TradingQuoteApi[];
  entries: LeaderboardEntryApi[];
}) {
  if (quotes.length === 0 || entries.length === 0) {
    return buildFallbackStockCards();
  }

  const entryBySlug = new Map(entries.map((entry) => [entry.project.slug, entry]));

  return quotes.slice(0, 12).map((quote) => {
    const entry = entryBySlug.get(quote.slug);
    const breakdown = normalizeBreakdown([
      entry?.attention_score ?? 34,
      entry?.execution_score ?? 33,
      entry?.health_score ?? 33,
    ]);
    return {
      key: quote.slug,
      name:
        locale === "ko"
          ? entry?.project.display_name_ko || entry?.project.display_name_en || quote.name
          : entry?.project.display_name_en || entry?.project.display_name_ko || quote.name,
      category: quote.category ?? (locale === "ko" ? "기타" : "Other"),
      rank: quote.rank_global ?? 0,
      score: formatDecimal(quote.current_price),
      delta: formatArrowDelta(quote.change_points),
      change: formatSignedPercentValue(quote.change_rate),
      tone: getToneFromNumber(quote.change_rate),
      trust: formatDecimal(entry?.trust_score ?? 0),
      attention: breakdown[0] ?? 34,
      execution: breakdown[1] ?? 33,
      health: breakdown[2] ?? 33,
      spark: buildSparkline(quote.current_price, quote.change_rate),
      href: `/market/trading/${quote.slug}`,
    };
  });
}

const CHART_DATA: Record<TimeframeKey, ChartDataset> = {
  "1h": {
    key: "1h",
    currentValue: "1,241.36",
    changeValue: "+8.24 (+0.67%)",
    dates: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"],
    bars: [240, 310, 380, 420, 365, 440, 470, 495],
    lineValues: [228, 236, 241, 247, 244, 252, 259, 264],
    leftAxis: ["500", "375", "250", "125", "0"],
    rightAxis: ["20K", "15K", "10K", "5K", "0K"],
    metrics: [
      { label: { ko: "시가", en: "Open" }, value: "1,233.12", tone: "neutral" },
      { label: { ko: "고가", en: "High" }, value: "1,247.82", tone: "up" },
      { label: { ko: "저가", en: "Low" }, value: "1,229.41", tone: "down" },
      { label: { ko: "현재가", en: "Close" }, value: "1,241.36", tone: "neutral" },
      { label: { ko: "변동률", en: "Change" }, value: "+0.67%", tone: "up" },
    ],
  },
  "4h": {
    key: "4h",
    currentValue: "1,244.98",
    changeValue: "+21.17 (+1.73%)",
    dates: ["02/18", "02/19", "02/20", "02/21", "02/22", "02/23", "02/24", "02/25"],
    bars: [320, 540, 690, 760, 620, 470, 530, 710],
    lineValues: [590, 612, 641, 658, 649, 671, 688, 704],
    leftAxis: ["800", "600", "400", "200", "0"],
    rightAxis: ["28K", "21K", "14K", "7K", "0K"],
    metrics: [
      { label: { ko: "시가", en: "Open" }, value: "1,223.81", tone: "neutral" },
      { label: { ko: "고가", en: "High" }, value: "1,249.06", tone: "up" },
      { label: { ko: "저가", en: "Low" }, value: "1,218.04", tone: "down" },
      { label: { ko: "현재가", en: "Close" }, value: "1,244.98", tone: "neutral" },
      { label: { ko: "변동률", en: "Change" }, value: "+1.73%", tone: "up" },
    ],
  },
  "1d": {
    key: "1d",
    currentValue: "1,246.97",
    changeValue: "+62.46 (+5.27%)",
    dates: [
      "2/20", "2/21", "2/22", "2/23", "2/24", "2/25", "2/26", "2/27", "2/28", "3/1", "3/2",
      "3/3", "3/4", "3/5", "3/6", "3/7", "3/8", "3/9", "3/10", "3/11", "3/12", "3/13",
      "3/14", "3/15", "3/16", "3/17", "3/18", "3/19", "3/20", "3/21", "3/22",
    ],
    bars: [
      700, 1095, 1180, 1380, 800, 220, 720, 620, 840, 740, 580, 780, 1210, 1230, 1400, 710,
      1385, 700, 1010, 710, 1090, 760, 760, 1390, 380, 1240, 1110, 1110, 890, 1260, 660,
    ],
    lineValues: [
      1168, 1176, 1174, 1181, 1179, 1186, 1194, 1191, 1198, 1196, 1202, 1200, 1205, 1202, 1208, 1210,
      1207, 1212, 1209, 1216, 1219, 1217, 1221, 1218, 1220, 1219, 1224, 1222, 1228, 1225, 1224,
    ],
    leftAxis: ["1,262.47", "1,224.502", "1,199.502"],
    rightAxis: ["60K", "15K"],
    metrics: [
      { label: { ko: "시가", en: "Open" }, value: "1,185.324", tone: "neutral" },
      { label: { ko: "고가", en: "High" }, value: "1,256.305", tone: "up" },
      { label: { ko: "저가", en: "Low" }, value: "1,182.509", tone: "down" },
      { label: { ko: "종가", en: "Close" }, value: "1,246.965", tone: "neutral" },
      { label: { ko: "변동률", en: "Change" }, value: "+5.27%", tone: "up" },
    ],
  },
  "1w": {
    key: "1w",
    currentValue: "1,231.54",
    changeValue: "+109.18 (+9.72%)",
    dates: ["10주", "11주", "12주", "13주", "14주", "15주", "16주", "17주"],
    bars: [610, 740, 690, 820, 880, 1010, 1175, 1240],
    lineValues: [884, 905, 919, 941, 963, 989, 1017, 1046],
    leftAxis: ["1,250", "940", "625", "310", "0"],
    rightAxis: ["40K", "30K", "20K", "10K", "0K"],
    metrics: [
      { label: { ko: "시가", en: "Open" }, value: "1,122.36", tone: "neutral" },
      { label: { ko: "고가", en: "High" }, value: "1,240.18", tone: "up" },
      { label: { ko: "저가", en: "Low" }, value: "1,109.74", tone: "down" },
      { label: { ko: "현재가", en: "Close" }, value: "1,231.54", tone: "neutral" },
      { label: { ko: "변동률", en: "Change" }, value: "+9.72%", tone: "up" },
    ],
  },
  "1m": {
    key: "1m",
    currentValue: "1,198.31",
    changeValue: "+224.53 (+23.05%)",
    dates: ["10월", "11월", "12월", "1월", "2월", "3월"],
    bars: [460, 530, 670, 820, 1030, 1198],
    lineValues: [818, 852, 907, 968, 1086, 1198],
    leftAxis: ["1,200", "900", "600", "300", "0"],
    rightAxis: ["30K", "22K", "15K", "7K", "0K"],
    metrics: [
      { label: { ko: "시가", en: "Open" }, value: "973.78", tone: "neutral" },
      { label: { ko: "고가", en: "High" }, value: "1,214.20", tone: "up" },
      { label: { ko: "저가", en: "Low" }, value: "962.14", tone: "down" },
      { label: { ko: "현재가", en: "Close" }, value: "1,198.31", tone: "neutral" },
      { label: { ko: "변동률", en: "Change" }, value: "+23.05%", tone: "up" },
    ],
  },
};

const INDEX_VOLATILITY: Record<string, number> = {
  oss: 1,
  "github-stars": 1.18,
  cncf: 0.92,
  observability: 1.08,
  platform: 1.03,
  release: 0.95,
  maintainer: 1.07,
  security: 0.98,
  data: 1.04,
  ai: 1.16,
};

function countDecimals(value: string) {
  const match = value.match(/\.(\d+)/);
  return match ? match[1].length : 0;
}

function parseNumericText(value: string) {
  const normalized = value.replace(/,/g, "").replace(/[^0-9.+-]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumberLike(pattern: string, value: number) {
  const decimals = countDecimals(pattern);
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

function formatSignedNumber(value: number, decimals = 2) {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Math.abs(value))}`;
}

function formatSignedPercent(value: number, decimals = 2) {
  return `${formatSignedNumber(value, decimals)}%`;
}

function sampleSparkValue(values: number[], index: number, total: number) {
  if (values.length === 0) {
    return 50;
  }

  const mappedIndex = Math.round((index / Math.max(total - 1, 1)) * (values.length - 1));
  return values[mappedIndex] ?? values[values.length - 1] ?? 50;
}

function smoothSeries(values: number[], strength = 0.35) {
  return values.map((value, index) => {
    const previous = values[index - 1] ?? value;
    const current = value;
    const next = values[index + 1] ?? value;
    return Number((((previous + current * (1 + strength) + next) / (3 + strength)).toFixed(3)));
  });
}

function densifySeries(
  values: number[],
  bars: number[],
  dates: string[],
  targetCount: number,
) {
  if (values.length >= targetCount || values.length < 2) {
    return { values, bars, dates };
  }

  const lastIndex = values.length - 1;
  const densifiedValues: number[] = [];
  const densifiedBars: number[] = [];
  const densifiedDates: string[] = [];

  for (let index = 0; index < targetCount; index += 1) {
    const ratio = (index / Math.max(targetCount - 1, 1)) * lastIndex;
    const leftIndex = Math.floor(ratio);
    const rightIndex = Math.min(lastIndex, leftIndex + 1);
    const blend = ratio - leftIndex;

    const leftValue = values[leftIndex] ?? values[0] ?? 0;
    const rightValue = values[rightIndex] ?? leftValue;
    const leftBar = bars[leftIndex] ?? bars[0] ?? 0;
    const rightBar = bars[rightIndex] ?? leftBar;

    densifiedValues.push(Number((leftValue + (rightValue - leftValue) * blend).toFixed(3)));
    densifiedBars.push(Math.round(leftBar + (rightBar - leftBar) * blend));

    const originalSlot = Math.round(ratio);
    densifiedDates.push(index === 0 || index === targetCount - 1 || Math.abs(ratio - originalSlot) < 0.001 ? dates[originalSlot] ?? "" : "");
  }

  return {
    values: densifiedValues,
    bars: densifiedBars,
    dates: densifiedDates,
  };
}

function emphasizeBarContrast(values: number[], strength: number) {
  if (values.length === 0) {
    return values;
  }

  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  return values.map((value) => Math.max(80, Math.round(average + (value - average) * strength)));
}

function stretchBarContrast(values: number[], minFillRatio: number, exponent: number) {
  if (values.length === 0) {
    return values;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  if (range <= 0) {
    return values;
  }

  const visualMax = max;
  const visualMin = Math.max(80, Math.round(visualMax * minFillRatio));

  return values.map((value) => {
    const normalized = (value - min) / range;
    const stretched = visualMin + Math.pow(normalized, exponent) * (visualMax - visualMin);
    return Math.round(stretched);
  });
}

function enforceVisualBarSpacing(
  values: number[],
  minGapRatio: number,
  floorRatio: number,
) {
  if (values.length <= 1) {
    return values;
  }

  const max = Math.max(...values);
  const floor = Math.max(80, Math.round(max * floorRatio));
  const gap = Math.max(6, Math.round(max * minGapRatio));

  const ranked = values
    .map((value, index) => ({ value, index }))
    .sort((left, right) => left.value - right.value);

  const spaced: number[] = new Array(values.length).fill(floor);
  let cursor = floor;

  ranked.forEach((entry, rank) => {
    if (rank === 0) {
      spaced[entry.index] = floor;
      return;
    }

    cursor = Math.min(max, cursor + gap);
    spaced[entry.index] = cursor;
  });

  const originalMin = Math.min(...values);
  const originalMax = Math.max(...values);
  const originalRange = Math.max(1, originalMax - originalMin);

  return values.map((value, index) => {
    const normalized = (value - originalMin) / originalRange;
    const rankedValue = spaced[index];
    const blended = rankedValue * 0.72 + (floor + normalized * (max - floor)) * 0.28;
    return Math.round(Math.max(floor, Math.min(max, blended)));
  });
}

function scaleAxisValues(labels: string[], scale: number) {
  return labels.map((label) => {
    if (!/\d/.test(label)) {
      return label;
    }

    const scaledValue = parseNumericText(label) * scale;
    const formatted = formatNumberLike(label.replace(/[Kk]/g, ""), scaledValue);
    return label.includes("K") ? `${formatted}K` : formatted;
  });
}

function buildIndexDataset(card: IndexCardData, timeframe: TimeframeKey): ChartDataset {
  const base = CHART_DATA[timeframe];
  const targetClose = parseNumericText(card.value) || parseNumericText(base.currentValue);
  const targetDelta = parseNumericText(card.delta);
  const targetChange = parseNumericText(card.change);
  const baseClose = parseNumericText(base.currentValue) || targetClose;
  const scale = targetClose / Math.max(baseClose, 1);
  const volatility = INDEX_VOLATILITY[card.key] ?? 1;
  const sparkMomentum =
    ((card.spark[card.spark.length - 1] ?? 50) - (card.spark[0] ?? 50)) / 100;
  const timeframeAmplitude =
    timeframe === "1h" ? 0.34 : timeframe === "4h" ? 0.48 : timeframe === "1d" ? 0.72 : timeframe === "1w" ? 0.9 : 1.08;
  const amplitude = 1 + sparkMomentum * 0.16 * timeframeAmplitude;
  const offsetScale =
    timeframe === "1h" ? 0.006 : timeframe === "4h" ? 0.009 : timeframe === "1d" ? 0.012 : timeframe === "1w" ? 0.015 : 0.018;

  let lineValues = base.lineValues.map((value, index) => {
    const sparkValue = sampleSparkValue(card.spark, index, base.lineValues.length);
    const sparkOffset = ((sparkValue - 50) / 50) * targetClose * offsetScale * volatility;
    return value * scale * amplitude + sparkOffset;
  });

  const lineShift = targetClose - (lineValues[lineValues.length - 1] ?? targetClose);
  lineValues = smoothSeries(
    lineValues.map((value) => Number((value + lineShift).toFixed(3))),
    timeframe === "1h" ? 0.28 : timeframe === "4h" ? 0.24 : timeframe === "1d" ? 0.22 : 0.18,
  );

  const baseBarMax = Math.max(...base.bars, 1);
  const volumeScale =
    (timeframe === "1h" ? 0.88 : timeframe === "4h" ? 0.92 : 0.96) +
    Math.min(Math.abs(targetChange) / 8, 0.32) +
    Math.abs(sparkMomentum) * 0.18;
  const rawBars = base.bars.map((value, index) => {
    const sparkValue = sampleSparkValue(card.spark, index, base.bars.length);
    const sparkScale = 0.82 + sparkValue / 180;
    return Math.max(Math.round((value / baseBarMax) * baseBarMax * volumeScale * sparkScale * volatility), 80);
  });
  const contrastStrength =
    card.key === "oss"
      ? timeframe === "1h"
        ? 1.55
        : timeframe === "4h"
          ? 1.48
          : timeframe === "1d"
            ? 1.36
            : timeframe === "1w"
              ? 1.3
              : 1.24
      : timeframe === "1h"
        ? 1.28
        : timeframe === "4h"
          ? 1.22
          : 1.16;
  const contrastedBars = stretchBarContrast(
    emphasizeBarContrast(rawBars, contrastStrength),
    card.key === "oss"
      ? timeframe === "1h"
        ? 0.24
        : timeframe === "4h"
          ? 0.22
          : timeframe === "1d"
            ? 0.18
            : timeframe === "1w"
              ? 0.2
              : 0.19
      : timeframe === "1h"
        ? 0.2
        : timeframe === "4h"
          ? 0.18
          : 0.16,
    card.key === "oss" ? 0.62 : 0.82,
  );
  const bars = enforceVisualBarSpacing(
    contrastedBars,
    card.key === "oss"
      ? timeframe === "1h"
        ? 0.048
        : timeframe === "4h"
          ? 0.044
          : timeframe === "1d"
            ? 0.03
            : timeframe === "1w"
              ? 0.04
              : 0.038
      : timeframe === "1h"
        ? 0.032
        : timeframe === "4h"
          ? 0.03
          : 0.026,
    card.key === "oss"
      ? timeframe === "1h"
        ? 0.16
        : timeframe === "4h"
          ? 0.15
          : timeframe === "1d"
            ? 0.14
            : 0.145
      : 0.13,
  );

  const openValue = lineValues[0] ?? targetClose;
  const closeValue = targetClose;
  const highValue = Math.max(...lineValues, closeValue + Math.abs(targetDelta) * 0.45);
  const lowValue = Math.min(...lineValues, closeValue - Math.abs(targetDelta) * 0.45);

  const targetCount =
    timeframe === "1h" ? 24 : timeframe === "4h" ? 20 : timeframe === "1w" ? 16 : timeframe === "1m" ? 18 : base.dates.length;
  const densified = densifySeries(lineValues, bars, base.dates, targetCount);

  return {
    ...base,
    currentValue: formatNumberLike(base.currentValue, targetClose),
    changeValue: `${formatSignedNumber(targetDelta)} (${formatSignedPercent(targetChange)})`,
    bars: densified.bars,
    lineValues: densified.values,
    dates: densified.dates,
    leftAxis: scaleAxisValues(base.leftAxis, scale),
    rightAxis: scaleAxisValues(base.rightAxis, volumeScale * volatility),
    metrics: base.metrics.map((metric) => {
      const metricKey = metric.label.en.toLowerCase();

      if (metricKey === "open") {
        return { ...metric, value: formatNumberLike(metric.value, openValue), tone: "neutral" as const };
      }

      if (metricKey === "high") {
        return { ...metric, value: formatNumberLike(metric.value, highValue), tone: "up" as const };
      }

      if (metricKey === "low") {
        return { ...metric, value: formatNumberLike(metric.value, lowValue), tone: "down" as const };
      }

      if (metricKey === "change") {
        return {
          ...metric,
          value: formatSignedPercent(targetChange),
          tone: targetChange < 0 ? ("down" as const) : ("up" as const),
        };
      }

      return { ...metric, value: formatNumberLike(metric.value, closeValue), tone: "neutral" as const };
    }),
  };
}

function calculateMovingAverage(values: number[], period: number) {
  return values.map((_, index) => {
    const start = Math.max(0, index - period + 1);
    const window = values.slice(start, index + 1);
    return Number((window.reduce((sum, value) => sum + value, 0) / period).toFixed(3));
  });
}

function buildChartSeries(dataset: ChartDataset, timeframe: TimeframeKey): MarketChartPoint[] {
  const closes = dataset.lineValues;
  const maxBarSeed = Math.max(...dataset.bars, 1);

  const rows = closes.map((close, index) => {
    const previousClose = index === 0 ? close * 0.996 : closes[index - 1] ?? close;
    const open = Number((index === 0 ? previousClose : previousClose + (close - previousClose) * 0.28).toFixed(3));
    const spread = Math.max((dataset.bars[index] / maxBarSeed) * close * 0.012, close * 0.0045);
    const high = Number((Math.max(open, close) + spread).toFixed(3));
    const low = Number((Math.min(open, close) - spread * 0.82).toFixed(3));
    const label = dataset.dates[index] ?? `${index}`;
    const date =
      timeframe === "1d"
        ? `2026-${label.replace("/", "-")}T09:00:00`
        : timeframe === "1h"
          ? `2026-03-22T${label.padStart(5, "0")}:00`
          : `2026-${String(index + 1).padStart(2, "0")}-01T09:00:00`;

    return {
      date,
      label,
      value: close,
      closeBar: dataset.bars[index] ?? 0,
      open,
      high,
      low,
      close: Number(close.toFixed(3)),
      volume: Math.round(dataset.bars[index] * 42 + 10000),
      ma5: null,
      ma20: null,
      ma60: null,
    };
  });

  const ma5 = calculateMovingAverage(rows.map((row) => row.close), 5);
  const ma20 = calculateMovingAverage(rows.map((row) => row.close), 20);
  const ma60 = calculateMovingAverage(rows.map((row) => row.close), 60);

  return rows.map((row, index) => ({
    ...row,
    ma5: ma5[index],
    ma20: ma20[index],
    ma60: ma60[index],
  }));
}

function formatTooltipDate(value: string) {
  return new Date(value).toLocaleString("ko-KR");
}

function formatTooltipNumber(value: number, decimals = 2) {
  return value.toLocaleString("ko-KR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function CustomPriceTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey?: string; value?: number }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0 || !label) {
    return null;
  }

  const values = new Map<string, number>();
  payload.forEach((entry) => {
    if (entry.dataKey && typeof entry.value === "number") {
      values.set(entry.dataKey, entry.value);
    }
  });

  const rows = [
    { key: "open", label: "시가" },
    { key: "high", label: "고가" },
    { key: "low", label: "저가" },
    { key: "close", label: "종가" },
    { key: "ma5", label: "MA5" },
    { key: "ma20", label: "MA20" },
    { key: "ma60", label: "MA60" },
  ].filter((row) => values.has(row.key));

  return (
    <div className="rounded-[6px] border border-[#2b2f36] bg-[#0d1117] px-[10px] py-2 text-[11px] text-[#d1d4dc] shadow-[0px_8px_24px_rgba(0,0,0,0.28)]">
      <p className="mb-1 text-[#848e9c]">{formatTooltipDate(label)}</p>
      <div className="space-y-1">
        {rows.map((row) => (
          <div key={row.key} className="flex min-w-[132px] items-center justify-between gap-4">
            <span className="text-[#848e9c]">{row.label}</span>
            <span>{formatTooltipNumber(values.get(row.key) ?? 0)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomVolumeTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0 || !label || typeof payload[0]?.value !== "number") {
    return null;
  }

  return (
    <div className="rounded-[6px] border border-[#2b2f36] bg-[#0d1117] px-[10px] py-2 text-[11px] text-[#d1d4dc] shadow-[0px_8px_24px_rgba(0,0,0,0.28)]">
      <p className="mb-1 text-[#848e9c]">{formatTooltipDate(label)}</p>
      <div className="flex min-w-[132px] items-center justify-between gap-4">
        <span className="text-[#848e9c]">거래량</span>
        <span>{Math.round(payload[0].value).toLocaleString("ko-KR")}</span>
      </div>
    </div>
  );
}

function chartSeriesDescriptions(locale: MarketLocale): Record<ChartSeriesKey, { label: string; color: string; body: string }> {
  if (locale === "ko") {
    return {
      closeBar: {
        label: "종가 막대",
        color: "bg-[rgba(216,91,53,0.18)] text-[#d85b35] border-[rgba(216,91,53,0.28)]",
        body: "각 막대는 해당 구간의 종가 레벨을 빠르게 비교하기 위한 컬럼입니다. 시간대별 상대 위치와 변화 폭을 한눈에 보여줍니다.",
      },
      close: {
        label: "종가",
        color: "bg-[rgba(78,140,255,0.16)] text-[#4e8cff] border-[rgba(78,140,255,0.28)]",
        body: "종가는 각 구간이 끝날 때의 대표 지수 값입니다. 시장 흐름을 읽을 때 가장 기본이 되는 기준선입니다.",
      },
      ma5: {
        label: "MA5",
        color: "bg-[rgba(34,197,94,0.16)] text-[#22c55e] border-[rgba(34,197,94,0.28)]",
        body: "MA5는 최근 5개 구간 종가의 평균선입니다. 단기 흐름이 가속되는지 또는 꺾이는지 빠르게 파악할 수 있습니다.",
      },
      ma20: {
        label: "MA20",
        color: "bg-[rgba(249,115,22,0.16)] text-[#f97316] border-[rgba(249,115,22,0.28)]",
        body: "MA20은 최근 20개 구간 종가 평균선입니다. 단기 노이즈를 줄이고 중간 흐름의 방향성을 읽는 데 사용합니다.",
      },
    };
  }

  return {
    closeBar: {
      label: "Close Bars",
      color: "bg-[rgba(216,91,53,0.18)] text-[#d85b35] border-[rgba(216,91,53,0.28)]",
      body: "Each column represents the closing level for its interval, making relative movement and amplitude easier to scan.",
    },
    close: {
      label: "Close",
      color: "bg-[rgba(78,140,255,0.16)] text-[#4e8cff] border-[rgba(78,140,255,0.28)]",
      body: "Close is the representative index value at the end of each interval and serves as the primary market baseline.",
    },
    ma5: {
      label: "MA5",
      color: "bg-[rgba(34,197,94,0.16)] text-[#22c55e] border-[rgba(34,197,94,0.28)]",
      body: "MA5 is the average of the latest 5 closing intervals and helps identify short-term acceleration or pullback.",
    },
    ma20: {
      label: "MA20",
      color: "bg-[rgba(249,115,22,0.16)] text-[#f97316] border-[rgba(249,115,22,0.28)]",
      body: "MA20 smooths the latest 20 closing intervals to show the medium-term direction with less noise.",
    },
  };
}

const HEATMAP_TILES: HeatTileData[] = [
  { name: "Argo CD", change: "+4.20%", tone: "up", desktopCol: 1, desktopRow: 1 },
  { name: "Kubernetes", change: "+2.40%", tone: "up", desktopCol: 2, desktopRow: 1 },
  { name: "Prometheus", change: "+2.08%", tone: "up", desktopCol: 3, desktopRow: 1 },
  { name: "Grafana", change: "+1.77%", tone: "up", desktopCol: 4, desktopRow: 1 },
  { name: "Envoy", change: "+0.96%", tone: "up", desktopCol: 5, desktopRow: 1 },
  { name: "Terraform", change: "+1.41%", tone: "up", desktopCol: 6, desktopRow: 1 },
  { name: "Cilium", change: "-0.60%", tone: "down", desktopCol: 1, desktopRow: 2 },
  { name: "Istio", change: "-1.57%", tone: "down", desktopCol: 2, desktopRow: 2 },
  { name: "Docker", change: "+1.13%", tone: "up", desktopCol: 3, desktopRow: 2 },
  { name: "etcd", change: "-0.51%", tone: "down", desktopCol: 4, desktopRow: 2 },
  { name: "containerd", change: "-0.38%", tone: "down", desktopCol: 5, desktopRow: 2 },
];

const STOCK_CARDS: StockCardData[] = [
  {
    key: "kubernetes",
    name: "Kubernetes",
    category: "Orchestration",
    rank: 1,
    score: "94.5",
    delta: "▲ 2.1",
    change: "+2.29%",
    tone: "up",
    trust: "83.8",
    attention: 57,
    execution: 29,
    health: 14,
    spark: [82, 83, 83, 84, 85, 86, 88, 89],
    href: "/market/trading/kubernetes",
  },
  {
    key: "prometheus",
    name: "Prometheus",
    category: "Observability",
    rank: 2,
    score: "88.2",
    delta: "▲ 1.3",
    change: "+1.50%",
    tone: "up",
    trust: "84.1",
    attention: 47,
    execution: 43,
    health: 10,
    spark: [78, 79, 80, 80, 81, 82, 83, 84],
    href: "/market/trading/prometheus",
  },
  {
    key: "cilium",
    name: "Cilium",
    category: "Networking",
    rank: 5,
    score: "82.7",
    delta: "▼ 0.8",
    change: "-0.95%",
    tone: "down",
    trust: "76.4",
    attention: 42,
    execution: 33,
    health: 25,
    spark: [79, 78, 77, 76, 75, 74, 73, 72],
    href: "/market/trading/cilium",
  },
  {
    key: "argo-cd",
    name: "Argo CD",
    category: "CI/CD",
    rank: 7,
    score: "79.4",
    delta: "▲ 2.4",
    change: "+4.20%",
    tone: "up",
    trust: "81.0",
    attention: 71,
    execution: 21,
    health: 8,
    spark: [68, 70, 72, 74, 75, 77, 78, 80],
    href: "/market/trading/argo-cd",
  },
  {
    key: "grafana",
    name: "Grafana",
    category: "Observability",
    rank: 3,
    score: "86.1",
    delta: "▲ 1.5",
    change: "+1.77%",
    tone: "up",
    trust: "85.7",
    attention: 72,
    execution: 22,
    health: 7,
    spark: [78, 79, 80, 80, 81, 82, 83, 84],
    href: "/market/trading/grafana",
  },
  {
    key: "istio",
    name: "Istio",
    category: "Service Mesh",
    rank: 12,
    score: "75.3",
    delta: "▼ 1.2",
    change: "-1.57%",
    tone: "down",
    trust: "72.9",
    attention: 35,
    execution: 42,
    health: 23,
    spark: [74, 73, 72, 71, 70, 69, 68, 67],
    href: "/market/trading/istio",
  },
  {
    key: "envoy",
    name: "Envoy",
    category: "Networking",
    rank: 4,
    score: "83.9",
    delta: "▲ 0.8",
    change: "+0.96%",
    tone: "up",
    trust: "80.5",
    attention: 57,
    execution: 29,
    health: 14,
    spark: [80, 81, 82, 81, 83, 84, 84, 85],
    href: "/market/trading/envoy",
  },
  {
    key: "containerd",
    name: "containerd",
    category: "Container Runtime",
    rank: 9,
    score: "78.6",
    delta: "▼ 0.3",
    change: "-0.38%",
    tone: "down",
    trust: "77.1",
    attention: 44,
    execution: 37,
    health: 19,
    spark: [76, 75, 74, 74, 73, 72, 71, 70],
    href: "/market/trading/containerd",
  },
  {
    key: "docker",
    name: "Docker",
    category: "Container Platform",
    rank: 6,
    score: "80.8",
    delta: "▲ 0.9",
    change: "+1.13%",
    tone: "up",
    trust: "79.8",
    attention: 54,
    execution: 30,
    health: 16,
    spark: [74, 75, 76, 77, 77, 78, 79, 80],
    href: "/market/trading/docker",
  },
  {
    key: "etcd",
    name: "etcd",
    category: "Distributed Database",
    rank: 10,
    score: "77.8",
    delta: "▼ 0.4",
    change: "-0.51%",
    tone: "down",
    trust: "71.3",
    attention: 39,
    execution: 37,
    health: 24,
    spark: [72, 72, 71, 70, 69, 68, 68, 67],
    href: "/market/trading/etcd",
  },
  {
    key: "terraform",
    name: "Terraform",
    category: "Infrastructure as Code",
    rank: 8,
    score: "79.2",
    delta: "▲ 1.1",
    change: "+1.41%",
    tone: "up",
    trust: "82.4",
    attention: 63,
    execution: 24,
    health: 13,
    spark: [70, 71, 72, 73, 74, 76, 77, 79],
    href: "/market/trading/terraform",
  },
];

function buildPath(values: number[], width: number, height: number) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = values.length === 1 ? width / 2 : (width / (values.length - 1)) * index;
      const y = ((max - value) / range) * (height - 6) + 3;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

function toneClasses(tone: TrendTone) {
  if (tone === "up") {
    return {
      line: "#c84a31",
      text: "text-[#c84a31]",
      tile: "bg-[rgba(200,74,49,0.1)] text-[#c84a31]",
      heatmap: "border-[rgba(200,74,49,0.26)] bg-[rgba(200,74,49,0.36)]",
    };
  }

  if (tone === "down") {
    return {
      line: "#1261c4",
      text: "text-[#1261c4]",
      tile: "bg-[rgba(18,97,196,0.1)] text-[#1261c4]",
      heatmap: "border-[rgba(18,97,196,0.26)] bg-[rgba(18,97,196,0.32)]",
    };
  }

  return {
    line: "#848e9c",
    text: "text-[#848e9c]",
    tile: "bg-[rgba(132,142,156,0.1)] text-[#848e9c]",
    heatmap: "border-[rgba(132,142,156,0.24)] bg-[rgba(43,47,54,0.5)]",
  };
}

function heatmapPlacementClass(tile: HeatTileData) {
  if (tile.desktopCol === 1 && tile.desktopRow === 1) return "md:col-start-1 md:row-start-1";
  if (tile.desktopCol === 2 && tile.desktopRow === 1) return "md:col-start-2 md:row-start-1";
  if (tile.desktopCol === 3 && tile.desktopRow === 1) return "md:col-start-3 md:row-start-1";
  if (tile.desktopCol === 4 && tile.desktopRow === 1) return "md:col-start-4 md:row-start-1";
  if (tile.desktopCol === 5 && tile.desktopRow === 1) return "md:col-start-5 md:row-start-1";
  if (tile.desktopCol === 6 && tile.desktopRow === 1) return "md:col-start-6 md:row-start-1";
  if (tile.desktopCol === 1 && tile.desktopRow === 2) return "md:col-start-1 md:row-start-2";
  if (tile.desktopCol === 2 && tile.desktopRow === 2) return "md:col-start-2 md:row-start-2";
  if (tile.desktopCol === 3 && tile.desktopRow === 2) return "md:col-start-3 md:row-start-2";
  if (tile.desktopCol === 4 && tile.desktopRow === 2) return "md:col-start-4 md:row-start-2";
  if (tile.desktopCol === 5 && tile.desktopRow === 2) return "md:col-start-5 md:row-start-2";
  if (tile.desktopCol === 6 && tile.desktopRow === 2) return "md:col-start-6 md:row-start-2";
  return "";
}

function SummaryIcon({ tone }: { tone: SummaryCardData["tone"] }) {
  const wrapper =
    tone === "blue"
      ? "bg-[rgba(51,102,255,0.1)] text-[#3366ff]"
      : tone === "emerald"
        ? "bg-[rgba(34,171,148,0.1)] text-[#22ab94]"
        : tone === "red"
          ? "bg-[rgba(200,74,49,0.1)] text-[#c84a31]"
          : "bg-[rgba(132,142,156,0.1)] text-[#848e9c]";

  return (
    <div className={`flex h-9 w-9 items-center justify-center rounded-[4px] ${wrapper}`}>
      {tone === "blue" ? (
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
          <rect height="10" rx="1.4" stroke="currentColor" strokeWidth="1.2" width="10" x="3" y="4" />
          <path d="M5 2.5V5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
          <path d="M11 2.5V5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
        </svg>
      ) : tone === "emerald" ? (
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
          <path d="M4 11L7.25 7.75L9.5 10L12 4.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
        </svg>
      ) : tone === "red" ? (
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
          <path d="M4 10.5H6.5L8 7.5L9.3 9.25H12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
        </svg>
      ) : (
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
          <path d="M8 8C9.38 8 10.5 6.88 10.5 5.5C10.5 4.12 9.38 3 8 3C6.62 3 5.5 4.12 5.5 5.5C5.5 6.88 6.62 8 8 8Z" stroke="currentColor" strokeWidth="1.2" />
          <path d="M3.5 13C4.3 10.96 5.91 10 8 10C10.09 10 11.7 10.96 12.5 13" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
        </svg>
      )}
    </div>
  );
}

function Sparkline({ values, stroke }: { values: number[]; stroke: string }) {
  return (
    <svg className="h-10 w-full" viewBox="0 0 281 40" xmlns="http://www.w3.org/2000/svg">
      <path d={buildPath(values, 281, 40)} fill="none" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function SummaryCard({ card, locale }: { card: SummaryCardData; locale: MarketLocale }) {
  return (
    <div className="market-panel flex h-[58px] items-center gap-[10px] px-[11px] py-px">
      <SummaryIcon tone={card.tone} />
      <div className="flex min-w-0 flex-col">
        <span className="text-[9px] leading-[13.5px] text-[#848e9c]">{card.label[locale]}</span>
        <span className="text-[12px] font-semibold leading-4 text-[#d1d4dc]">{card.value[locale]}</span>
      </div>
    </div>
  );
}

function IndexCard({
  card,
  locale,
  active,
  onSelect,
}: {
  card: IndexCardData;
  locale: MarketLocale;
  active: boolean;
  onSelect: (key: string) => void;
}) {
  const tone = toneClasses(card.tone);

  return (
    <button
      aria-pressed={active}
      className={`market-panel h-full p-3 text-left transition ${
        active
          ? "border-[#3366ff] bg-[rgba(51,102,255,0.08)] shadow-[0px_0px_0px_1px_rgba(51,102,255,0.28)]"
          : "hover:border-[#3a4050] hover:bg-[#20242d]"
      }`}
      onClick={() => onSelect(card.key)}
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] leading-[15px] text-[#848e9c]">{card.eyebrow[locale]}</p>
          <h3 className="mt-0.5 text-[14px] font-semibold leading-5 text-[#d1d4dc]">{card.label}</h3>
        </div>
        <span className={tone.text}>
          <svg aria-hidden="true" className="h-[14px] w-[14px]" fill="none" viewBox="0 0 14 14">
            {card.tone === "down" ? (
              <path d="M3 4.5H11L7.75 9.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
            ) : (
              <path d="M3 9.5H11L7.75 4.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
            )}
          </svg>
        </span>
      </div>

      <div className="mt-3">
        <Sparkline stroke={tone.line} values={card.spark} />
      </div>

      <div className="mt-2">
        <p className="text-[20px] font-bold leading-7 text-[#d1d4dc]">{card.value}</p>
        <div className={`mt-0.5 flex items-center gap-1 text-[12px] leading-4 ${tone.text}`}>
          <span className="font-medium">{card.delta}</span>
          <span>{card.change}</span>
        </div>
      </div>
    </button>
  );
}

function RegimeBar({
  locale,
  averageChangeRate,
}: {
  locale: MarketLocale;
  averageChangeRate: number;
}) {
  const text = COPY[locale];
  const tone = averageChangeRate > 0.25 ? "up" : averageChangeRate < -0.25 ? "down" : "neutral";
  const title =
    tone === "up"
      ? text.regimeBullTitle
      : tone === "down"
        ? text.regimeBearTitle
        : text.regimeNeutralTitle;
  const description =
    tone === "up"
      ? text.regimeBullDescription
      : tone === "down"
        ? text.regimeBearDescription
        : text.regimeNeutralDescription;
  const classes =
    tone === "up"
      ? "border-[rgba(200,74,49,0.2)] bg-[rgba(200,74,49,0.1)] text-[#c84a31]"
      : tone === "down"
        ? "border-[rgba(18,97,196,0.2)] bg-[rgba(18,97,196,0.1)] text-[#4e8cff]"
        : "border-[rgba(132,142,156,0.24)] bg-[rgba(132,142,156,0.08)] text-[#d1d4dc]";

  return (
    <div className={`flex items-center gap-[10px] rounded-[4px] border px-[11px] py-px ${classes}`}>
      <span>
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
          {tone === "down" ? (
            <path d="M3.5 5.75L6.25 8.5L8 6.75L12.5 11.25" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
          ) : (
            <path d="M3.5 11.25L6.25 8.5L8 10.25L12.5 5.75" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
          )}
        </svg>
      </span>
      <div className="py-1.5">
        <p className="text-[12px] font-semibold leading-4">{title}</p>
        <p className="text-[10px] leading-[15px] text-[#848e9c]">{description}</p>
      </div>
    </div>
  );
}

function ExpandIcon({ expanded = false }: { expanded?: boolean }) {
  if (expanded) {
    return (
      <svg aria-hidden="true" className="h-4 w-4 text-[#848e9c]" fill="none" viewBox="0 0 16 16">
        <path d="M5 5L11 11" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
        <path d="M11 5L5 11" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="h-4 w-4 text-[#848e9c]" fill="none" viewBox="0 0 16 16">
      <path d="M6 10L10 6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
      <path d="M6.5 5.5H10.5V9.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
    </svg>
  );
}

function AdvancedChart({
  locale,
  activeIndex,
}: {
  locale: MarketLocale;
  activeIndex: IndexCardData;
}) {
  const text = COPY[locale];
  const seriesDescriptions = chartSeriesDescriptions(locale);
  const timeframeKeys: TimeframeKey[] = ["1h", "4h", "1d", "1w", "1m"];
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeKey>("1d");
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredSeries, setHoveredSeries] = useState<ChartSeriesKey>("close");

  const dataset = buildIndexDataset(activeIndex, selectedTimeframe);
  const changeTone = dataset.changeValue.startsWith("-") ? "text-[#1261c4]" : "text-[#c84a31]";
  const chartData = useMemo(() => buildChartSeries(dataset, selectedTimeframe), [dataset, selectedTimeframe]);

  useEffect(() => {
    if (!isExpanded) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsExpanded(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isExpanded]);

  const renderChartBody = (expanded: boolean) => {
    const priceAreaHeight = expanded ? 360 : 280;
    const volumeAreaHeight = expanded ? 112 : 88;

    return (
      <>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[10px] leading-[15px] text-[#848e9c]">{activeIndex.eyebrow[locale]}</p>
            <h2 className="text-[16px] font-semibold leading-6 text-[#d1d4dc]">{activeIndex.label}</h2>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <span className="text-[24px] font-bold leading-8 text-[#d1d4dc]">{dataset.currentValue}</span>
              <span className={`text-[14px] font-semibold leading-5 ${changeTone}`}>↗ {dataset.changeValue}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start">
            <div className="flex h-[29px] items-center gap-[2px] rounded-[4px] border border-[#2b2f36] bg-[#0d1117] px-[3px] py-px">
              {timeframeKeys.map((key, index) => {
                const active = key === selectedTimeframe;
                return (
                  <button
                    key={key}
                    className={`inline-flex h-[23px] items-center justify-center rounded-[4px] px-3 text-[10px] font-medium leading-[15px] transition ${
                      active
                        ? "bg-[#1f6feb] text-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]"
                        : "text-[#848e9c] hover:bg-[rgba(43,47,54,0.42)] hover:text-[#d1d4dc]"
                    }`}
                    onClick={() => {
                      setSelectedTimeframe(key);
                    }}
                    type="button"
                  >
                    {text.timeframes[index]}
                  </button>
                );
              })}
            </div>
            <button
              aria-label={expanded ? text.fullscreenClose : text.fullscreenOpen}
              className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] text-[#848e9c] transition hover:bg-[rgba(43,47,54,0.42)] hover:text-[#d1d4dc]"
              onClick={() => setIsExpanded((value) => !value)}
              type="button"
            >
              <ExpandIcon expanded={expanded} />
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {(Object.entries(seriesDescriptions) as Array<[ChartSeriesKey, (typeof seriesDescriptions)[ChartSeriesKey]]>).map(([key, item]) => (
              <button
                key={key}
                type="button"
                onMouseEnter={() => setHoveredSeries(key)}
                onFocus={() => setHoveredSeries(key)}
                className={cn(
                  "rounded-[4px] border px-2 py-1 text-[8px] font-semibold leading-[10px] transition",
                  item.color,
                  hoveredSeries === key && "shadow-[0_0_0_1px_rgba(255,255,255,0.08)]",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="rounded-[6px] border border-[#2b2f36] bg-[#11161f] px-3 py-3">
            <p className="text-[10px] uppercase tracking-[0.8px] text-[#6f7c8f]">
              {locale === "ko" ? "시리즈 설명" : "Series guide"}
            </p>
            <p className="mt-2 text-[12px] font-semibold text-[#d1d4dc]">{seriesDescriptions[hoveredSeries].label}</p>
            <p className="mt-1 text-[12px] leading-6 text-[#9aa4b2]">{seriesDescriptions[hoveredSeries].body}</p>
          </div>

          <div className="market-scroll overflow-x-auto">
            <div className={dataset.dates.length > 12 ? "min-w-[1024px]" : "min-w-[760px]"}>
              <div style={{ height: `${priceAreaHeight}px`, minWidth: "760px" }}>
                <ResponsiveContainer height="100%" width="100%">
                  <ComposedChart data={chartData} syncId="ossMarket" barCategoryGap="6%" barGap={0} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                    <CartesianGrid stroke="#2b2f36" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" minTickGap={16} stroke="#6c7284" tick={{ fill: "#6c7284", fontSize: 10 }} />
                    <YAxis
                      yAxisId="price"
                      domain={["dataMin - 8", "dataMax + 8"]}
                      stroke="#6c7284"
                      tick={{ fill: "#6c7284", fontSize: 10 }}
                      tickFormatter={(value: number) => value.toLocaleString("en-US", { maximumFractionDigits: 3 })}
                    />
                    <YAxis yAxisId="bars" domain={[0, "dataMax"]} hide />
                    <Tooltip content={<CustomPriceTooltip />} />
                    <Bar
                      dataKey="closeBar"
                      fill="#d85b35"
                      fillOpacity={0.42}
                      maxBarSize={26}
                      radius={[2, 2, 0, 0]}
                      yAxisId="bars"
                      name="종가 막대"
                      onMouseEnter={() => setHoveredSeries("closeBar")}
                      onMouseMove={() => setHoveredSeries("closeBar")}
                    />
                    <Line
                      connectNulls
                      dataKey="close"
                      dot={false}
                      name="종가"
                      stroke="#4e8cff"
                      strokeWidth={2}
                      type="monotone"
                      yAxisId="price"
                      onMouseEnter={() => setHoveredSeries("close")}
                      onMouseMove={() => setHoveredSeries("close")}
                    />
                    <Line
                      connectNulls
                      dataKey="ma5"
                      dot={false}
                      name="MA5"
                      stroke="#22c55e"
                      strokeWidth={1.5}
                      type="monotone"
                      yAxisId="price"
                      onMouseEnter={() => setHoveredSeries("ma5")}
                      onMouseMove={() => setHoveredSeries("ma5")}
                    />
                    <Line
                      connectNulls
                      dataKey="ma20"
                      dot={false}
                      name="MA20"
                      stroke="#f97316"
                      strokeWidth={1.5}
                      type="monotone"
                      yAxisId="price"
                      onMouseEnter={() => setHoveredSeries("ma20")}
                      onMouseMove={() => setHoveredSeries("ma20")}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div style={{ height: `${volumeAreaHeight}px`, minWidth: "760px" }}>
                <ResponsiveContainer height="100%" width="100%">
                  <BarChart data={chartData} syncId="ossMarket" margin={{ top: 0, right: 8, left: 8, bottom: 0 }}>
                    <CartesianGrid stroke="#2b2f36" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" minTickGap={16} stroke="#6c7284" tick={{ fill: "#6c7284", fontSize: 10 }} />
                    <YAxis
                      stroke="#6c7284"
                      tick={{ fill: "#6c7284", fontSize: 9 }}
                      tickFormatter={(value: number) => value.toLocaleString("en-US")}
                    />
                    <Tooltip content={<CustomVolumeTooltip />} />
                    <Bar dataKey="volume" fill="#4c515c" radius={[2, 2, 0, 0]} name="거래량" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-5">
          {dataset.metrics.map((metric) => (
            <div
              key={`${selectedTimeframe}-${metric.label.en}`}
              className="rounded-[4px] border border-[rgba(43,47,54,0.5)] bg-[#0d1117] px-[11px] pb-px pt-[11px]"
            >
              <p className="text-[9px] leading-[13.5px] text-[#848e9c]">{metric.label[locale]}</p>
              <p
                className={`mt-0.5 text-[12px] font-semibold leading-4 ${
                  metric.tone === "up"
                    ? "text-[#c84a31]"
                    : metric.tone === "down"
                      ? "text-[#1261c4]"
                      : "text-[#d1d4dc]"
                }`}
              >
                {metric.value}
              </p>
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <>
      <MarketPanel className="p-[17px]">{renderChartBody(false)}</MarketPanel>

      {isExpanded ? (
        <div className="fixed inset-0 z-[120] bg-[rgba(13,17,23,0.82)] p-4 backdrop-blur-[2px]">
          <div className="mx-auto flex h-full w-full max-w-[1440px] items-center justify-center">
            <MarketPanel className="w-full p-[17px] shadow-[0px_24px_80px_rgba(0,0,0,0.45)]">
              {renderChartBody(true)}
            </MarketPanel>
          </div>
        </div>
      ) : null}
    </>
  );
}

function HeatmapSection({
  locale,
  tiles,
}: {
  locale: MarketLocale;
  tiles: HeatTileData[];
}) {
  const text = COPY[locale];

  return (
    <MarketPanel className="p-4">
      <h2 className="text-[16px] font-semibold leading-6 text-[#d1d4dc]">{text.heatmapTitle}</h2>
      <p className="mt-1 text-[10px] leading-[15px] text-[#848e9c]">{text.heatmapDescription}</p>

      <div className="mt-4 grid grid-cols-2 gap-[2px] md:grid-cols-6 md:grid-rows-2">
        {tiles.map((tile) => {
          const tone = toneClasses(tile.tone);

          return (
            <div
              key={tile.name}
              className={`flex h-[92px] flex-col items-center justify-center rounded-[3px] border px-3 text-center md:h-[94px] md:px-4 ${tone.heatmap} ${heatmapPlacementClass(tile)}`}
            >
              <p className="text-[10px] font-medium leading-[15px] text-[#d1d4dc]">{tile.name}</p>
              <p className={`mt-1 text-[10px] font-medium leading-[15px] ${tone.text}`}>{tile.change}</p>
            </div>
          );
        })}
      </div>
    </MarketPanel>
  );
}

function StockCardContent({
  stock,
  locale,
}: {
  stock: StockCardData;
  locale: MarketLocale;
}) {
  const text = COPY[locale];
  const tone = toneClasses(stock.tone);

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-[6px]">
            <h3 className="text-[14px] font-semibold leading-5 text-[#d1d4dc]">{stock.name}</h3>
            <span className="rounded-[4px] bg-[rgba(43,47,54,0.5)] px-1.5 py-0.5 text-[10px] leading-[15px] text-[#848e9c]">
              #{stock.rank}
            </span>
          </div>
          <p className="mt-0.5 text-[10px] leading-[15px] text-[#848e9c]">{stock.category}</p>
        </div>
      </div>

      <div className="mt-3 h-10">
        <Sparkline stroke={tone.line} values={stock.spark} />
      </div>

      <div className="mt-2 flex items-end gap-2">
        <span className="text-[18px] font-bold leading-7 text-[#d1d4dc]">{stock.score}</span>
        <span className={`mb-[3px] text-[10px] leading-[15px] ${tone.text}`}>
          {stock.delta} ({stock.change})
        </span>
      </div>

        <div className="mt-2.5">
        <div className="flex items-center justify-between text-[10px] leading-[15px] text-[#848e9c]">
          <span>{text.distribution}</span>
          <span>
            {text.trustLabel} {stock.trust}
          </span>
        </div>
        <div className="mt-1.5 flex h-1 overflow-hidden rounded-[6px] bg-[rgba(43,47,54,0.3)]">
          <div className="bg-[#c84a31]" style={{ width: `${stock.attention}%` }} />
          <div className="bg-[#16a34a]" style={{ width: `${stock.execution}%` }} />
          <div className="bg-[#1261c4]" style={{ width: `${stock.health}%` }} />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[9px] font-medium leading-[13.5px]">
          <span className="text-[#c84a31]">
            {stock.attention}% {text.attentionLabel}
          </span>
          <span className="text-[#16a34a]">
            {stock.execution}% {text.executionLabel}
          </span>
          <span className="text-[#1261c4]">
            {stock.health}% {text.healthLabel}
          </span>
        </div>
      </div>
    </>
  );
}

function StockCard({
  stock,
  locale,
}: {
  stock: StockCardData;
  locale: MarketLocale;
}) {
  const classes =
    "market-panel block min-h-[198px] p-3 transition hover:border-[#3a4050] hover:bg-[#20242d]";

  if (stock.href) {
    return (
      <Link className={classes} href={stock.href}>
        <StockCardContent locale={locale} stock={stock} />
      </Link>
    );
  }

  return (
    <article className="market-panel min-h-[198px] p-3">
      <StockCardContent locale={locale} stock={stock} />
    </article>
  );
}

function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-[16px] font-semibold leading-6 text-[#d1d4dc]">{title}</h2>
      {action}
    </div>
  );
}

function MethodologyNotice({ locale }: { locale: MarketLocale }) {
  const text = COPY[locale];
  const items = [
    text.methodologyBullet1,
    text.methodologyBullet2,
    text.methodologyBullet3,
    text.methodologyBullet4,
    text.methodologyBullet5,
  ];

  return (
    <MarketPanel className="p-4">
      <h2 className="text-[16px] font-semibold leading-6 text-[#d1d4dc]">{text.methodologyTitle}</h2>
      <p className="mt-2 text-[12px] leading-6 text-[#9aa4b2]">{text.methodologyBody}</p>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-[12px] leading-6 text-[#d1d4dc]">
            <span className="mt-[9px] h-1.5 w-1.5 rounded-full bg-[#3366ff]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </MarketPanel>
  );
}

function MoversPanel({
  title,
  rows,
  emptyLabel,
}: {
  title: string;
  rows: TradingQuoteApi[];
  emptyLabel: string;
}) {
  return (
    <MarketPanel className="p-4">
      <h2 className="text-[16px] font-semibold leading-6 text-[#d1d4dc]">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-[12px] leading-5 text-[#848e9c]">{emptyLabel}</p>
      ) : (
        <div className="mt-3 space-y-2.5">
          {rows.map((quote, index) => {
            const isUp = quote.change_rate >= 0;
            return (
              <div
                key={`${title}-${quote.slug}`}
                className="flex items-center justify-between gap-3 rounded-[6px] border border-[#2b2f36] bg-[#161b24] px-3 py-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-[#848e9c]">#{index + 1}</span>
                    <p className="truncate text-[13px] font-semibold text-[#d1d4dc]">{quote.name}</p>
                  </div>
                  <p className="mt-1 truncate text-[11px] text-[#848e9c]">{quote.category ?? "-"}</p>
                </div>
                <div className="text-right">
                  <p className={cn("text-[13px] font-semibold", isUp ? "text-[#d6583a]" : "text-[#2f7de1]")}>
                    {formatSignedPercentValue(quote.change_rate)}
                  </p>
                  <p className="mt-1 text-[11px] text-[#848e9c]">{formatDecimal(quote.current_price)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </MarketPanel>
  );
}

export function FigmaMarketPage() {
  const locale = (useLocale() === "ko" ? "ko" : "en") as MarketLocale;
  const text = COPY[locale];
  const [quotes, setQuotes] = useState<TradingQuoteApi[]>([]);
  const [globalEntries, setGlobalEntries] = useState<LeaderboardEntryApi[]>([]);
  const [cncfEntries, setCncfEntries] = useState<LeaderboardEntryApi[]>([]);
  const [season, setSeason] = useState<SeasonApi | null>(null);
  const [categories, setCategories] = useState<CategoryApi[]>([]);
  const [marketLoading, setMarketLoading] = useState(true);
  const [marketError, setMarketError] = useState<string | null>(null);
  const [activeIndexKey, setActiveIndexKey] = useState<string>("oss");

  useEffect(() => {
    let cancelled = false;

    async function loadMarketData() {
      setMarketLoading(true);
      setMarketError(null);

      try {
        const [quoteRows, globalLeaderboard, cncfLeaderboard, currentSeason, categoryRows] = await Promise.all([
          api.trading.quotes(12),
          api.leaderboards.global({ page_size: "8" }),
          api.leaderboards.cncf({ page_size: "8" }),
          api.seasons.current(),
          api.categories.list(),
        ]);

        if (cancelled) {
          return;
        }

        setQuotes(Array.isArray(quoteRows) ? (quoteRows as TradingQuoteApi[]) : []);
        setGlobalEntries(Array.isArray(globalLeaderboard?.entries) ? (globalLeaderboard.entries as LeaderboardEntryApi[]) : []);
        setCncfEntries(Array.isArray(cncfLeaderboard?.entries) ? (cncfLeaderboard.entries as LeaderboardEntryApi[]) : []);
        setSeason((currentSeason as SeasonApi) ?? null);
        setCategories(Array.isArray(categoryRows) ? (categoryRows as CategoryApi[]) : []);
      } catch (error) {
        if (cancelled) {
          return;
        }
        setMarketError(error instanceof Error ? error.message : "시장 데이터를 불러오지 못했습니다.");
      } finally {
        if (!cancelled) {
          setMarketLoading(false);
        }
      }
    }

    void loadMarketData();

    return () => {
      cancelled = true;
    };
  }, []);

  const summaryCards = useMemo(
    () => buildSummaryCardsFromApi({ locale, season, quotes, categories }),
    [locale, season, quotes, categories],
  );
  const indexCards = useMemo(
    () => buildIndexCardsFromApi({ locale, quotes, globalEntries, cncfEntries, categories }),
    [locale, quotes, globalEntries, cncfEntries, categories],
  );
  const heatmapTiles = useMemo(() => buildHeatmapFromApi(quotes), [quotes]);
  const stockCards = useMemo(
    () => buildStockCardsFromApi({ locale, quotes, entries: globalEntries }),
    [locale, quotes, globalEntries],
  );
  const averageChangeRate = useMemo(
    () => (quotes.length > 0 ? average(quotes.map((quote) => quote.change_rate)) : 0),
    [quotes],
  );
  const topGainers = useMemo(
    () => [...quotes].sort((left, right) => right.change_rate - left.change_rate).slice(0, 3),
    [quotes],
  );
  const topLosers = useMemo(
    () => [...quotes].sort((left, right) => left.change_rate - right.change_rate).slice(0, 3),
    [quotes],
  );

  useEffect(() => {
    if (indexCards.length === 0) {
      return;
    }
    if (!indexCards.some((card) => card.key === activeIndexKey)) {
      setActiveIndexKey(indexCards[0]?.key ?? "oss");
    }
  }, [activeIndexKey, indexCards]);

  const activeIndex = indexCards.find((card) => card.key === activeIndexKey) ?? indexCards[0] ?? INDEX_CARDS[0];

  return (
    <div className="space-y-5 font-figma-body">
      <section className="relative left-1/2 -mt-5 w-screen -translate-x-1/2 border-b border-[#2b2f36] bg-[rgba(30,32,38,0.3)]">
        <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-4 px-4 py-5 sm:px-6 2xl:px-8">
          <div>
            <h1 className="text-[24px] font-bold leading-8 text-[#d1d4dc]">{text.pageTitle}</h1>
            <p className="mt-1 text-[12px] leading-4 text-[#848e9c]">{text.pageDescription}</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <SummaryCard key={card.key} card={card} locale={locale} />
            ))}
          </div>

          {marketLoading ? (
            <p className="text-[11px] leading-4 text-[#848e9c]">{text.loading}</p>
          ) : null}

          {marketError ? (
            <div className="rounded-[4px] border border-[rgba(200,74,49,0.24)] bg-[rgba(200,74,49,0.08)] px-3 py-2 text-[11px] leading-4 text-[#f1b6aa]">
              {text.errorPrefix} {marketError}
            </div>
          ) : null}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader title={text.indexesTitle} />
        <MarketPanel className="space-y-4 p-4">
          <div>
            <p className="text-[10px] leading-[15px] text-[#848e9c]">{locale === "ko" ? "선택한 지수 흐름" : "Selected index trend"}</p>
            <h3 className="mt-0.5 text-[18px] font-bold leading-7 text-[#d1d4dc]">{locale === "ko" ? "실시간 지수 차트" : "Live index chart"}</h3>
            <p className="mt-1 text-[12px] leading-5 text-[#848e9c]">
              {locale === "ko"
                ? "아래 차트에서 선택한 지수의 현재값, 변동률, 시계열 흐름을 확인할 수 있습니다."
                : "Review the selected index's latest value, change, and time-series trend in the chart below."}
            </p>
          </div>
          <AdvancedChart activeIndex={activeIndex} locale={locale} />
        </MarketPanel>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {indexCards.map((card) => (
            <IndexCard
              key={card.key}
              active={card.key === activeIndex.key}
              card={card}
              locale={locale}
              onSelect={setActiveIndexKey}
            />
          ))}
        </div>
      </section>

      <RegimeBar averageChangeRate={averageChangeRate} locale={locale} />
      <section className="grid gap-3 xl:grid-cols-2">
        <MoversPanel title={text.topGainersTitle} rows={topGainers} emptyLabel={text.movementEmpty} />
        <MoversPanel title={text.topLosersTitle} rows={topLosers} emptyLabel={text.movementEmpty} />
      </section>
      <MethodologyNotice locale={locale} />
      <HeatmapSection locale={locale} tiles={heatmapTiles} />

      <MarketPanel className="p-4">
        <SectionHeader
          title={text.stocksTitle}
          action={
            <div className="hidden items-center gap-2 md:flex">
              <button
                aria-label="Change layout"
                className="inline-flex h-6 w-6 items-center justify-center rounded-[4px] bg-[rgba(51,102,255,0.1)] text-[#3366ff]"
                type="button"
              >
                <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 14 14">
                  <rect height="4" rx="0.8" stroke="currentColor" strokeWidth="1.1" width="4" x="2" y="2" />
                  <rect height="4" rx="0.8" stroke="currentColor" strokeWidth="1.1" width="4" x="8" y="2" />
                  <rect height="4" rx="0.8" stroke="currentColor" strokeWidth="1.1" width="4" x="2" y="8" />
                  <rect height="4" rx="0.8" stroke="currentColor" strokeWidth="1.1" width="4" x="8" y="8" />
                </svg>
              </button>
              <span className="text-[10px] leading-[15px] text-[#848e9c]">{text.stocksAction}</span>
            </div>
          }
        />

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {stockCards.map((stock) => (
            <StockCard key={stock.key} locale={locale} stock={stock} />
          ))}
        </div>
      </MarketPanel>
    </div>
  );
}
