"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Link } from "@/i18n/routing";
import {
  MARKET_FACTOR_SNAPSHOTS,
  MARKET_MARKET_STATES,
  MARKET_PROJECTS,
  MARKET_RAW_METRICS_SNAPSHOTS,
} from "@/lib/market-pricing";
import { MARKET_INSTRUMENTS } from "@/lib/market-catalog";
import { cn } from "@/lib/utils";

type Direction = "up" | "neutral" | "down";
type TimeframeKey = "1D" | "1W" | "1M";
type TradeSide = "buy" | "sell";
type OrderType = "market" | "limit";

type ChartPoint = {
  label: string;
  date: string;
  close: number;
  ma5: number;
  ma20: number;
  volume: number;
};

const PROJECT_MAP = Object.fromEntries(MARKET_PROJECTS.map((project) => [project.slug, project]));
const STATE_MAP = Object.fromEntries(MARKET_MARKET_STATES.map((state) => [state.instrumentId, state]));
const FACTOR_MAP = Object.fromEntries(MARKET_FACTOR_SNAPSHOTS.map((factor) => [factor.instrumentId, factor]));
const RAW_MAP = Object.fromEntries(MARKET_RAW_METRICS_SNAPSHOTS.map((snapshot) => [snapshot.instrumentId, snapshot]));
const INSTRUMENT_MAP = Object.fromEntries(MARKET_INSTRUMENTS.map((instrument) => [instrument.slug, instrument]));

