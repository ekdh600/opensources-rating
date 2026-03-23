"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { MarketPanel } from "@/components/market/MarketUi";
import {
  MARKET_TRADING_FILTERS as MARKET_FILTER_DATA,
  MARKET_TRADING_ROWS as MARKET_ROWS_DATA,
} from "@/lib/market-data";
import { cn } from "@/lib/utils";

type MarketLocale = "ko" | "en";
type TradingFilterKey = string;
type RowTone = "up" | "down";

type Localized = Record<MarketLocale, string>;

interface TradingRow {
  key: string;
  name: string;
  category: string;
  filter: Exclude<TradingFilterKey, "all">;
  rank: string;
  score: string;
  high: string;
  low: string;
  delta: string;
  changeRate: string;
  tone: RowTone;
  up: number;
  flat: number;
  down: number;
  participants: string;
  href: string;
}

const COPY: Record<
  MarketLocale,
  {
    title: string;
    description: string;
    searchPlaceholder: string;
    columns: string[];
    totalLabel: string;
    risingLabel: string;
    fallingLabel: string;
    guideLabel: string;
    guideBody: string;
    trendTitle: string;
    trendSubtitle: string;
    metrics: string[];
    emptyTitle: string;
    emptyBody: string;
  }
> = {
  ko: {
    title: "OSS 프로젝트 트레이딩",
    description: "실시간 프로젝트 분석과 예측 • 마지막 업데이트: 오후 01:18:25",
    searchPlaceholder: "프로젝트 검색...",
    columns: ["즐겨찾기", "종목명", "순위", "점수", "고점", "저점", "변동", "변동률", "예측 분포", "참여자"],
    totalLabel: "전체 프로젝트",
    risingLabel: "상승 중",
    fallingLabel: "하락 중",
    guideLabel: "트레이딩 안내:",
    guideBody:
      "각 종목을 클릭하면 상세 트레이딩 화면으로 이동합니다. 실시간 호가, 차트, 예측 제출 등 모든 기능을 이용할 수 있습니다.",
    trendTitle: "시장 추세",
    trendSubtitle: "OSS Index 30일 흐름",
    metrics: ["시작가", "최고가", "최저가", "현재가"],
    emptyTitle: "조건에 맞는 프로젝트가 없습니다.",
    emptyBody: "검색어나 카테고리를 조정해서 다시 확인해보세요.",
  },
  en: {
    title: "OSS Project Trading",
    description: "Real-time project analysis and forecasts • Last updated: 01:18:25 PM",
    searchPlaceholder: "Search projects...",
    columns: ["Favorite", "Ticker", "Rank", "Score", "High", "Low", "Delta", "Change", "Forecast", "Traders"],
    totalLabel: "Projects",
    risingLabel: "Advancers",
    fallingLabel: "Decliners",
    guideLabel: "Trading guide:",
    guideBody:
      "Click any row to open the detailed trading screen with live quotes, charts, and forecasting actions.",
    trendTitle: "Market trend",
    trendSubtitle: "OSS Index 30-day move",
    metrics: ["Open", "High", "Low", "Close"],
    emptyTitle: "No matching projects found.",
    emptyBody: "Try changing the search term or category filter.",
  },
};

const FILTERS: { key: TradingFilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "Infrastructure", label: "Infrastructure" },
  { key: "Frontend", label: "Frontend" },
  { key: "Backend", label: "Backend" },
  { key: "DevOps", label: "DevOps" },
  { key: "AI/ML", label: "AI/ML" },
  { key: "Database", label: "Database" },
];

