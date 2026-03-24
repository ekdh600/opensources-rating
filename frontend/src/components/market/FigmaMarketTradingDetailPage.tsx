"use client";

import { useEffect, useMemo, useState } from "react";
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
import { MarketLoginRequired } from "@/components/market/MarketLoginRequired";
import { MarketPanel } from "@/components/market/MarketUi";
import { api } from "@/lib/api";
import { useTradingSessionState } from "@/lib/trading-session";
import { cn } from "@/lib/utils";

type TimeframeKey = "1D" | "1W" | "1M";
type TradeSide = "buy" | "sell";

type Quote = {
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
};

type TradingOrder = {
  id: number;
  project_id: number;
  season_id: number;
  side: TradeSide;
  order_type: string;
  status: string;
  quantity: number;
  price: number;
  gross_points: number;
  fee_points: number;
  net_points: number;
  created_at: string;
};

type PortfolioPosition = {
  project_id: number;
  project_slug: string;
  project_name: string;
  quantity: number;
  average_price: number;
  current_price: number;
  market_value: number;
  invested_points: number;
  unrealized_pnl_points: number;
  realized_pnl_points: number;
};

type Portfolio = {
  cash_points: number;
  invested_points: number;
  market_value: number;
  unrealized_pnl_points: number;
  realized_pnl_points: number;
  total_equity: number;
  positions: PortfolioPosition[];
};

type ProjectComment = {
  id: number;
  project_id: number;
  parent_id: number | null;
  user_id: number;
  username: string;
  display_name: string;
  content: string;
  recommendation_count: number;
  recommended_by_me: boolean;
  created_at: string;
  updated_at: string;
};

type ChartPoint = {
  date: string;
  close: number;
  ma5: number;
  ma20: number;
  volume: number;
};

const TIMEFRAMES: { key: TimeframeKey; label: string; points: number }[] = [
  { key: "1D", label: "1일", points: 16 },
  { key: "1W", label: "1주", points: 20 },
  { key: "1M", label: "1개월", points: 24 },
];

function formatPrice(value: number) {
  return value.toLocaleString("ko-KR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatInteger(value: number) {
  return value.toLocaleString("ko-KR");
}

function formatSignedPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function movingAverage(values: number[], length: number, index: number) {
  const start = Math.max(0, index - length + 1);
  const slice = values.slice(start, index + 1);
  return slice.reduce((sum, current) => sum + current, 0) / slice.length;
}

function buildChart(seed: string, price: number, changeRate: number, timeframe: TimeframeKey): ChartPoint[] {
  const config = TIMEFRAMES.find((item) => item.key === timeframe) ?? TIMEFRAMES[0];
  const seedValue = seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const series = Array.from({ length: config.points }, (_, index) => {
    const wave = Math.sin((index + seedValue / 7) * 0.65) * 0.022;
    const micro = Math.cos((index + seedValue / 11) * 1.15) * 0.011;
    const drift = ((index - config.points / 2) / config.points) * (changeRate / 100);
    const close = Number((price * (0.985 + wave + micro + drift)).toFixed(2));
    const volume = Math.round(1400 + ((seedValue + index * 131) % 900) + Math.abs(wave) * 5000);
    return {
      date: `2026-03-${String(index + 1).padStart(2, "0")}T09:00:00`,
      close,
      volume,
      ma5: 0,
      ma20: 0,
    };
  });

  const closes = series.map((item) => item.close);
  return series.map((item, index) => ({
    ...item,
    ma5: Number(movingAverage(closes, 5, index).toFixed(2)),
    ma20: Number(movingAverage(closes, Math.min(20, closes.length), index).toFixed(2)),
  }));
}

function priceTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length || !label) return null;
  return (
    <div className="rounded-[6px] border border-[#2b2f36] bg-[#0d1117] px-[10px] py-[8px] text-[11px] text-[#d1d4dc]">
      <p className="mb-1 text-[#9aa4b2]">{new Date(label).toLocaleString("ko-KR")}</p>
      {payload.map((entry: { name?: string; value?: number }) => (
        <div key={entry.name} className="flex items-center justify-between gap-4">
          <span>{entry.name}</span>
          <span>{formatPrice(entry.value ?? 0)}</span>
        </div>
      ))}
    </div>
  );
}

function volumeTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length || !label) return null;
  return (
    <div className="rounded-[6px] border border-[#2b2f36] bg-[#0d1117] px-[10px] py-[8px] text-[11px] text-[#d1d4dc]">
      <p className="mb-1 text-[#9aa4b2]">{new Date(label).toLocaleString("ko-KR")}</p>
      <div className="flex items-center justify-between gap-4">
        <span>거래량</span>
        <span>{formatInteger(payload[0]?.value ?? 0)}</span>
      </div>
    </div>
  );
}

export function FigmaMarketTradingDetailPage({ slug }: { slug: string }) {
  const { session, hydrated } = useTradingSessionState();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [orders, setOrders] = useState<TradingOrder[]>([]);
  const [timeframe, setTimeframe] = useState<TimeframeKey>("1M");
  const [side, setSide] = useState<TradeSide>("buy");
  const [quantity, setQuantity] = useState(10);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [comments, setComments] = useState<ProjectComment[]>([]);
  const [commentDraft, setCommentDraft] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!session?.accessToken) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [quotes, portfolioData, orderData, commentData] = await Promise.all([
          api.trading.quotes(50),
          api.trading.portfolio(session.accessToken),
          api.trading.orders(session.accessToken, 50),
          api.trading.comments(session.accessToken, slug),
        ]);

        if (cancelled) return;
        setQuote(quotes.find((item) => item.slug === slug) ?? null);
        setPortfolio(portfolioData);
        setOrders(orderData);
        setComments(commentData);
      } catch (loadError) {
        if (cancelled) return;
        setError(loadError instanceof Error ? loadError.message : "트레이딩 데이터를 불러오지 못했습니다.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [session?.accessToken, slug]);

  const position = useMemo(
    () => portfolio?.positions.find((item) => item.project_slug === slug) ?? null,
    [portfolio, slug],
  );

  const chartData = useMemo(
    () => (quote ? buildChart(quote.slug, quote.current_price, quote.change_rate, timeframe) : []),
    [quote, timeframe],
  );

  const relatedOrders = useMemo(() => {
    if (!quote) return [];
    return orders.filter((order) => order.project_id === quote.project_id).slice(0, 8);
  }, [orders, quote]);

  async function refreshTradingState() {
    if (!session?.accessToken) return;
    const [portfolioData, orderData, quotes, commentData] = await Promise.all([
      api.trading.portfolio(session.accessToken),
      api.trading.orders(session.accessToken, 50),
      api.trading.quotes(50),
      api.trading.comments(session.accessToken, slug),
    ]);
    setPortfolio(portfolioData);
    setOrders(orderData);
    setQuote(quotes.find((item) => item.slug === slug) ?? null);
    setComments(commentData);
  }

  async function submitComment() {
    if (!session?.accessToken || !quote || !commentDraft.trim()) return;

    try {
      setCommentLoading(true);
      const created = await api.trading.createComment(session.accessToken, quote.slug, {
        content: commentDraft.trim(),
      });
      setComments((current) => [created, ...current]);
      setCommentDraft("");
    } catch (commentError) {
      setError(commentError instanceof Error ? commentError.message : "댓글을 저장하지 못했습니다.");
    } finally {
      setCommentLoading(false);
    }
  }

  async function toggleRecommendation(commentId: number) {
    if (!session?.accessToken) return;

    try {
      const result = await api.trading.toggleCommentRecommendation(session.accessToken, commentId);
      setComments((current) =>
        current.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                recommendation_count: result.recommendation_count,
                recommended_by_me: result.recommended_by_me,
              }
            : comment,
        ),
      );
    } catch (commentError) {
      setError(commentError instanceof Error ? commentError.message : "추천 처리에 실패했습니다.");
    }
  }

  async function submitOrder() {
    if (!quote) return;

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      if (!session?.accessToken) {
        setError("로그인이 필요합니다.");
        return;
      }
      const result = await api.trading.createOrder(session.accessToken, {
        project_slug: quote.slug,
        side,
        quantity,
      });

      await refreshTradingState();
      setSuccess(
        `${quote.name} ${quantity}주 ${side === "buy" ? "매수" : "매도"}가 체결되었습니다. 잔고 ${formatInteger(result.cash_points)}p`,
      );
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "주문 처리 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <MarketPanel className="px-6 py-8 text-[14px] text-[#848e9c]">
        종목 데이터를 불러오는 중입니다.
      </MarketPanel>
    );
  }

  if (!hydrated) {
    return (
      <MarketPanel className="px-6 py-8 text-[14px] text-[#848e9c]">
        트레이딩 화면을 준비하는 중입니다.
      </MarketPanel>
    );
  }

  if (!session) {
    return (
      <MarketLoginRequired
        title="종목 상세 거래는 로그인 후 이용할 수 있습니다"
        body="주문 체결, 주문 내역, 개인 포지션은 로그인한 계정 기준으로만 제공됩니다."
      />
    );
  }

  if (!quote) {
    return (
      <MarketPanel className="px-6 py-8">
        <p className="text-[15px] font-semibold text-[#d1d4dc]">종목을 찾을 수 없습니다.</p>
        <p className="mt-2 text-[13px] text-[#848e9c]">현재 거래 가능한 OSS 종목 목록에 없는 slug입니다.</p>
      </MarketPanel>
    );
  }

  const estimatedValue = Math.round(quote.current_price * quantity);
  const estimatedFee = Math.round(estimatedValue * 0.002);
  const cashPoints = portfolio?.cash_points ?? 0;
  const canSubmit = quantity > 0 && (side === "sell" ? (position?.quantity ?? 0) >= quantity : cashPoints >= estimatedValue + estimatedFee);

  return (
    <div className="space-y-6">
      <MarketPanel className="overflow-hidden">
        <div className="relative px-6 py-6 sm:px-7 sm:py-7">
          <div aria-hidden="true" className="market-grid absolute inset-y-0 right-0 hidden w-[34%] opacity-70 lg:block" />
          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.8px] text-[#848e9c]">
              <Link href="/market/trading" className="transition hover:text-[#d1d4dc]">
                Trading
              </Link>
              <span>/</span>
              <span>{quote.category ?? "OSS"}</span>
            </div>

            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-[700px]">
                <h1 className="text-[34px] font-semibold leading-[1.02] tracking-[-0.9px] text-[#d1d4dc] sm:text-[40px]">
                  {quote.name} 트레이딩
                </h1>
                <p className="mt-3 text-[14px] leading-6 text-[#848e9c]">
                  현재 점수 기반 가격을 사용해 개인 포인트로 매수·매도하는 게임형 종목 화면입니다.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <article className="rounded-[6px] border border-[#2b2f36] bg-[#151922] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.8px] text-[#848e9c]">현재가</p>
                  <p className="mt-3 text-[28px] font-semibold tracking-[-0.5px] text-[#d1d4dc]">{formatPrice(quote.current_price)}</p>
                  <p className={cn("mt-2 text-[12px] font-medium", quote.change_rate >= 0 ? "text-[#d6583a]" : "text-[#2f7de1]")}>
                    {formatSignedPercent(quote.change_rate)}
                  </p>
                </article>
                <article className="rounded-[6px] border border-[#2b2f36] bg-[#151922] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.8px] text-[#848e9c]">내 보유 수량</p>
                  <p className="mt-3 text-[28px] font-semibold tracking-[-0.5px] text-[#d1d4dc]">
                    {formatInteger(position?.quantity ?? 0)}
                  </p>
                  <p className="mt-2 text-[12px] text-[#848e9c]">평균 단가 {formatPrice(position?.average_price ?? quote.current_price)}</p>
                </article>
                <article className="rounded-[6px] border border-[#2b2f36] bg-[#151922] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.8px] text-[#848e9c]">보유 포인트</p>
                  <p className="mt-3 text-[28px] font-semibold tracking-[-0.5px] text-[#d1d4dc]">{formatInteger(cashPoints)}p</p>
                  <p className="mt-2 text-[12px] text-[#848e9c]">총 자산 {formatInteger(portfolio?.total_equity ?? cashPoints)}p</p>
                </article>
              </div>
            </div>
          </div>
        </div>
      </MarketPanel>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_0.95fr]">
        <div className="space-y-6">
          <MarketPanel className="px-5 py-5">
            <div className="flex flex-col gap-3 border-b border-[#2b2f36] pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.8px] text-[#848e9c]">Price Action</p>
                <h2 className="mt-2 text-[20px] font-semibold text-[#d1d4dc]">{quote.name} 시세 흐름</h2>
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

            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              {[
                { label: "전일 종가", value: formatPrice(quote.previous_close), accent: "text-[#d1d4dc]" },
                { label: "현재가", value: formatPrice(quote.current_price), accent: "text-[#d1d4dc]" },
                { label: "변동 포인트", value: `${quote.change_points >= 0 ? "+" : ""}${formatPrice(quote.change_points)}`, accent: quote.change_points >= 0 ? "text-[#d6583a]" : "text-[#2f7de1]" },
                { label: "변동률", value: formatSignedPercent(quote.change_rate), accent: quote.change_rate >= 0 ? "text-[#d6583a]" : "text-[#2f7de1]" },
              ].map((metric) => (
                <article key={metric.label} className="rounded-[6px] border border-[#2b2f36] bg-[#161b24] px-3 py-3">
                  <p className="text-[10px] uppercase tracking-[0.8px] text-[#848e9c]">{metric.label}</p>
                  <p className={cn("mt-2 text-[16px] font-semibold", metric.accent)}>{metric.value}</p>
                </article>
              ))}
            </div>

            <div className="mt-5 h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} syncId="trading-detail">
                  <CartesianGrid stroke="#222734" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" hide />
                  <YAxis tick={{ fill: "#848e9c", fontSize: 11 }} width={56} tickFormatter={(value) => formatPrice(Number(value))} />
                  <Tooltip content={priceTooltip} />
                  <Area type="monotone" dataKey="close" stroke="#3366ff" fill="rgba(51,102,255,0.18)" strokeWidth={2.4} name="종가" />
                  <Area type="monotone" dataKey="ma5" stroke="#22c55e" fill="none" strokeWidth={1.8} name="MA5" />
                  <Area type="monotone" dataKey="ma20" stroke="#f59e0b" fill="none" strokeWidth={1.6} name="MA20" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 h-[112px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} syncId="trading-detail">
                  <CartesianGrid stroke="#222734" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#848e9c", fontSize: 11 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })}
                  />
                  <YAxis hide />
                  <Tooltip content={volumeTooltip} />
                  <Bar dataKey="volume" fill="#4f5b6c" radius={[3, 3, 0, 0]} name="거래량" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </MarketPanel>

          <MarketPanel className="px-5 py-5">
            <div className="flex items-center justify-between border-b border-[#2b2f36] pb-4">
              <h2 className="text-[18px] font-semibold text-[#d1d4dc]">실제 주문 내역</h2>
              <span className="text-[11px] text-[#848e9c]">{relatedOrders.length}건</span>
            </div>
            <div className="mt-4 space-y-2">
              {relatedOrders.length === 0 ? (
                <p className="rounded-[4px] bg-[#161b24] px-3 py-3 text-[12px] text-[#848e9c]">
                  아직 이 종목에 대한 체결 내역이 없습니다.
                </p>
              ) : (
                relatedOrders.map((order) => (
                  <article key={order.id} className="rounded-[4px] bg-[#161b24] px-3 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className={cn("text-[12px] font-medium", order.side === "buy" ? "text-[#d6583a]" : "text-[#2f7de1]")}>
                        {order.side === "buy" ? "매수" : "매도"} {order.quantity}주
                      </p>
                      <span className="text-[11px] text-[#848e9c]">
                        {new Date(order.created_at).toLocaleString("ko-KR")}
                      </span>
                    </div>
                    <div className="mt-2 grid gap-2 text-[12px] text-[#d1d4dc] sm:grid-cols-4">
                      <span>체결가 {formatPrice(order.price)}</span>
                      <span>총액 {formatInteger(order.gross_points)}p</span>
                      <span>수수료 {formatInteger(order.fee_points)}p</span>
                      <span>상태 {order.status}</span>
                    </div>
                  </article>
                ))
              )}
            </div>
          </MarketPanel>

          <MarketPanel className="px-5 py-5">
            <div className="flex items-center justify-between border-b border-[#2b2f36] pb-4">
              <h2 className="text-[18px] font-semibold text-[#d1d4dc]">커뮤니티</h2>
              <span className="text-[11px] text-[#848e9c]">{comments.length} comments</span>
            </div>

            <div className="mt-4 rounded-[6px] border border-[#2b2f36] bg-[#161b24] p-4">
              <p className="text-[12px] font-medium text-[#d1d4dc]">의견 남기기</p>
              <textarea
                value={commentDraft}
                onChange={(event) => setCommentDraft(event.target.value)}
                placeholder="이 종목에 대한 의견, 근거, 시장 관점을 남겨보세요."
                className="mt-3 min-h-[104px] w-full rounded-[4px] border border-[#2b2f36] bg-[#1c212c] px-3 py-3 text-[13px] text-[#d1d4dc] outline-none placeholder:text-[#697586]"
              />
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-[11px] text-[#848e9c]">욕설·광고·도배 댓글은 운영 정책에 따라 숨김 처리됩니다.</span>
                <button
                  type="button"
                  onClick={() => void submitComment()}
                  disabled={commentLoading || !commentDraft.trim()}
                  className={cn(
                    "inline-flex h-9 items-center rounded-[4px] bg-[#3366ff] px-4 text-[12px] font-medium text-white transition hover:bg-[#4b7cff]",
                    (commentLoading || !commentDraft.trim()) && "cursor-not-allowed opacity-60",
                  )}
                >
                  {commentLoading ? "등록 중..." : "댓글 등록"}
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {comments.length === 0 ? (
                <div className="rounded-[4px] bg-[#161b24] px-4 py-4 text-[12px] text-[#848e9c]">
                  아직 작성된 커뮤니티 댓글이 없습니다. 첫 의견을 남겨보세요.
                </div>
              ) : (
                comments.map((comment) => (
                  <article key={comment.id} className="rounded-[6px] border border-[#2b2f36] bg-[#161b24] px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[13px] font-semibold text-[#d1d4dc]">{comment.display_name}</p>
                        <p className="mt-1 text-[11px] text-[#848e9c]">
                          @{comment.username} · {new Date(comment.created_at).toLocaleString("ko-KR")}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void toggleRecommendation(comment.id)}
                        className={cn(
                          "inline-flex h-8 items-center rounded-[4px] border px-3 text-[12px] font-medium transition",
                          comment.recommended_by_me
                            ? "border-[rgba(51,102,255,0.22)] bg-[rgba(51,102,255,0.1)] text-[#d1d4dc]"
                            : "border-[#2b2f36] bg-[#1c212c] text-[#848e9c] hover:text-[#d1d4dc]",
                        )}
                      >
                        추천 {comment.recommendation_count}
                      </button>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-[13px] leading-6 text-[#c7d0da]">{comment.content}</p>
                  </article>
                ))
              )}
            </div>
          </MarketPanel>
        </div>

        <div className="space-y-6">
          <MarketPanel className="overflow-hidden">
            <div className="border-b border-[#2b2f36] px-5 py-4">
              <h2 className="text-[18px] font-semibold text-[#d1d4dc]">주문 티켓</h2>
              <p className="mt-1 text-[12px] text-[#848e9c]">현재는 시장가 주문만 실제 체결됩니다.</p>
            </div>
            <div className="px-5 py-5">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSide("buy")}
                  className={cn(
                    "h-12 rounded-[4px] border text-[14px] font-semibold transition",
                    side === "buy" ? "border-[#d6583a] bg-[#d6583a] text-white" : "border-[#7b4a3d] bg-[rgba(214,88,58,0.08)] text-[#d6583a]",
                  )}
                >
                  매수
                </button>
                <button
                  type="button"
                  onClick={() => setSide("sell")}
                  className={cn(
                    "h-12 rounded-[4px] border text-[14px] font-semibold transition",
                    side === "sell" ? "border-[#2f7de1] bg-[#2f7de1] text-white" : "border-[#345888] bg-[rgba(47,125,225,0.08)] text-[#2f7de1]",
                  )}
                >
                  매도
                </button>
              </div>

              <div className="mt-4 rounded-[6px] border border-[#2b2f36] bg-[#161b24] px-4 py-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[11px] text-[#848e9c]">현재가</p>
                    <p className="mt-1 text-[18px] font-semibold text-[#d1d4dc]">{formatPrice(quote.current_price)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#848e9c]">수량</p>
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                      className="mt-1 h-10 w-full rounded-[4px] border border-[#2b2f36] bg-[#1c212c] px-3 text-[14px] text-[#d1d4dc] outline-none"
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#2b2f36] pt-4">
                  <div>
                    <p className="text-[11px] text-[#848e9c]">예상 주문 금액</p>
                    <p className="mt-1 text-[18px] font-semibold text-[#d1d4dc]">{formatInteger(estimatedValue)}p</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-[#848e9c]">예상 수수료</p>
                    <p className="mt-1 text-[18px] font-semibold text-[#14b8a6]">{formatInteger(estimatedFee)}p</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 text-[12px] text-[#c7d0da]">
                  <p>보유 포인트: {formatInteger(cashPoints)}p</p>
                  <p>보유 수량: {formatInteger(position?.quantity ?? 0)}주</p>
                  <p>평가 손익: {formatInteger(position?.unrealized_pnl_points ?? 0)}p</p>
                </div>
              </div>

              {error ? (
                <div className="mt-4 rounded-[6px] border border-[rgba(214,88,58,0.28)] bg-[rgba(214,88,58,0.1)] px-4 py-3 text-[13px] text-[#ffd7cf]">
                  {error}
                </div>
              ) : null}
              {success ? (
                <div className="mt-4 rounded-[6px] border border-[rgba(20,184,166,0.24)] bg-[rgba(20,184,166,0.1)] px-4 py-3 text-[13px] text-[#d2fff8]">
                  {success}
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => void submitOrder()}
                disabled={!canSubmit || submitting}
                className={cn(
                  "mt-4 h-11 w-full rounded-[4px] text-[15px] font-semibold text-white transition",
                  side === "buy" ? "bg-[#d6583a] hover:bg-[#e06648]" : "bg-[#2f7de1] hover:bg-[#468ef0]",
                  (!canSubmit || submitting) && "cursor-not-allowed opacity-60",
                )}
              >
                {submitting ? "주문 처리 중..." : side === "buy" ? "시장가 매수" : "시장가 매도"}
              </button>
            </div>
          </MarketPanel>

          <MarketPanel className="px-5 py-5">
            <div className="flex items-center justify-between border-b border-[#2b2f36] pb-4">
              <h2 className="text-[18px] font-semibold text-[#d1d4dc]">내 포지션</h2>
              <span className="text-[11px] text-[#848e9c]">{quote.name}</span>
            </div>
            {position ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  { label: "보유 수량", value: `${formatInteger(position.quantity)}주`, accent: "text-[#d1d4dc]" },
                  { label: "평균 단가", value: formatPrice(position.average_price), accent: "text-[#d1d4dc]" },
                  { label: "평가 금액", value: `${formatInteger(position.market_value)}p`, accent: "text-[#d1d4dc]" },
                  {
                    label: "평가 손익",
                    value: `${position.unrealized_pnl_points >= 0 ? "+" : ""}${formatInteger(position.unrealized_pnl_points)}p`,
                    accent: position.unrealized_pnl_points >= 0 ? "text-[#14b8a6]" : "text-[#d6583a]",
                  },
                ].map((metric) => (
                  <article key={metric.label} className="rounded-[6px] border border-[#2b2f36] bg-[#161b24] px-3 py-3">
                    <p className="text-[10px] uppercase tracking-[0.8px] text-[#848e9c]">{metric.label}</p>
                    <p className={cn("mt-2 text-[18px] font-semibold", metric.accent)}>{metric.value}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-[4px] bg-[#161b24] px-3 py-3 text-[12px] text-[#848e9c]">
                아직 이 종목 포지션이 없습니다.
              </p>
            )}
          </MarketPanel>
        </div>
      </section>
    </div>
  );
}
