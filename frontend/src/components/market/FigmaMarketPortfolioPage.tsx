"use client";

import { useId, useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { MarketPanel } from "@/components/market/MarketUi";
import { cn } from "@/lib/utils";

type MarketLocale = "ko" | "en";
type MetricKey = "return" | "points";
type TimeframeKey = "1h" | "4h" | "1d" | "1w" | "1m";
type PositionTone = "up" | "flat" | "down";

interface Localized {
  ko: string;
  en: string;
}

interface SummaryCard {
  label: Localized;
  value: string;
  tone: "blue" | "red" | "green" | "gray";
}

interface AllocationItem {
  name: string;
  points: number;
  ratio: string;
  color: string;
}

interface HoldingCard {
  slug: string;
  name: string;
  position: PositionTone;
  category: string;
  current: string;
  entry: string;
  delta: string;
  change: string;
  changeTone: PositionTone;
  hold: Localized;
  confidence: string;
}

const COPY = {
  ko: {
    title: "내 포트폴리오",
    description: "보유 중인 예측 포지션과 수익률을 확인하세요",
    activePositions: "활성 포지션",
    profitable: "수익 중",
    losing: "손실 중",
    performance: "포트폴리오 성과",
    allocation: "자산 배분",
    allocationDescription: "프로젝트별 보유된 포인트 분포",
    holdings: "보유 포지션",
    positionSplit: "포지션 분포",
    currentScore: "현재 점수",
    entryScore: "진입 점수",
    scoreChange: "점수 변화",
    confidence: "신뢰도",
    riseForecast: "상승 예측",
    flatForecast: "보합 예측",
    fallForecast: "하락 예측",
    export: "내보내기",
    all: "전체",
    rise: "상승",
    flat: "보합",
    fall: "하락",
    metricTabs: { return: "수익률", points: "포인트" },
    timeframes: { "1h": "1시간", "4h": "4시간", "1d": "1일", "1w": "1주", "1m": "1개월" },
    chartLabels: ["시작", "최고", "최저", "현재"],
  },
  en: {
    title: "My Portfolio",
    description: "Review your active prediction positions and portfolio return",
    activePositions: "Active positions",
    profitable: "In profit",
    losing: "In loss",
    performance: "Portfolio performance",
    allocation: "Asset allocation",
    allocationDescription: "Point distribution by project",
    holdings: "Open positions",
    positionSplit: "Position split",
    currentScore: "Current score",
    entryScore: "Entry score",
    scoreChange: "Score change",
    confidence: "Confidence",
    riseForecast: "Up forecast",
    flatForecast: "Flat forecast",
    fallForecast: "Down forecast",
    export: "Export",
    all: "All",
    rise: "Up",
    flat: "Flat",
    fall: "Down",
    metricTabs: { return: "Return", points: "Points" },
    timeframes: { "1h": "1h", "4h": "4h", "1d": "1d", "1w": "1w", "1m": "1m" },
    chartLabels: ["Start", "High", "Low", "Current"],
  },
} as const;

const SUMMARY_CARDS: SummaryCard[] = [
  { label: { ko: "총 포인트", en: "Total points" }, value: "1,250", tone: "blue" },
  { label: { ko: "예상 수익률", en: "Expected return" }, value: "+15.30%", tone: "red" },
  { label: { ko: "승률", en: "Win rate" }, value: "62.5%", tone: "green" },
  { label: { ko: "평균 보유", en: "Avg. hold" }, value: "14일", tone: "gray" },
];

const ALLOCATION_ITEMS: AllocationItem[] = [
  { name: "Kubernetes", points: 180, ratio: "14.4%", color: "#8d96a5" },
  { name: "React", points: 220, ratio: "17.6%", color: "#65d4ff" },
  { name: "TensorFlow", points: 150, ratio: "12.0%", color: "#848e9c" },
  { name: "Vue.js", points: 190, ratio: "15.2%", color: "#45bf7a" },
  { name: "Prometheus", points: 130, ratio: "10.4%", color: "#8d96a5" },
  { name: "Redis", points: 140, ratio: "11.2%", color: "#8d96a5" },
  { name: "Docker", points: 160, ratio: "12.8%", color: "#8d96a5" },
  { name: "Node.js", points: 80, ratio: "6.4%", color: "#8d96a5" },
];

const HOLDINGS: HoldingCard[] = [
  { slug: "kubernetes", name: "Kubernetes", position: "up", category: "Cloud Native", current: "92.3", entry: "94.8", delta: "▲ 2.5", change: "+2.71%", changeTone: "up", hold: { ko: "14일 보유", en: "14 days held" }, confidence: "85%" },
  { slug: "react", name: "React", position: "up", category: "Frontend Framework", current: "89.1", entry: "91.2", delta: "▲ 2.1", change: "+2.38%", changeTone: "up", hold: { ko: "12일 보유", en: "12 days held" }, confidence: "78%" },
  { slug: "tensorflow", name: "TensorFlow", position: "down", category: "Machine Learning", current: "87.5", entry: "85.2", delta: "▼ 2.3", change: "-2.63%", changeTone: "down", hold: { ko: "10일 보유", en: "10 days held" }, confidence: "72%" },
  { slug: "vue", name: "Vue.js", position: "flat", category: "Frontend Framework", current: "84.2", entry: "84.8", delta: "~ 0.6", change: "-0.71%", changeTone: "flat", hold: { ko: "8일 보유", en: "8 days held" }, confidence: "65%" },
  { slug: "prometheus", name: "Prometheus", position: "up", category: "Monitoring", current: "85.7", entry: "88.4", delta: "▲ 2.7", change: "+3.15%", changeTone: "up", hold: { ko: "7일 보유", en: "7 days held" }, confidence: "80%" },
  { slug: "redis", name: "Redis", position: "up", category: "Database", current: "82.3", entry: "79.1", delta: "▲ 3.2", change: "+3.89%", changeTone: "up", hold: { ko: "6일 보유", en: "6 days held" }, confidence: "70%" },
  { slug: "docker", name: "Docker", position: "up", category: "Containerization", current: "88.5", entry: "87.2", delta: "▼ 1.3", change: "-1.47%", changeTone: "down", hold: { ko: "4일 보유", en: "4 days held" }, confidence: "75%" },
  { slug: "nodejs", name: "Node.js", position: "flat", category: "Runtime", current: "86.4", entry: "86.1", delta: "~ 0.3", change: "-0.35%", changeTone: "flat", hold: { ko: "2일 보유", en: "2 days held" }, confidence: "68%" },
];

const SERIES = {
  return: {
    "1h": [14.8, 14.9, 15.0, 15.05, 15.1, 15.2, 15.22],
    "4h": [12.2, 12.8, 13.5, 14.0, 14.5, 15.0, 15.3],
    "1d": [-2.1, 1.7, 5.2, 8.8, 10.7, 12.0, 13.7, 14.2, 14.9, 15.15, 15.3],
    "1w": [1.2, 3.4, 6.5, 8.1, 10.3, 12.6, 15.3],
    "1m": [-4.4, -1.2, 2.1, 5.8, 8.7, 11.2, 13.1, 15.3],
  },
  points: {
    "1h": [1222, 1225, 1228, 1232, 1239, 1245, 1250],
    "4h": [1160, 1178, 1191, 1207, 1224, 1241, 1250],
    "1d": [1050, 1089, 1125, 1164, 1187, 1202, 1218, 1231, 1240, 1246, 1250],
    "1w": [980, 1012, 1060, 1104, 1148, 1197, 1250],
    "1m": [860, 914, 986, 1055, 1120, 1183, 1229, 1250],
  },
} as const;

const DATE_LABELS: Record<TimeframeKey, string[]> = {
  "1h": ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"],
  "4h": ["03/20", "03/21", "03/22", "03/23", "03/24", "03/25", "03/26"],
  "1d": ["3/1", "3/3", "3/5", "3/7", "3/9", "3/11", "3/13", "3/15", "3/17", "3/19", "3/21"],
  "1w": ["1주", "2주", "3주", "4주", "5주", "6주", "7주"],
  "1m": ["10월", "11월", "12월", "1월", "2월", "3월", "4월", "5월"],
};

function SummaryIcon({ tone }: { tone: SummaryCard["tone"] }) {
  const color =
    tone === "blue" ? "#3366ff" : tone === "red" ? "#c84a31" : tone === "green" ? "#22ab94" : "#848e9c";
  const background =
    tone === "blue"
      ? "rgba(51,102,255,0.1)"
      : tone === "red"
        ? "rgba(200,74,49,0.1)"
        : tone === "green"
          ? "rgba(34,171,148,0.1)"
          : "rgba(132,142,156,0.1)";

  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-[4px]" style={{ background }}>
      <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
        {tone === "blue" ? (
          <>
            <circle cx="8" cy="8" r="5.25" stroke={color} strokeWidth="1.3" />
            <path d="M8 5V8.5L10 9.7" stroke={color} strokeLinecap="round" strokeWidth="1.3" />
          </>
        ) : tone === "red" ? (
          <path d="M3 10.5L6.1 7.3L8.1 8.9L13 4.2" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
        ) : tone === "green" ? (
          <>
            <rect height="9.5" rx="1.5" stroke={color} strokeWidth="1.3" width="7" x="4.5" y="3.25" />
            <path d="M6.4 6.25H9.6" stroke={color} strokeLinecap="round" strokeWidth="1.3" />
            <path d="M8 4.65V7.85" stroke={color} strokeLinecap="round" strokeWidth="1.3" />
          </>
        ) : (
          <>
            <circle cx="8" cy="8" r="5.25" stroke={color} strokeWidth="1.3" />
            <path d="M8 5.2V8.1" stroke={color} strokeLinecap="round" strokeWidth="1.3" />
            <circle cx="8" cy="10.8" fill={color} r="0.85" />
          </>
        )}
      </svg>
    </span>
  );
}