const TRADING_ROWS: TradingRow[] = [
  {
    key: "kubernetes",
    name: "Kubernetes",
    category: "Orchestration",
    filter: "Infrastructure",
    rank: "#1",
    score: "94.5",
    high: "95.9",
    low: "93.6",
    delta: "▲ 2.3",
    changeRate: "+2.49%",
    tone: "up",
    up: 75,
    flat: 20,
    down: 5,
    participants: "1,668",
    href: "/market/trading/kubernetes",
  },
  {
    key: "prometheus",
    name: "Prometheus",
    category: "Observability",
    filter: "Backend",
    rank: "#2",
    score: "88.2",
    high: "89.3",
    low: "87.5",
    delta: "▲ 1.8",
    changeRate: "+2.08%",
    tone: "up",
    up: 71,
    flat: 19,
    down: 10,
    participants: "1,260",
    href: "/market/trading/prometheus",
  },
  {
    key: "cilium",
    name: "Cilium",
    category: "Networking",
    filter: "Infrastructure",
    rank: "#5",
    score: "82.7",
    high: "83.0",
    low: "82.5",
    delta: "▼ 0.5",
    changeRate: "-0.60%",
    tone: "down",
    up: 49,
    flat: 31,
    down: 20,
    participants: "932",
    href: "/market/trading/cilium",
  },
  {
    key: "argo-cd",
    name: "Argo CD",
    category: "CI/CD",
    filter: "DevOps",
    rank: "#7",
    score: "79.4",
    high: "81.3",
    low: "78.1",
    delta: "▲ 3.2",
    changeRate: "+4.20%",
    tone: "up",
    up: 71,
    flat: 21,
    down: 8,
    participants: "952",
    href: "/market/trading/argo-cd",
  },
  {
    key: "grafana",
    name: "Grafana",
    category: "Observability",
    filter: "Frontend",
    rank: "#3",
    score: "86.1",
    high: "87.0",
    low: "85.5",
    delta: "▲ 1.5",
    changeRate: "+1.77%",
    tone: "up",
    up: 72,
    flat: 22,
    down: 7,
    participants: "1,444",
    href: "/market/trading/grafana",
  },
  {
    key: "istio",
    name: "Istio",
    category: "Service Mesh",
    filter: "Infrastructure",
    rank: "#12",
    score: "75.3",
    high: "76.0",
    low: "74.8",
    delta: "▼ 1.2",
    changeRate: "-1.57%",
    tone: "down",
    up: 35,
    flat: 42,
    down: 23,
    participants: "980",
    href: "/market/trading/istio",
  },
  {
    key: "envoy",
    name: "Envoy",
    category: "Networking",
    filter: "Backend",
    rank: "#4",
    score: "83.9",
    high: "84.4",
    low: "83.6",
    delta: "▲ 0.8",
    changeRate: "+0.96%",
    tone: "up",
    up: 57,
    flat: 29,
    down: 14,
    participants: "1,000",
    href: "/market/trading/envoy",
  },
  {
    key: "containerd",
    name: "containerd",
    category: "Container Runtime",
    filter: "DevOps",
    rank: "#9",
    score: "78.6",
    high: "78.8",
    low: "78.5",
    delta: "▼ 0.3",
    changeRate: "-0.38%",
    tone: "down",
    up: 44,
    flat: 37,
    down: 19,
    participants: "966",
    href: "/market/trading/containerd",
  },
  {
    key: "docker",
    name: "Docker",
    category: "Container Platform",
    filter: "DevOps",
    rank: "#6",
    score: "80.8",
    high: "81.7",
    low: "80.2",
    delta: "▲ 0.9",
    changeRate: "+1.13%",
    tone: "up",
    up: 54,
    flat: 30,
    down: 16,
    participants: "1,148",
    href: "/market/trading/docker",
  },
  {
    key: "etcd",
    name: "etcd",
    category: "Distributed Database",
    filter: "Database",
    rank: "#10",
    score: "77.8",
    high: "78.4",
    low: "77.1",
    delta: "▼ 0.4",
    changeRate: "-0.51%",
    tone: "down",
    up: 39,
    flat: 37,
    down: 24,
    participants: "688",
    href: "/market/trading/etcd",
  },
  {
    key: "terraform",
    name: "Terraform",
    category: "Infrastructure as Code",
    filter: "DevOps",
    rank: "#8",
    score: "79.2",
    high: "79.9",
    low: "78.6",
    delta: "▲ 1.1",
    changeRate: "+1.41%",
    tone: "up",
    up: 63,
    flat: 24,
    down: 13,
    participants: "1,192",
    href: "/market/trading/terraform",
  },
];

