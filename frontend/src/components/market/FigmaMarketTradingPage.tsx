"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/routing";
import { MarketLoginRequired } from "@/components/market/MarketLoginRequired";
import { MarketPageIntro, MarketPanel } from "@/components/market/MarketUi";
import { api } from "@/lib/api";
import { useTradingSessionState } from "@/lib/trading-session";
import { cn } from "@/lib/utils";

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

type Portfolio = {
  cash_points: number;
  invested_points: number;
  market_value: number;
  unrealized_pnl_points: number;
  realized_pnl_points: number;
  total_equity: number;
  positions: Array<{
    project_slug: string;
    quantity: number;
  }>;
};

const FILTERS = [
  { key: "all", label: "전체" },
  { key: "Infrastructure", label: "인프라" },
  { key: "Observability", label: "관측성" },
  { key: "Security", label: "보안" },
  { key: "Database", label: "데이터" },
];

function formatNumber(value: number, digits = 2) {
  return value.toLocaleString("ko-KR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function formatInteger(value: number) {
  return value.toLocaleString("ko-KR");
}

function toneClass(value: number) {
  return value >= 0 ? "text-[#d6583a]" : "text-[#2f7de1]";
}

export function FigmaMarketTradingPage() {
  const { session, hydrated } = useTradingSessionState();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!session?.accessToken) {
        if (!cancelled) {
          setLoading(false);
          setPortfolio(null);
          setQuotes([]);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [quoteRows, portfolioData] = await Promise.all([
          api.trading.quotes(50),
          api.trading.portfolio(session.accessToken),
        ]);

        if (cancelled) return;
        setQuotes(quoteRows);
        setPortfolio(portfolioData);
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
  }, [session?.accessToken]);

  const positionsBySlug = useMemo(() => {
    const map = new Map<string, number>();
    for (const position of portfolio?.positions ?? []) {
      map.set(position.project_slug, position.quantity);
    }
    return map;
  }, [portfolio]);

  const filteredQuotes = useMemo(() => {
    return quotes.filter((quote) => {
      const matchesFilter =
        selectedFilter === "all" ||
        (quote.category ?? "").toLowerCase().includes(selectedFilter.toLowerCase());
      const term = search.trim().toLowerCase();
      const matchesSearch =
        term.length === 0 ||
        quote.name.toLowerCase().includes(term) ||
        quote.slug.toLowerCase().includes(term) ||
        (quote.category ?? "").toLowerCase().includes(term);
      return matchesFilter && matchesSearch;
    });
  }, [quotes, search, selectedFilter]);

  const advancing = quotes.filter((quote) => quote.change_rate > 0).length;
  const declining = quotes.filter((quote) => quote.change_rate < 0).length;
  if (!hydrated) {
    return (
      <MarketPanel className="p-6">
        <p className="text-[13px] text-[#848e9c]">트레이딩 보드를 준비하는 중입니다.</p>
      </MarketPanel>
    );
  }

  if (!session) {
    return (
      <MarketLoginRequired
        title="트레이딩은 로그인 후 이용할 수 있습니다"
        body="개인 포인트 잔고와 포지션은 로그인한 계정에 귀속됩니다. 로그인 후 종목 거래와 주문 내역 확인이 가능합니다."
      />
    );
  }

  return (
    <div className="space-y-6">
      <MarketPageIntro
        eyebrow="Trading"
        title="OSS 프로젝트 트레이딩"
        description="실제 포인트 잔고와 포지션을 기반으로 오픈소스 종목을 매수·매도하는 게임형 거래 화면입니다."
        stats={[
          {
            label: "접속 계정",
            value: session?.username ?? "게스트 준비 중",
            note: "브라우저마다 개별 게스트 세션이 생성됩니다.",
          },
          {
            label: "보유 포인트",
            value: portfolio ? `${formatInteger(portfolio.cash_points)}p` : "-",
            note: portfolio ? `총 자산 ${formatInteger(portfolio.total_equity)}p` : "포트폴리오 조회 중",
          },
          {
            label: "상승 종목",
            value: formatInteger(advancing),
            note: `하락 ${formatInteger(declining)}개`,
            accent: "text-[#d6583a]",
          },
          {
            label: "보유 포지션",
            value: formatInteger(portfolio?.positions.length ?? 0),
            note: portfolio ? `평가 손익 ${formatInteger(portfolio.unrealized_pnl_points)}p` : "세션 준비 중",
            accent: "text-[#14b8a6]",
          },
        ]}
      />

      <MarketPanel className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-[16px] font-semibold leading-6 text-[#d1d4dc]">실시간 종목 보드</h2>
            <p className="mt-1 text-[12px] leading-5 text-[#848e9c]">
              각 종목의 현재 점수 기반 가격, 일간 변동, 내 보유 수량을 함께 확인할 수 있습니다.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="프로젝트 검색"
              className="h-10 rounded-[4px] border border-[#2b2f36] bg-[#161b24] px-3 text-[13px] text-[#d1d4dc] outline-none placeholder:text-[#697586]"
            />
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setSelectedFilter(filter.key)}
                  className={cn(
                    "h-10 rounded-[4px] border px-3 text-[12px] font-medium transition",
                    selectedFilter === filter.key
                      ? "border-[#3366ff] bg-[rgba(51,102,255,0.12)] text-[#d1d4dc]"
                      : "border-[#2b2f36] bg-[#161b24] text-[#848e9c] hover:text-[#d1d4dc]",
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-[6px] border border-[rgba(214,88,58,0.28)] bg-[rgba(214,88,58,0.1)] px-4 py-3 text-[13px] text-[#ffd7cf]">
            {error}
          </div>
        ) : null}

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-[12px] text-[#d1d4dc]">
            <thead className="text-[11px] uppercase tracking-[0.8px] text-[#848e9c]">
              <tr className="border-b border-[#2b2f36]">
                <th className="px-3 py-3">종목</th>
                <th className="px-3 py-3">카테고리</th>
                <th className="px-3 py-3">순위</th>
                <th className="px-3 py-3">현재가</th>
                <th className="px-3 py-3">전일 대비</th>
                <th className="px-3 py-3">내 수량</th>
                <th className="px-3 py-3 text-right">이동</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-[#848e9c]">
                    트레이딩 보드를 불러오는 중입니다.
                  </td>
                </tr>
              ) : filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-[#848e9c]">
                    조건에 맞는 종목이 없습니다.
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((quote) => (
                  <tr key={quote.slug} className="border-b border-[rgba(43,47,54,0.55)]">
                    <td className="px-3 py-4">
                      <div>
                        <p className="font-semibold text-[#d1d4dc]">{quote.name}</p>
                        <p className="mt-1 text-[11px] text-[#848e9c]">{quote.slug}</p>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-[#9aa4b2]">{quote.category ?? "-"}</td>
                    <td className="px-3 py-4">#{quote.rank_global ?? "-"}</td>
                    <td className="px-3 py-4 font-semibold">{formatNumber(quote.current_price)}</td>
                    <td className={cn("px-3 py-4 font-medium", toneClass(quote.change_rate))}>
                      {quote.change_rate >= 0 ? "+" : ""}
                      {formatNumber(quote.change_rate)}%
                    </td>
                    <td className="px-3 py-4">{formatInteger(positionsBySlug.get(quote.slug) ?? 0)}</td>
                    <td className="px-3 py-4 text-right">
                      <Link
                        href={`/market/trading/${quote.slug}`}
                        className="inline-flex h-8 items-center rounded-[4px] border border-[rgba(51,102,255,0.22)] bg-[rgba(51,102,255,0.1)] px-3 text-[12px] font-medium text-[#d1d4dc] transition hover:bg-[rgba(51,102,255,0.16)]"
                      >
                        거래하기
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </MarketPanel>
    </div>
  );
}