function createPolyline(values: readonly number[], width: number, height: number, paddingX: number, paddingY: number) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = paddingX + (index / Math.max(values.length - 1, 1)) * (width - paddingX * 2);
      const y = height - paddingY - ((value - min) / range) * (height - paddingY * 2);
      return `${x},${y}`;
    })
    .join(" ");
}

function createArea(values: readonly number[], width: number, height: number, paddingX: number, paddingY: number) {
  const points = createPolyline(values, width, height, paddingX, paddingY)
    .split(" ")
    .map((point) => {
      const [x, y] = point.split(",");
      return `L ${x} ${y}`;
    })
    .join(" ");
  const baseline = height - paddingY;
  return `M ${paddingX} ${baseline} ${points} L ${width - paddingX} ${baseline} Z`;
}

export function FigmaMarketPortfolioPage() {
  const locale = (useLocale() === "ko" ? "ko" : "en") as MarketLocale;
  const text = COPY[locale];
  const [metric, setMetric] = useState<MetricKey>("return");
  const [timeframe, setTimeframe] = useState<TimeframeKey>("1d");
  const [positionFilter, setPositionFilter] = useState<"all" | PositionTone>("all");
  const chartGradientId = useId();

  const series = SERIES[metric][timeframe];
  const labels = DATE_LABELS[timeframe];
  const holdings = positionFilter === "all" ? HOLDINGS : HOLDINGS.filter((item) => item.position === positionFilter);
  const riseCount = HOLDINGS.filter((item) => item.position === "up").length;
  const flatCount = HOLDINGS.filter((item) => item.position === "flat").length;
  const fallCount = HOLDINGS.filter((item) => item.position === "down").length;
  const totalPoints = ALLOCATION_ITEMS.reduce((sum, item) => sum + item.points, 0);
  const donutStops = ALLOCATION_ITEMS.map((item, index) => {
    const previous = ALLOCATION_ITEMS.slice(0, index).reduce((sum, entry) => sum + entry.points, 0);
    const current = previous + item.points;
    return `${item.color} ${(previous / totalPoints) * 100}% ${(current / totalPoints) * 100}%`;
  }).join(", ");

  const chartStats =
    metric === "return"
      ? ["-2.10%", "15.30%", "-2.10%", "15.30%"]
      : ["1,050", "1,250", "1,050", "1,250"];

  const exportHoldings = () => {
    const header = ["name", "category", "position", "current", "entry", "delta", "change", "confidence"];
    const rows = holdings.map((item) =>
      [item.name, item.category, item.position, item.current, item.entry, item.delta, item.change, item.confidence].join(","),
    );
    const blob = new Blob([[header.join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "portfolio-holdings.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 font-figma-body">
      <section className="relative left-1/2 -mx-4 -mt-5 w-screen -translate-x-1/2 border-b border-[#2b2f36] bg-[rgba(30,32,38,0.3)] sm:-mx-6 xl:mx-0">
        <div className="mx-auto w-full max-w-[1232px] px-4 py-5 sm:px-6 xl:px-0">
          <h1 className="text-[24px] font-bold leading-8 text-[#d1d4dc]">{text.title}</h1>
          <p className="mt-1 text-[12px] leading-4 text-[#848e9c]">{text.description}</p>

          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {SUMMARY_CARDS.map((card) => (
              <MarketPanel key={card.label.ko} className="px-[13px] py-[13px]">
                <div className="flex items-center gap-[10px]">
                  <SummaryIcon tone={card.tone} />
                  <div>
                    <p className="text-[9px] leading-[13.5px] text-[#848e9c]">{card.label[locale]}</p>
                    <p className={cn("mt-0.5 text-[16px] font-bold leading-6 text-[#d1d4dc]", card.tone === "red" && "text-[#c84a31]")}>
                      {locale === "en" && card.label.en === "Avg. hold" ? "14d" : card.value}
                    </p>
                  </div>
                </div>
              </MarketPanel>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-[12px] leading-4">
            <span className="text-[#848e9c]">{text.activePositions} <span className="font-semibold text-[#d1d4dc]">8</span></span>
            <span className="h-3 w-px bg-[#2b2f36]" />
            <span className="text-[#848e9c]">{text.profitable} <span className="font-semibold text-[#c84a31]">5</span></span>
            <span className="h-3 w-px bg-[#2b2f36]" />
            <span className="text-[#848e9c]">{text.losing} <span className="font-semibold text-[#1261c4]">3</span></span>
          </div>
        </div>
      </section>

      <MarketPanel className="px-[17px] pb-[17px] pt-[17px]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-[16px] font-semibold leading-6 text-[#d1d4dc]">{text.performance}</h2>
            <div className="mt-2 flex items-end gap-2">
              <p className="text-[32px] font-bold leading-8 text-[#c84a31]">+15.30%</p>
              <p className="pb-1 text-[14px] font-semibold leading-5 text-[#c84a31]">↗ +17.40%</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex rounded-[4px] border border-[#2b2f36] bg-[#0d1117] p-[3px]">
              {(["return", "points"] as const).map((tab) => (
                <button
                  key={tab}
                  className={cn("h-[23px] min-w-[50px] rounded-[4px] px-3 text-[10px] font-medium leading-[15px]", metric === tab ? "bg-[#1f6feb] text-white" : "text-[#848e9c]")}
                  onClick={() => setMetric(tab)}
                  type="button"
                >
                  {text.metricTabs[tab]}
                </button>
              ))}
            </div>

            <div className="flex rounded-[4px] border border-[#2b2f36] bg-[#0d1117] p-[3px]">
              {(["1h", "4h", "1d", "1w", "1m"] as const).map((tab) => (
                <button
                  key={tab}
                  className={cn("h-[23px] min-w-[48px] rounded-[4px] px-2 text-[10px] font-medium leading-[15px]", timeframe === tab ? "bg-[#1f6feb] text-white" : "text-[#848e9c]")}
                  onClick={() => setTimeframe(tab)}
                  type="button"
                >
                  {text.timeframes[tab]}
                </button>
              ))}
            </div>

            <button aria-label={text.export} className="inline-flex h-[29px] w-[29px] items-center justify-center rounded-[4px] border border-[#2b2f36] bg-[#0d1117] text-[#848e9c] transition hover:text-[#d1d4dc]" onClick={exportHoldings} type="button">
              <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 14 14">
                <path d="M4.25 9.75L9.75 4.25" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
                <path d="M5.25 4.25H9.75V8.75" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-3 overflow-hidden rounded-[4px] bg-[linear-gradient(180deg,rgba(200,74,49,0.08)_0%,rgba(200,74,49,0)_100%)]">
          <svg aria-hidden="true" className="h-[220px] w-full" preserveAspectRatio="none" viewBox="0 0 880 220">
            <defs>
              <linearGradient id={chartGradientId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgba(200,74,49,0.28)" />
                <stop offset="100%" stopColor="rgba(200,74,49,0)" />
              </linearGradient>
            </defs>

            {[0, 1, 2, 3].map((line) => {
              const y = 24 + line * 46;
              return <line key={line} stroke="rgba(43,47,54,0.6)" strokeDasharray={line === 2 ? "4 4" : undefined} x1="32" x2="848" y1={y} y2={y} />;
            })}

            <path d={createArea(series, 880, 220, 32, 24)} fill={`url(#${chartGradientId})`} opacity="0.75" />
            <polyline fill="none" points={createPolyline(series, 880, 220, 32, 24)} stroke="#c84a31" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />

            {labels.map((label, index) => {
              const x = 32 + (index / Math.max(labels.length - 1, 1)) * (880 - 64);
              return <text key={label} fill="#848e9c" fontSize="9" textAnchor="middle" x={x} y="206">{label}</text>;
            })}

            {metric === "return" ? (
              <>
                <text fill="#848e9c" fontSize="9" x="6" y="28">18%</text>
                <text fill="#848e9c" fontSize="9" x="8" y="74">12%</text>
                <text fill="#848e9c" fontSize="9" x="12" y="120">6%</text>
                <text fill="#848e9c" fontSize="9" x="16" y="166">0%</text>
                <text fill="#848e9c" fontSize="9" x="10" y="212">-6%</text>
              </>
            ) : (
              <>
                <text fill="#848e9c" fontSize="9" x="6" y="28">1,300</text>
                <text fill="#848e9c" fontSize="9" x="10" y="74">1,230</text>
                <text fill="#848e9c" fontSize="9" x="10" y="120">1,160</text>
                <text fill="#848e9c" fontSize="9" x="10" y="166">1,090</text>
                <text fill="#848e9c" fontSize="9" x="10" y="212">1,020</text>
              </>
            )}
          </svg>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {text.chartLabels.map((label, index) => (
            <div key={label} className="rounded-[4px] bg-[#11151b] px-4 py-3">
              <p className="text-[9px] leading-[13.5px] text-[#848e9c]">{label}</p>
              <p className={cn("mt-1 text-[12px] font-semibold leading-4", index === 1 || index === 3 ? "text-[#c84a31]" : index === 2 ? "text-[#1261c4]" : "text-[#d1d4dc]")}>
                {chartStats[index]}
              </p>
            </div>
          ))}
        </div>
      </MarketPanel>

      <MarketPanel className="px-[17px] pb-[17px] pt-[17px]">
        <h2 className="text-[14px] font-semibold leading-5 text-[#d1d4dc]">{text.allocation}</h2>
        <p className="mt-1 text-[10px] leading-[15px] text-[#848e9c]">{text.allocationDescription}</p>

        <div className="mt-5 grid gap-8 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="flex items-center justify-center">
            <div className="relative h-[126px] w-[126px] rounded-full" style={{ background: `conic-gradient(${donutStops})` }}>
              <div className="absolute inset-[18px] rounded-full bg-[#1e2026]" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {ALLOCATION_ITEMS.map((item) => (
              <div key={item.name} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[11px] leading-[18px] text-[#d1d4dc]">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-[11px] leading-[18px] text-[#d1d4dc]">{item.points}</p>
                  <p className="text-[9px] leading-[13.5px] text-[#848e9c]">{item.ratio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </MarketPanel>

      <section className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-[14px] font-semibold leading-5 text-[#d1d4dc]">{text.holdings}</h2>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: "all", label: `${text.all} 8개` },
              { key: "up", label: `${text.rise} 5개` },
              { key: "flat", label: `${text.flat} 2개` },
              { key: "down", label: `${text.fall} 1개` },
            ].map((item) => (
              <button key={item.key} className={cn("rounded-[4px] px-2.5 py-1 text-[10px] leading-[15px]", positionFilter === item.key ? "bg-[#1f6feb] text-white" : "bg-[#11151b] text-[#848e9c]")} onClick={() => setPositionFilter(item.key as "all" | PositionTone)} type="button">
                {item.label}
              </button>
            ))}
            <button className="rounded-[4px] border border-[#2b2f36] bg-[#11151b] px-2.5 py-1 text-[10px] leading-[15px] text-[#848e9c]" onClick={exportHoldings} type="button">
              {text.export}
            </button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {holdings.map((holding) => (
            <Link key={holding.slug} className="block" href={`/market/trading/${holding.slug}`}>
              <MarketPanel className="h-full px-3 py-3 transition hover:border-[#3a4252]">
                <div className="flex items-center gap-2">
                  <h3 className="text-[13px] font-semibold leading-4 text-[#d1d4dc]">{holding.name}</h3>
                  <span className={cn("inline-flex rounded-[4px] px-1.5 py-0.5 text-[8px] leading-3", holding.position === "up" && "bg-[rgba(200,74,49,0.12)] text-[#c84a31]", holding.position === "flat" && "bg-[rgba(132,142,156,0.12)] text-[#848e9c]", holding.position === "down" && "bg-[rgba(18,97,196,0.12)] text-[#1261c4]")}>
                    {holding.position === "up" ? text.rise : holding.position === "flat" ? text.flat : text.fall}
                  </span>
                </div>
                <p className="mt-1 text-[9px] leading-[13.5px] text-[#848e9c]">{holding.category}</p>

                <div className="mt-3 grid grid-cols-2 gap-y-3 border-t border-[#2b2f36] pt-3">
                  <div>
                    <p className="text-[9px] leading-[13.5px] text-[#848e9c]">{text.currentScore}</p>
                    <p className="mt-1 text-[14px] font-semibold leading-5 text-[#d1d4dc]">{holding.current}</p>
                  </div>
                  <div>
                    <p className="text-[9px] leading-[13.5px] text-[#848e9c]">{text.entryScore}</p>
                    <p className="mt-1 text-[14px] font-semibold leading-5 text-[#d1d4dc]">{holding.entry}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <p className="text-[10px] leading-[15px] text-[#848e9c]">{text.scoreChange}</p>
                  <div className={cn("flex items-center gap-1 text-[10px] font-semibold leading-[13.5px]", holding.changeTone === "up" && "text-[#c84a31]", holding.changeTone === "flat" && "text-[#848e9c]", holding.changeTone === "down" && "text-[#1261c4]")}>
                    <span>{holding.delta}</span>
                    <span>{holding.change}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-[10px] leading-[15px] text-[#848e9c]">
                  <span>{holding.hold[locale]}</span>
                  <span>{text.confidence} {holding.confidence}</span>
                </div>
              </MarketPanel>
            </Link>
          ))}
        </div>
      </section>

      <MarketPanel className="px-[17px] pb-[17px] pt-[17px]">
        <h2 className="text-[14px] font-semibold leading-5 text-[#d1d4dc]">{text.positionSplit}</h2>
        <div className="mt-3 grid gap-3 xl:grid-cols-3">
          {[
            { label: text.riseForecast, value: `${riseCount}개`, tone: "up", width: "68%" },
            { label: text.flatForecast, value: `${flatCount}개`, tone: "flat", width: "38%" },
            { label: text.fallForecast, value: `${fallCount}개`, tone: "down", width: "24%" },
          ].map((item) => (
            <div key={item.label} className={cn("rounded-[4px] border px-[13px] pb-[13px] pt-[13px]", item.tone === "up" && "border-[rgba(200,74,49,0.2)] bg-[rgba(200,74,49,0.05)]", item.tone === "flat" && "border-[rgba(132,142,156,0.2)] bg-[rgba(132,142,156,0.05)]", item.tone === "down" && "border-[rgba(18,97,196,0.2)] bg-[rgba(18,97,196,0.05)]")}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] leading-[15px] text-[#848e9c]">{item.label}</p>
                <p className={cn("text-[12px] font-semibold leading-4", item.tone === "up" && "text-[#c84a31]", item.tone === "flat" && "text-[#848e9c]", item.tone === "down" && "text-[#1261c4]")}>
                  {item.value}
                </p>
              </div>
              <div className="mt-3 h-1 rounded-full bg-[rgba(43,47,54,0.2)]">
                <div className={cn("h-1 rounded-full", item.tone === "up" && "bg-[#c84a31]", item.tone === "flat" && "bg-[#848e9c]", item.tone === "down" && "bg-[#1261c4]")} style={{ width: item.width }} />
              </div>
            </div>
          ))}
        </div>
      </MarketPanel>
    </div>
  );
}