const TREND_DATES = [
  "2/20",
  "2/21",
  "2/22",
  "2/23",
  "2/24",
  "2/25",
  "2/26",
  "2/27",
  "2/28",
  "3/1",
  "3/2",
  "3/3",
  "3/4",
  "3/5",
  "3/6",
  "3/7",
  "3/8",
  "3/9",
  "3/10",
  "3/11",
  "3/12",
  "3/13",
  "3/14",
  "3/15",
  "3/16",
  "3/17",
  "3/18",
  "3/19",
  "3/20",
  "3/21",
  "3/22",
];

const TREND_VALUES = [
  1185.42,
  1192.8,
  1189.4,
  1197.6,
  1205.8,
  1201.7,
  1211.4,
  1220.1,
  1216.3,
  1225.5,
  1233.9,
  1229.8,
  1239.4,
  1232.6,
  1240.7,
  1248.5,
  1243.1,
  1252.93,
  1247.4,
  1255.2,
  1249.8,
  1258.1,
  1252.6,
  1260.4,
  1255.1,
  1261.8,
  1259.4,
  1256.1,
  1247.82,
];

const TREND_AXIS = ["1,262.93", "1,225.42", "1,200.42", "1,175.42"];
const TREND_METRICS = ["1,185.42", "1,252.93", "1,185.42", "1,247.82"];

function SearchIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4 text-[#848e9c]" fill="none" viewBox="0 0 16 16">
      <circle cx="7" cy="7" r="4" stroke="currentColor" strokeWidth="1.2" />
      <path d="M10.5 10.5L13 13" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg aria-hidden="true" className="h-[14px] w-[14px] text-[#848e9c]" fill="none" viewBox="0 0 14 14">
      <path d="M2.5 3H11.5L8.6 6.2V10.5L5.4 11.8V6.2L2.5 3Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.1" />
    </svg>
  );
}

function StarIcon({ active }: { active: boolean }) {
  return (
    <svg aria-hidden="true" className={cn("h-4 w-4", active ? "text-[#f59e0b]" : "text-[#848e9c]")} fill={active ? "currentColor" : "none"} viewBox="0 0 16 16">
      <path
        d="M8 2.5L9.7 5.95L13.5 6.5L10.75 9.15L11.4 12.95L8 11.15L4.6 12.95L5.25 9.15L2.5 6.5L6.3 5.95L8 2.5Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.1"
      />
    </svg>
  );
}

function buildTrendPath(values: number[], width: number, height: number) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = values.length === 1 ? width / 2 : (width / (values.length - 1)) * index;
      const y = ((max - value) / range) * (height - 12) + 6;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

function changeToneClasses(tone: RowTone) {
  return tone === "up"
    ? {
        text: "text-[#c84a31]",
        pill: "bg-[rgba(200,74,49,0.1)] text-[#c84a31]",
      }
    : {
        text: "text-[#1261c4]",
        pill: "bg-[rgba(18,97,196,0.1)] text-[#1261c4]",
      };
}