const TIMEFRAMES: { key: TimeframeKey; label: string; points: number }[] = [
  { key: "1D", label: "1일", points: 16 },
  { key: "1W", label: "1주", points: 20 },
  { key: "1M", label: "1개월", points: 24 },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatPrice(value: number) {
  return value.toLocaleString("ko-KR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatInteger(value: number) {
  return value.toLocaleString("ko-KR");
}

function changeTone(value: number): Exclude<Direction, "neutral"> {
  return value >= 0 ? "up" : "down";
}

function toneClasses(tone: Direction) {
  if (tone === "up") return "text-[#d6583a]";
  if (tone === "down") return "text-[#2f7de1]";
  return "text-[#9aa4b2]";
}

function formatChange(value: number) {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function movingAverage(values: number[], length: number, index: number) {
  const start = Math.max(0, index - length + 1);
  const slice = values.slice(start, index + 1);
  return slice.reduce((sum, current) => sum + current, 0) / slice.length;
}

function buildChart(projectSlug: string, timeframe: TimeframeKey): ChartPoint[] {
  const project = PROJECT_MAP[projectSlug] ?? MARKET_PROJECTS[0];
  const state = STATE_MAP[project.slug] ?? MARKET_MARKET_STATES[0];
  const config = TIMEFRAMES.find((item) => item.key === timeframe) ?? TIMEFRAMES[0];
  const baseSeries = project.spark;
  const points = Array.from({ length: config.points }, (_, index) => {
    const sparkIndex = index % baseSeries.length;
    const normalized = baseSeries[sparkIndex] / 100;
    const wave = Math.sin((index / config.points) * Math.PI * 2) * 0.018;
    const drift = ((index - config.points / 2) / config.points) * (project.changeRate / 100);
    const close = Number((state.lastPrice * (0.9 + normalized * 0.18 + wave + drift)).toFixed(2));
    const volumeBase = state.volume24h / config.points;
    const volume = Math.round(volumeBase * (0.75 + normalized * 0.5 + (index % 4) * 0.08));
    return {
      label: `${index + 1}`,
      date: `2026-03-${String(index + 1).padStart(2, "0")}T09:00:00`,
      close,
      ma5: 0,
      ma20: 0,
      volume,
    };
  });

  const closes = points.map((point) => point.close);
  return points.map((point, index) => ({
    ...point,
    ma5: Number(movingAverage(closes, 5, index).toFixed(2)),
    ma20: Number(movingAverage(closes, Math.min(20, closes.length), index).toFixed(2)),
  }));
}

function buildOrderBook(lastPrice: number, depth: number) {
  const unit = depth >= 100000 ? 120 : depth >= 42000 ? 75 : 45;
  const asks = Array.from({ length: 6 }, (_, index) => {
    const quantity = unit + index * Math.round(unit * 0.35);
    return {
      side: "sell" as const,
      price: Number((lastPrice + 0.12 + index * 0.09).toFixed(2)),
      quantity,
    };
  });

  const bids = Array.from({ length: 6 }, (_, index) => {
    const quantity = unit + (5 - index) * Math.round(unit * 0.3);
    return {
      side: "buy" as const,
      price: Number((lastPrice - 0.11 - index * 0.08).toFixed(2)),
      quantity,
    };
  });

  return { asks, bids };
}

function buildTradeTape(lastPrice: number) {
  return Array.from({ length: 6 }, (_, index) => {
    const side: TradeSide = index % 2 === 0 ? "buy" : "sell";
    const quantity = 28 + index * 12;
    const price = Number((lastPrice + (side === "buy" ? 0.06 : -0.05) - index * 0.01).toFixed(2));
    return {
      id: `${side}-${index}`,
      side,
      quantity,
      price,
      time: `14:${String(28 - index).padStart(2, "0")}:1${index}`,
      venue: index % 2 === 0 ? "OSS-X" : "CNCF-X",
    };
  });
}

function buildAnalysis(slug: string) {
  const factor = FACTOR_MAP[slug] ?? MARKET_FACTOR_SNAPSHOTS[0];
  const raw = RAW_MAP[slug] ?? MARKET_RAW_METRICS_SNAPSHOTS[0];
  return [
    {
      title: "실행력",
      tone: "blue" as const,
      body: `최근 90일 기준 활동일 ${raw.githubCommitDays90d}일, 기여자 ${raw.githubContributors90d}명으로 실행력이 안정적입니다.`,
    },
    {
      title: "신뢰도",
      tone: "teal" as const,
      body: `보안 점수 ${raw.securityScore}점, 신뢰 지표 ${factor.trust.toFixed(1)}점으로 거버넌스와 유지보수 측면이 견고합니다.`,
    },
    {
      title: "도입도",
      tone: "amber" as const,
      body: `의존 패키지 ${formatInteger(raw.depsDependentPackages)}개, 생태계 ${raw.packageEcosystems.join(", ")} 기준으로 도입 저변이 확인됩니다.`,
    },
  ];
}

function priceTooltip({
  active,
  payload,
  label,
}: any) {
  if (!active || !payload?.length || !label) return null;
  return (
    <div className="rounded-[6px] border border-[#2b2f36] bg-[#0d1117] px-[10px] py-[8px] text-[11px] text-[#d1d4dc] shadow-[0_12px_32px_rgba(0,0,0,0.35)]">
      <p className="mb-1 text-[#9aa4b2]">{new Date(label).toLocaleString("ko-KR")}</p>
      {payload.map((entry: { value?: number; name?: string }) => (
        <div key={entry.name} className="flex items-center justify-between gap-4">
          <span>{entry.name}</span>
          <span>{formatPrice(entry.value ?? 0)}</span>
        </div>
      ))}
    </div>
  );
}

function volumeTooltip({
  active,
  payload,
  label,
}: any) {
  if (!active || !payload?.length || !label) return null;
  return (
    <div className="rounded-[6px] border border-[#2b2f36] bg-[#0d1117] px-[10px] py-[8px] text-[11px] text-[#d1d4dc] shadow-[0_12px_32px_rgba(0,0,0,0.35)]">
      <p className="mb-1 text-[#9aa4b2]">{new Date(label).toLocaleString("ko-KR")}</p>
      <div className="flex items-center justify-between gap-4">
        <span>거래량</span>
        <span>{formatInteger(payload[0]?.value ?? 0)}</span>
      </div>
    </div>
  );
}

function SectionIcon({ tone }: { tone: "blue" | "teal" | "amber" }) {
  const styles =
    tone === "blue"
      ? "border-[#3366ff] bg-[rgba(51,102,255,0.12)] text-[#3366ff]"
      : tone === "teal"
        ? "border-[#14b8a6] bg-[rgba(20,184,166,0.12)] text-[#14b8a6]"
        : "border-[#d3a31a] bg-[rgba(211,163,26,0.12)] text-[#d3a31a]";

  return (
    <span className={cn("inline-flex h-8 w-8 items-center justify-center rounded-full border text-[12px] font-semibold", styles)}>
      i
    </span>
  );
}

export function FigmaMarketTradingDetailPage({ slug }: { slug: string }) {
  const project = PROJECT_MAP[slug] ?? MARKET_PROJECTS[0];
  const state = STATE_MAP[project.slug] ?? MARKET_MARKET_STATES[0];
  const factor = FACTOR_MAP[project.slug] ?? MARKET_FACTOR_SNAPSHOTS[0];
  const raw = RAW_MAP[project.slug] ?? MARKET_RAW_METRICS_SNAPSHOTS[0];
  const instrument = INSTRUMENT_MAP[project.slug] ?? MARKET_INSTRUMENTS[0];

  const [timeframe, setTimeframe] = useState<TimeframeKey>("1M");
  const [orderSide, setOrderSide] = useState<TradeSide>("buy");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [quantity, setQuantity] = useState(25);
  const [limitPrice, setLimitPrice] = useState(Number(state.lastPrice.toFixed(2)));
  const [memo, setMemo] = useState("");
  const [openOrders, setOpenOrders] = useState([
    {
      id: "buy-1",
      side: "buy" as const,
      type: "limit" as const,
      price: Number((state.lastPrice - 0.42).toFixed(2)),
      quantity: 36,
      submittedAt: "14:12:08",
      status: "대기",
    },
    {
      id: "sell-1",
      side: "sell" as const,
      type: "limit" as const,
      price: Number((state.lastPrice + 0.51).toFixed(2)),
      quantity: 18,
      submittedAt: "14:09:43",
      status: "부분 체결",
    },
  ]);

  const chartData = useMemo(() => buildChart(project.slug, timeframe), [project.slug, timeframe]);
  const orderBook = useMemo(() => buildOrderBook(state.lastPrice, state.liquidityDepth), [state.lastPrice, state.liquidityDepth]);
  const tradeTape = useMemo(() => buildTradeTape(state.lastPrice), [state.lastPrice]);
  const analysis = useMemo(() => buildAnalysis(project.slug), [project.slug]);

  const sentiment = [
    { label: "상승", percent: project.up, tone: "up" as const },
    { label: "보합", percent: project.flat, tone: "neutral" as const },
    { label: "하락", percent: project.down, tone: "down" as const },
  ];

  const executionPrice = orderType === "market" ? state.lastPrice : limitPrice;
  const estimatedValue = executionPrice * quantity;
  const estimatedFee = estimatedValue * (state.feeBps / 10000);
  const buyingPower = 240000;
  const availableCash = 168500;
  const positionQty = Math.max(12, Math.round(project.participants / 28));
  const avgPrice = Number((state.prevClose * 0.985).toFixed(2));
  const unrealizedPnl = (state.lastPrice - avgPrice) * positionQty;
  const canSubmit =
    quantity > 0 &&
    executionPrice > 0 &&
    (orderSide === "sell" || estimatedValue + estimatedFee <= buyingPower);

  return (
    <div className="space-y-6">
      <section className="market-panel overflow-hidden">
        <div className="relative px-6 py-6 sm:px-7 sm:py-7">
          <div aria-hidden="true" className="market-grid absolute inset-y-0 right-0 hidden w-[36%] opacity-60 lg:block" />
          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-[720px]">
                <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.8px] text-[#848e9c]">
                  <Link href="/market/trading" className="transition hover:text-[#d1d4dc]">
                    Trading
                  </Link>
                  <span>/</span>
                  <span>{project.category}</span>
                </div>
                <h1 className="mt-4 text-[34px] font-semibold leading-[1.02] tracking-[-0.9px] text-[#d1d4dc] sm:text-[40px]">
                  {project.name} 트레이딩
                </h1>
                <p className="mt-3 max-w-[620px] text-[14px] leading-6 text-[#848e9c]">
                  {project.name} 단일 종목 화면입니다. 시장 전체 지수가 아니라 이 종목의 공정가, 수급, 심리, 주문 상태를 기준으로 표시합니다.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <article className="rounded-[6px] border border-[#2b2f36] bg-[#151922] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.8px] text-[#848e9c]">현재가</p>
                  <p className="mt-3 text-[28px] font-semibold tracking-[-0.5px] text-[#d1d4dc]">{formatPrice(state.lastPrice)}</p>
                  <p className={cn("mt-2 text-[12px] font-medium", toneClasses(changeTone(state.changeRate)))}>{formatChange(state.changeRate)}</p>
                </article>
                <article className="rounded-[6px] border border-[#2b2f36] bg-[#151922] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.8px] text-[#848e9c]">유동성</p>
                  <p className="mt-3 text-[28px] font-semibold tracking-[-0.5px] text-[#d1d4dc]">
                    {state.liquidityTier === "large" ? "대형" : state.liquidityTier === "mid" ? "중형" : "소형"}
                  </p>
                  <p className="mt-2 text-[12px] text-[#848e9c]">Depth {formatInteger(state.liquidityDepth)}</p>
                </article>
                <article className="rounded-[6px] border border-[#2b2f36] bg-[#151922] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.8px] text-[#848e9c]">참여자</p>
                  <p className="mt-3 text-[28px] font-semibold tracking-[-0.5px] text-[#d1d4dc]">{formatInteger(state.participants)}</p>
                  <p className="mt-2 text-[12px] text-[#848e9c]">24h 거래량 {formatInteger(state.volume24h)}</p>
                </article>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "신뢰 점수", value: `${factor.trust.toFixed(1)}점`, note: `${instrument.foundation.toUpperCase()} / ${instrument.license}` },
                { label: "도입 점수", value: `${factor.adoption.toFixed(1)}점`, note: `의존 패키지 ${formatInteger(raw.depsDependentPackages)}개` },
                { label: "실행 점수", value: `${factor.execution.toFixed(1)}점`, note: `활동일 ${raw.githubCommitDays90d}일` },
                { label: "성장 모멘텀", value: `${factor.momentum.toFixed(1)}점`, note: `성장 배수 ${factor.growthBoost.toFixed(3)}x` },
              ].map((metric) => (
                <article key={metric.label} className="rounded-[6px] border border-[#2b2f36] bg-[#151922] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.8px] text-[#848e9c]">{metric.label}</p>
                  <p className="mt-3 text-[24px] font-semibold tracking-[-0.4px] text-[#d1d4dc]">{metric.value}</p>
                  <p className="mt-2 text-[11px] text-[#848e9c]">{metric.note}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.6fr_0.95fr]">
        <div className="space-y-6">
          <section className="market-panel px-5 py-5">
            <div className="flex flex-col gap-3 border-b border-[#2b2f36] pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.8px] text-[#848e9c]">PRICE ACTION</p>
                <h2 className="mt-2 text-[20px] font-semibold text-[#d1d4dc]">{project.name} 시세 흐름</h2>
                <p className="mt-1 text-[12px] text-[#848e9c]">종목 전용 시계열과 이동평균선입니다. 시장 전체 인덱스가 아닙니다.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {TIMEFRAMES.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setTimeframe(item.key)}
                    className={cn(
                      "h-8 rounded-[4px] border px-3 text-[12px] font-medium transition",
                      timeframe === item.key
                        ? "border-[#3366ff] bg-[rgba(51,102,255,0.12)] text-[#d1d4dc]"
                        : "border-[#2b2f36] bg-[#1c212c] text-[#848e9c] hover:text-[#d1d4dc]",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-5">
              {[
                { label: "시가", value: state.open },
                { label: "고가", value: state.high },
                { label: "저가", value: state.low },
                { label: "종가", value: state.lastPrice },
                { label: "변동률", value: formatChange(state.changeRate) },
              ].map((metric) => (
                <article key={metric.label} className="rounded-[6px] border border-[#2b2f36] bg-[#161b24] px-3 py-3">
                  <p className="text-[10px] uppercase tracking-[0.8px] text-[#848e9c]">{metric.label}</p>
                  <p className={cn("mt-2 text-[16px] font-semibold text-[#d1d4dc]", metric.label === "변동률" && toneClasses(changeTone(state.changeRate)))}>
                    {typeof metric.value === "number" ? formatPrice(metric.value) : metric.value}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-5 h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} syncId="trading-detail">
                  <CartesianGrid stroke="#222734" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" hide />
                  <YAxis domain={["auto", "auto"]} tick={{ fill: "#848e9c", fontSize: 11 }} width={56} tickFormatter={(value) => formatPrice(Number(value))} />
                  <Tooltip content={priceTooltip} />
                  <Area dataKey="close" stroke="#3366ff" fill="rgba(51,102,255,0.18)" strokeWidth={2.4} name="종가" />
                  <Area dataKey="ma5" stroke="#f59e0b" fill="none" strokeWidth={1.8} name="MA5" />
                  <Area dataKey="ma20" stroke="#14b8a6" fill="none" strokeWidth={1.6} name="MA20" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 h-[112px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} syncId="trading-detail">
                  <CartesianGrid stroke="#222734" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: "#848e9c", fontSize: 11 }} tickFormatter={(value) => new Date(value).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })} />
                  <YAxis hide />
                  <Tooltip content={volumeTooltip} />
                  <Bar dataKey="volume" fill="#4f5b6c" radius={[3, 3, 0, 0]} name="거래량" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <section className="market-panel px-5 py-5">
              <div className="flex items-center justify-between border-b border-[#2b2f36] pb-4">
                <h2 className="text-[18px] font-semibold text-[#d1d4dc]">시장 심리</h2>
                <span className="text-[11px] text-[#848e9c]">예측 참여자 기준</span>
              </div>
              <div className="mt-4 space-y-4">
                {sentiment.map((item) => (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between text-[12px]">
                      <span className="text-[#d1d4dc]">{item.label}</span>
                      <span className={toneClasses(item.tone)}>{item.percent}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#1a1f28]">
                      <div
                        className={cn(
                          "h-2 rounded-full",
                          item.tone === "up" ? "bg-[#d6583a]" : item.tone === "down" ? "bg-[#2f7de1]" : "bg-[#697586]",
                        )}
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <article className="rounded-[6px] border border-[#2b2f36] bg-[#161b24] px-3 py-3">
                  <p className="text-[10px] uppercase tracking-[0.8px] text-[#848e9c]">Stars 90d</p>
                  <p className="mt-2 text-[18px] font-semibold text-[#d1d4dc]">{formatInteger(raw.githubStars90d)}</p>
                </article>
                <article className="rounded-[6px] border border-[#2b2f36] bg-[#161b24] px-3 py-3">
                  <p className="text-[10px] uppercase tracking-[0.8px] text-[#848e9c]">릴리스 365d</p>
                  <p className="mt-2 text-[18px] font-semibold text-[#d1d4dc]">{formatInteger(raw.githubReleaseCount365d)}</p>
                </article>
              </div>
            </section>

            <section className="market-panel px-5 py-5">
              <div className="flex items-center justify-between border-b border-[#2b2f36] pb-4">
                <h2 className="text-[18px] font-semibold text-[#d1d4dc]">호가창</h2>
                <span className="text-[11px] text-[#848e9c]">현재가 {formatPrice(state.lastPrice)}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="mb-2 text-[11px] uppercase tracking-[0.8px] text-[#848e9c]">매도</p>
                  <div className="space-y-2">
                    {orderBook.asks.map((level) => (
                      <button
                        key={`ask-${level.price}`}
                        type="button"
                        onClick={() => {
                          setOrderType("limit");
                          setOrderSide("buy");
                          setLimitPrice(level.price);
                        }}
                        className="flex w-full items-center justify-between rounded-[4px] bg-[rgba(214,88,58,0.08)] px-3 py-2 text-left hover:bg-[rgba(214,88,58,0.14)]"
                      >
                        <span className="text-[12px] text-[#d6583a]">{formatPrice(level.price)}</span>
                        <span className="text-[11px] text-[#cfd6df]">{formatInteger(level.quantity)}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[11px] uppercase tracking-[0.8px] text-[#848e9c]">매수</p>
                  <div className="space-y-2">
                    {orderBook.bids.map((level) => (
                      <button
                        key={`bid-${level.price}`}
                        type="button"
                        onClick={() => {
                          setOrderType("limit");
                          setOrderSide("sell");
                          setLimitPrice(level.price);
                        }}
                        className="flex w-full items-center justify-between rounded-[4px] bg-[rgba(47,125,225,0.08)] px-3 py-2 text-left hover:bg-[rgba(47,125,225,0.14)]"
                      >
                        <span className="text-[12px] text-[#2f7de1]">{formatPrice(level.price)}</span>
                        <span className="text-[11px] text-[#cfd6df]">{formatInteger(level.quantity)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </section>
        </div>

        <div className="space-y-6">
          <section className="market-panel overflow-hidden">
            <div className="border-b border-[#2b2f36] px-5 py-4">
              <h2 className="text-[18px] font-semibold text-[#d1d4dc]">주문 티켓</h2>
            </div>
            <div className="px-5 py-5">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrderSide("buy")}
                  className={cn(
                    "h-12 rounded-[4px] border text-[14px] font-semibold transition",
                    orderSide === "buy" ? "border-[#d6583a] bg-[#d6583a] text-white" : "border-[#7b4a3d] bg-[rgba(214,88,58,0.08)] text-[#d6583a]",
                  )}
                >
                  매수
                </button>
                <button
                  type="button"
                  onClick={() => setOrderSide("sell")}
                  className={cn(
                    "h-12 rounded-[4px] border text-[14px] font-semibold transition",
                    orderSide === "sell" ? "border-[#2f7de1] bg-[#2f7de1] text-white" : "border-[#345888] bg-[rgba(47,125,225,0.08)] text-[#2f7de1]",
                  )}
                >
                  매도
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {([
                  { key: "market", label: "시장가" },
                  { key: "limit", label: "지정가" },
                ] as const).map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setOrderType(item.key)}
                    className={cn(
                      "h-10 rounded-[4px] border text-[13px] transition",
                      orderType === item.key ? "border-[#3366ff] bg-[rgba(51,102,255,0.12)] text-[#d1d4dc]" : "border-[#2b2f36] bg-[#1c212c] text-[#848e9c]",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[11px] text-[#848e9c]">수량</span>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                    className="mt-2 h-11 w-full rounded-[4px] border border-[#2b2f36] bg-[#1c212c] px-3 text-[14px] text-[#d1d4dc] outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] text-[#848e9c]">{orderType === "market" ? "예상 체결가" : "지정가"}</span>
                  <input
                    type="number"
                    step="0.01"
                    disabled={orderType === "market"}
                    value={orderType === "market" ? executionPrice : limitPrice}
                    onChange={(event) => setLimitPrice(Number(event.target.value) || state.lastPrice)}
                    className="mt-2 h-11 w-full rounded-[4px] border border-[#2b2f36] bg-[#1c212c] px-3 text-[14px] text-[#d1d4dc] outline-none disabled:text-[#697586]"
                  />
                </label>
              </div>

              <div className="mt-3 flex gap-2">
                {[0.25, 0.5, 1].map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setQuantity(Math.max(1, Math.round((positionQty || 80) * ratio)))}
                    className="h-8 flex-1 rounded-[4px] border border-[#2b2f36] bg-[#1c212c] text-[11px] text-[#848e9c] transition hover:text-[#d1d4dc]"
                  >
                    {ratio === 1 ? "100%" : `${ratio * 100}%`}
                  </button>
                ))}
              </div>

              <label className="mt-4 block">
                <span className="text-[11px] text-[#848e9c]">주문 메모</span>
                <textarea
                  value={memo}
                  onChange={(event) => setMemo(event.target.value)}
                  placeholder="주문 이유나 관찰 포인트를 남기세요."
                  className="mt-2 h-24 w-full resize-none rounded-[4px] border border-[#2b2f36] bg-[#1c212c] px-3 py-2 text-[12px] text-[#d1d4dc] outline-none"
                />
              </label>

              <div className="mt-4 rounded-[6px] border border-[#2b2f36] bg-[#161b24] px-4 py-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[11px] text-[#848e9c]">주문 금액</p>
                    <p className="mt-1 text-[18px] font-semibold text-[#d1d4dc]">{formatInteger(Math.round(estimatedValue))}p</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#848e9c]">예상 수수료</p>
                    <p className="mt-1 text-[18px] font-semibold text-[#14b8a6]">{formatInteger(Math.round(estimatedFee))}p</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 border-t border-[#2b2f36] pt-3">
                  <div>
                    <p className="text-[11px] text-[#848e9c]">매수 가능</p>
                    <p className="mt-1 text-[13px] text-[#d1d4dc]">{formatInteger(buyingPower)}p</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#848e9c]">예수금</p>
                    <p className="mt-1 text-[13px] text-[#d1d4dc]">{formatInteger(availableCash)}p</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={!canSubmit}
                className={cn(
                  "mt-4 h-11 w-full rounded-[4px] text-[15px] font-semibold text-white transition",
                  orderSide === "buy" ? "bg-[#d6583a] hover:bg-[#e06648]" : "bg-[#2f7de1] hover:bg-[#468ef0]",
                  !canSubmit && "cursor-not-allowed opacity-60",
                )}
              >
                {orderType === "market" ? (orderSide === "buy" ? "시장가 매수" : "시장가 매도") : orderSide === "buy" ? "지정가 매수" : "지정가 매도"}
              </button>
            </div>
          </section>

          <section className="market-panel px-5 py-5">
            <div className="flex items-center justify-between border-b border-[#2b2f36] pb-4">
              <h2 className="text-[18px] font-semibold text-[#d1d4dc]">내 포지션</h2>
              <span className="text-[11px] text-[#848e9c]">진입가 {formatPrice(avgPrice)}</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <article className="rounded-[6px] border border-[#2b2f36] bg-[#161b24] px-3 py-3">
                <p className="text-[11px] text-[#848e9c]">보유 수량</p>
                <p className="mt-2 text-[18px] font-semibold text-[#d1d4dc]">{formatInteger(positionQty)} 계약</p>
              </article>
              <article className="rounded-[6px] border border-[#2b2f36] bg-[#161b24] px-3 py-3">
                <p className="text-[11px] text-[#848e9c]">평가 손익</p>
                <p className={cn("mt-2 text-[18px] font-semibold", unrealizedPnl >= 0 ? "text-[#14b8a6]" : "text-[#d6583a]")}>
                  {unrealizedPnl >= 0 ? "+" : ""}
                  {formatInteger(Math.round(unrealizedPnl))}p
                </p>
              </article>
            </div>
          </section>

          <section className="market-panel px-5 py-5">
            <div className="flex items-center justify-between border-b border-[#2b2f36] pb-4">
              <h2 className="text-[18px] font-semibold text-[#d1d4dc]">최근 체결</h2>
              <span className="text-[11px] text-[#848e9c]">실시간 시뮬레이션</span>
            </div>
            <div className="mt-4 space-y-2">
              {tradeTape.map((trade) => (
                <div key={trade.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-[4px] bg-[#161b24] px-3 py-2">
                  <div>
                    <p className={cn("text-[12px] font-medium", trade.side === "buy" ? "text-[#d6583a]" : "text-[#2f7de1]")}>
                      {trade.side === "buy" ? "매수 체결" : "매도 체결"}
                    </p>
                    <p className="mt-1 text-[11px] text-[#848e9c]">{trade.venue}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] text-[#d1d4dc]">{formatPrice(trade.price)}</p>
                    <p className="mt-1 text-[11px] text-[#848e9c]">{formatInteger(trade.quantity)} 계약</p>
                  </div>
                  <p className="text-[11px] text-[#848e9c]">{trade.time}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="market-panel px-5 py-5">
            <div className="flex items-center justify-between border-b border-[#2b2f36] pb-4">
              <h2 className="text-[18px] font-semibold text-[#d1d4dc]">미체결 주문</h2>
              <span className="text-[11px] text-[#848e9c]">{openOrders.length}건</span>
            </div>
            <div className="mt-4 space-y-2">
              {openOrders.map((order) => (
                <article key={order.id} className="rounded-[4px] bg-[#161b24] px-3 py-3">
                  <div className="flex items-center justify-between">
                    <p className={cn("text-[12px] font-medium", order.side === "buy" ? "text-[#d6583a]" : "text-[#2f7de1]")}>
                      {order.side === "buy" ? "매수" : "매도"} {order.type === "limit" ? "지정가" : "시장가"}
                    </p>
                    <button
                      type="button"
                      onClick={() => setOpenOrders((current) => current.filter((item) => item.id !== order.id))}
                      className="text-[11px] text-[#848e9c] transition hover:text-[#d1d4dc]"
                    >
                      취소
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-[#d1d4dc]">
                    <span>{formatPrice(order.price)}</span>
                    <span>{formatInteger(order.quantity)} 계약</span>
                    <span>{order.status}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-[#848e9c]">{order.submittedAt}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        {analysis.map((block) => (
          <section
            key={block.title}
            className={cn(
              "rounded-[6px] border px-4 py-4",
              block.tone === "blue"
                ? "border-[#2a4f8e] bg-[rgba(42,79,142,0.12)]"
                : block.tone === "teal"
                  ? "border-[#146f68] bg-[rgba(20,111,104,0.12)]"
                  : "border-[#7a6220] bg-[rgba(122,98,32,0.16)]",
            )}
          >
            <div className="flex gap-3">
              <SectionIcon tone={block.tone} />
              <div>
                <h3 className="text-[15px] font-semibold text-[#d1d4dc]">{block.title}</h3>
                <p className="mt-2 text-[12px] leading-6 text-[#c7d0da]">{block.body}</p>
              </div>
            </div>
          </section>
        ))}
      </section>
    </div>
  );
}