export function FigmaMarketTradingPage() {
  const locale = (useLocale() === "ko" ? "ko" : "en") as MarketLocale;
  const text = COPY[locale];
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<TradingFilterKey>("all");
  const [favoriteKeys, setFavoriteKeys] = useState<string[]>([]);

  const visibleRows = MARKET_ROWS_DATA.filter((row) => {
    const matchesFilter = selectedFilter === "all" || row.filter === selectedFilter;
    const normalizedQuery = query.trim().toLowerCase();
    const matchesQuery =
      normalizedQuery.length === 0 ||
      row.name.toLowerCase().includes(normalizedQuery) ||
      row.category.toLowerCase().includes(normalizedQuery);
    return matchesFilter && matchesQuery;
  });

  const risingCount = visibleRows.filter((row) => row.tone === "up").length;
  const fallingCount = visibleRows.filter((row) => row.tone === "down").length;
  const trendPath = buildTrendPath(TREND_VALUES, 1452, 210);

  return (
    <div className="space-y-4 font-figma-body">
      <section className="relative left-1/2 -mx-4 -mt-5 w-screen -translate-x-1/2 border-b border-[#2b2f36] bg-[rgba(30,32,38,0.3)] sm:-mx-6 xl:mx-0">
        <div className="mx-auto flex w-full max-w-[1232px] flex-col gap-4 px-4 py-4 sm:px-6 xl:px-0">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <h1 className="text-[20px] font-bold leading-7 text-[#d1d4dc]">{text.title}</h1>
              <p className="mt-1 text-[12px] leading-4 text-[#848e9c]">{text.description}</p>
            </div>

            <label className="relative block w-full max-w-[256px]">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                <SearchIcon />
              </span>
              <input
                className="h-[34px] w-full rounded-[4px] border border-[#2b2f36] bg-[#2b2f36] pl-10 pr-4 text-[12px] text-[#d1d4dc] outline-none transition placeholder:text-[#848e9c] focus:border-[#3366ff]"
                onChange={(event) => setQuery(event.target.value)}
                placeholder={text.searchPlaceholder}
                value={query}
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <FilterIcon />
            {MARKET_FILTER_DATA.map((filter) => {
              const active = selectedFilter === filter.key;
              return (
                <button
                  key={filter.key}
                  className={cn(
                    "inline-flex h-7 items-center rounded-[4px] px-3 text-[12px] font-medium leading-4 transition",
                    active
                      ? "bg-[#3366ff] text-white"
                      : "bg-[#2b2f36] text-[#848e9c] hover:bg-[#343942] hover:text-[#d1d4dc]",
                  )}
                  onClick={() => setSelectedFilter(filter.key)}
                  type="button"
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <MarketPanel className="hidden overflow-hidden p-px lg:block">
        <div className="market-scroll overflow-x-auto">
          <div className="min-w-[1180px]">
            <div className="grid grid-cols-[92px_228px_86px_86px_86px_86px_86px_98px_228px_92px] border-b border-[#2b2f36] bg-[rgba(43,47,54,0.3)] px-4 py-3">
              {text.columns.map((column, index) => (
                <div
                  key={column}
                  className={cn(
                    "text-[10px] font-semibold uppercase leading-[15px] text-[#848e9c]",
                    index === 1 ? "text-left" : "text-right",
                    index === 0 ? "text-center" : "",
                    index === 8 ? "text-center" : "",
                  )}
                >
                  {column}
                </div>
              ))}
            </div>

            {visibleRows.length === 0 ? (
              <div className="flex min-h-[240px] flex-col items-center justify-center gap-2 px-6 py-10 text-center">
                <p className="text-[16px] font-semibold leading-6 text-[#d1d4dc]">{text.emptyTitle}</p>
                <p className="text-[12px] leading-5 text-[#848e9c]">{text.emptyBody}</p>
              </div>
            ) : (
              visibleRows.map((row) => {
                const tone = changeToneClasses(row.tone);
                const isFavorite = favoriteKeys.includes(row.key);

                return (
                  <div
                    key={row.key}
                    className="grid grid-cols-[92px_228px_86px_86px_86px_86px_86px_98px_228px_92px] items-center border-b border-[#2b2f36] px-4 py-3 last:border-b-0"
                  >
                    <div className="flex justify-center">
                      <button
                        aria-label={`${row.name} favorite`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] transition hover:bg-[rgba(43,47,54,0.42)]"
                        onClick={() =>
                          setFavoriteKeys((current) =>
                            current.includes(row.key) ? current.filter((key) => key !== row.key) : [...current, row.key],
                          )
                        }
                        type="button"
                      >
                        <StarIcon active={isFavorite} />
                      </button>
                    </div>

                    <div>
                      <Link className="text-[14px] font-semibold leading-5 text-[#d1d4dc] hover:text-[#ffffff]" href={row.href}>
                        {row.name}
                      </Link>
                      <p className="mt-0.5 text-[10px] leading-[15px] text-[#848e9c]">{row.category}</p>
                    </div>

                    <div className="flex justify-end">
                      <span className="inline-flex rounded-[4px] bg-[rgba(43,47,54,0.5)] px-2 py-0.5 text-[12px] font-semibold leading-4 text-[#d1d4dc]">
                        {row.rank}
                      </span>
                    </div>
                    <div className="text-right text-[14px] font-bold leading-5 text-[#d1d4dc]">{row.score}</div>
                    <div className="text-right text-[12px] leading-4 text-[#c84a31]">{row.high}</div>
                    <div className="text-right text-[12px] leading-4 text-[#1261c4]">{row.low}</div>
                    <div className={cn("text-right text-[12px] font-semibold leading-4", tone.text)}>{row.delta}</div>
                    <div className="flex justify-end">
                      <span className={cn("rounded-[4px] px-2 py-0.5 text-[12px] font-semibold leading-4", tone.pill)}>{row.changeRate}</span>
                    </div>

                    <div className="flex justify-center">
                      <div className="flex h-5 w-full overflow-hidden rounded-[999px] border border-[rgba(43,47,54,0.5)] bg-[#2b2f36]">
                        <div className="flex items-center justify-center bg-[#c84a31] text-[8px] font-semibold text-white" style={{ width: `${row.up}%` }}>
                          {row.up}%
                        </div>
                        <div className="flex items-center justify-center bg-[#848e9c] text-[8px] font-semibold text-white" style={{ width: `${row.flat}%` }}>
                          {row.flat}%
                        </div>
                        <div className="flex items-center justify-center bg-[#1261c4] text-[8px] font-semibold text-white" style={{ width: `${row.down}%` }}>
                          {row.down}%
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-[12px] leading-4 text-[#848e9c]">{row.participants}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </MarketPanel>

      <div className="grid gap-3 lg:hidden">
        {visibleRows.map((row) => {
          const tone = changeToneClasses(row.tone);
          const isFavorite = favoriteKeys.includes(row.key);

          return (
            <MarketPanel key={`mobile-${row.key}`} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Link className="text-[14px] font-semibold leading-5 text-[#d1d4dc] hover:text-[#ffffff]" href={row.href}>
                      {row.name}
                    </Link>
                    <span className="rounded-[4px] bg-[rgba(43,47,54,0.5)] px-2 py-0.5 text-[12px] font-semibold leading-4 text-[#d1d4dc]">
                      {row.rank}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[10px] leading-[15px] text-[#848e9c]">{row.category}</p>
                </div>
                <button
                  aria-label={`${row.name} favorite`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] transition hover:bg-[rgba(43,47,54,0.42)]"
                  onClick={() =>
                    setFavoriteKeys((current) =>
                      current.includes(row.key) ? current.filter((key) => key !== row.key) : [...current, row.key],
                    )
                  }
                  type="button"
                >
                  <StarIcon active={isFavorite} />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-[12px] leading-4">
                <div>
                  <p className="text-[10px] text-[#848e9c]">{text.columns[3]}</p>
                  <p className="mt-1 font-bold text-[#d1d4dc]">{row.score}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#848e9c]">{text.columns[7]}</p>
                  <p className={cn("mt-1 font-semibold", tone.text)}>{row.changeRate}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#848e9c]">{text.columns[4]}</p>
                  <p className="mt-1 text-[#c84a31]">{row.high}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#848e9c]">{text.columns[5]}</p>
                  <p className="mt-1 text-[#1261c4]">{row.low}</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-[10px] leading-[15px] text-[#848e9c]">
                  <span>{text.columns[8]}</span>
                  <span>{row.participants}</span>
                </div>
                <div className="mt-1.5 flex h-5 overflow-hidden rounded-[999px] border border-[rgba(43,47,54,0.5)] bg-[#2b2f36]">
                  <div className="flex items-center justify-center bg-[#c84a31] text-[8px] font-semibold text-white" style={{ width: `${row.up}%` }}>
                    {row.up}%
                  </div>
                  <div className="flex items-center justify-center bg-[#848e9c] text-[8px] font-semibold text-white" style={{ width: `${row.flat}%` }}>
                    {row.flat}%
                  </div>
                  <div className="flex items-center justify-center bg-[#1261c4] text-[8px] font-semibold text-white" style={{ width: `${row.down}%` }}>
                    {row.down}%
                  </div>
                </div>
              </div>
            </MarketPanel>
          );
        })}
      </div>

      <MarketPanel className="grid gap-3 p-4 md:grid-cols-3">
        <div className="text-center">
          <p className="text-[10px] leading-[15px] text-[#848e9c]">{text.totalLabel}</p>
          <p className="mt-1 text-[24px] font-semibold leading-7 text-[#d1d4dc]">{visibleRows.length}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] leading-[15px] text-[#848e9c]">{text.risingLabel}</p>
          <p className="mt-1 text-[24px] font-semibold leading-7 text-[#c84a31]">{risingCount}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] leading-[15px] text-[#848e9c]">{text.fallingLabel}</p>
          <p className="mt-1 text-[24px] font-semibold leading-7 text-[#1261c4]">{fallingCount}</p>
        </div>
      </MarketPanel>

      <MarketPanel className="border-[rgba(51,102,255,0.2)] bg-[rgba(51,102,255,0.1)] px-[13px] pb-px pt-[13px]">
        <p className="text-[10px] leading-[16.25px] text-[#d1d4dc]">
          <span className="font-bold">{`💡 ${text.guideLabel} `}</span>
          <span className="text-[#848e9c]">{text.guideBody}</span>
        </p>
      </MarketPanel>

      <MarketPanel className="p-4">
        <h2 className="text-[16px] font-semibold leading-6 text-[#d1d4dc]">{text.trendTitle}</h2>
        <p className="mt-1 text-[10px] leading-[15px] text-[#848e9c]">{text.trendSubtitle}</p>

        <div className="market-scroll mt-4 overflow-x-auto">
          <div className="min-w-[1080px]">
            <div className="grid grid-cols-[60px_minmax(0,1fr)] gap-3">
              <div className="relative h-[240px] text-right text-[10px] text-[#848e9c]">
                {TREND_AXIS.map((label, index) => (
                  <span
                    key={label}
                    className="absolute right-0 -translate-y-1/2"
                    style={{ top: `${(index / (TREND_AXIS.length - 1)) * 100}%` }}
                  >
                    {label}
                  </span>
                ))}
              </div>

              <div className="relative h-[240px]">
                {[0, 1, 2, 3].map((line) => (
                  <div
                    key={`trend-line-${line}`}
                    className="absolute inset-x-0 border-t border-[rgba(43,47,54,0.36)]"
                    style={{ top: `${(line / 3) * 100}%` }}
                  />
                ))}

                <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 1452 210">
                  <path d={trendPath} fill="none" stroke="#3366ff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                </svg>

                <div className="absolute inset-x-0 bottom-0 flex text-[10px] text-[#848e9c]">
                  {TREND_DATES.map((label) => (
                    <span key={label} className="flex-1 text-center">
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {text.metrics.map((label, index) => {
            const value = TREND_METRICS[index];
            const color =
              index === 1 ? "text-[#c84a31]" : index === 2 ? "text-[#1261c4]" : "text-[#d1d4dc]";

            return (
              <div key={label} className="rounded-[4px] bg-[rgba(43,47,54,0.2)] px-2 py-2">
                <p className="text-[9px] leading-[13.5px] text-[#848e9c]">{label}</p>
                <p className={cn("mt-0.5 text-[12px] font-semibold leading-4", color)}>{value}</p>
              </div>
            );
          })}
        </div>
      </MarketPanel>
    </div>
  );
}
