"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/routing";
import { MarketPageIntro, MarketPanel } from "@/components/market/MarketUi";
import { api } from "@/lib/api";
import { resolveTradingAuthError, useTradingSessionState } from "@/lib/trading-session";
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

const FILTER_CATEGORY_MATCHERS: Record<string, string[]> = {
  Infrastructure: [
    "쿠버네티스",
    "컨테이너 런타임",
    "서비스 메시",
    "네트워킹/CNI",
    "인그레스/API 게이트웨이",
    "스토리지",
    "CI/CD",
    "GitOps",
    "IaC",
    "클라우드 플랫폼",
  ],
  Observability: ["관측성/모니터링", "로깅"],
  Security: ["보안"],
  Database: ["데이터베이스", "메시징/스트리밍"],
};

const PAGE_SIZE = 50;

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
  const [scoreMin, setScoreMin] = useState(0);
  const [scoreMax, setScoreMax] = useState(100);
  const [volatilityMin, setVolatilityMin] = useState(-10);
  const [volatilityMax, setVolatilityMax] = useState(10);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const quoteRows = await api.trading.quotes(500);
        const portfolioData = session?.accessToken ? await api.trading.portfolio(session.accessToken) : null;

        if (cancelled) return;
        setQuotes(quoteRows);
        setPortfolio(portfolioData);
      } catch (loadError) {
        if (cancelled) return;
        setError(resolveTradingAuthError(loadError, "트레이딩 데이터를 불러오지 못했습니다."));
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
      const category = quote.category ?? "";
      const filterCategories = FILTER_CATEGORY_MATCHERS[selectedFilter];
      const matchesFilter =
        selectedFilter === "all" ||
        (filterCategories
          ? filterCategories.some((item) => category.includes(item))
          : category.toLowerCase().includes(selectedFilter.toLowerCase()));
      const term = search.trim().toLowerCase();
      const matchesSearch =
        term.length === 0 ||
        quote.name.toLowerCase().includes(term) ||
        quote.slug.toLowerCase().includes(term) ||
        category.toLowerCase().includes(term);
      const matchesScore = quote.current_price >= scoreMin && quote.current_price <= scoreMax;
      const matchesVolatility = quote.change_rate >= volatilityMin && quote.change_rate <= volatilityMax;
      const matchesFavorite = !favoritesOnly || favorites.includes(quote.slug);
      return matchesFilter && matchesSearch && matchesScore && matchesVolatility && matchesFavorite;
    });
  }, [favorites, favoritesOnly, quotes, scoreMax, scoreMin, search, selectedFilter, volatilityMax, volatilityMin]);

  const categoryFilters = useMemo(
    () => FILTERS.map((filter) => ({ ...filter, count: filter.key === "all" ? quotes.length : quotes.filter((quote) => {
      const category = quote.category ?? "";
      const filterCategories = FILTER_CATEGORY_MATCHERS[filter.key];
      return filterCategories ? filterCategories.some((item) => category.includes(item)) : false;
    }).length })),
    [quotes],
  );

  const pageCount = Math.max(1, Math.ceil(filteredQuotes.length / PAGE_SIZE));
  const pagedQuotes = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredQuotes.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredQuotes]);

  useEffect(() => {
    setCurrentPage(1);
  }, [favoritesOnly, scoreMax, scoreMin, search, selectedFilter, volatilityMax, volatilityMin]);

  useEffect(() => {
    if (currentPage > pageCount) {
      setCurrentPage(pageCount);
    }
  }, [currentPage, pageCount]);

  const toggleFavorite = (slug: string) => {
    setFavorites((current) => (current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]));
  };

  const advancing = quotes.filter((quote) => quote.change_rate > 0).length;
  const declining = quotes.filter((quote) => quote.change_rate < 0).length;
  if (!hydrated) {
    return (
      <MarketPanel className="p-6">
        <p className="text-[13px] text-[#848e9c]">트레이딩 보드를 준비하는 중입니다.</p>
      </MarketPanel>
    );
  }

  return (
    <div className="space-y-6">
      <MarketPageIntro
        eyebrow="Trading"
        title="오픈소스 프로젝트 트레이딩 & 탐색"
        description="같은 화면에서 후보 종목을 탐색하고, 로그인 후에는 바로 주문과 포지션 관리까지 이어갈 수 있는 통합 거래 화면입니다."
        stats={[
          {
            label: "접속 상태",
            value: session ? session.username : "게스트",
            note: session
              ? "이메일 인증을 마친 로그인 계정은 바로 주문과 포지션 관리를 이용할 수 있습니다."
              : "로그인 전에는 종목 탐색만 가능하고, 실제 주문은 로그인 후 이용할 수 있습니다.",
          },
          {
            label: "보유 포인트",
            value: portfolio ? `${formatInteger(portfolio.cash_points)}p` : "-",
            note: portfolio ? `총 자산 ${formatInteger(portfolio.total_equity)}p` : "로그인 후 잔고와 포지션이 표시됩니다.",
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
            note: portfolio ? `평가 손익 ${formatInteger(portfolio.unrealized_pnl_points)}p` : "탐색 후 로그인하면 바로 실행 가능합니다.",
            accent: "text-[#14b8a6]",
          },
        ]}
      />

      {!session ? (
        <MarketPanel className="px-4 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-[16px] font-semibold leading-6 text-[#d1d4dc]">탐색은 지금 가능하고, 주문은 로그인 후 이어집니다</h2>
              <p className="mt-1 text-[12px] leading-5 text-[#848e9c]">
                이 화면에서 종목을 고르고 흐름을 확인한 뒤, 로그인하면 같은 화면에서 바로 포인트 거래와 포지션 관리가 가능합니다.
              </p>
            </div>
            <Link
              href="/market/auth"
              className="inline-flex h-10 items-center justify-center rounded-[4px] border border-[rgba(51,102,255,0.22)] bg-[rgba(51,102,255,0.1)] px-4 text-[12px] font-medium text-[#d1d4dc] transition hover:bg-[rgba(51,102,255,0.16)]"
            >
              로그인 후 주문하기
            </Link>
          </div>
        </MarketPanel>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
        <div className="space-y-4">
          <MarketPanel className="px-4 py-4">
            <h2 className="text-[14px] font-semibold leading-5 text-[#d1d4dc]">후보 탐색 필터</h2>
            <p className="mt-2 text-[12px] leading-5 text-[#848e9c]">스크리너 기능을 이 화면으로 통합했습니다. 조건을 좁힌 뒤 바로 실행으로 이어갈 수 있습니다.</p>
          </MarketPanel>

          <MarketPanel className="px-4 py-4">
            <h3 className="text-[13px] font-semibold leading-5 text-[#d1d4dc]">카테고리</h3>
            <div className="mt-3 space-y-2">
              {categoryFilters.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setSelectedFilter(filter.key)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-[4px] border px-3 py-2 text-[12px] font-medium transition",
                    selectedFilter === filter.key
                      ? "border-[#3366ff] bg-[rgba(51,102,255,0.12)] text-[#d1d4dc]"
                      : "border-[#2b2f36] bg-[#161b24] text-[#848e9c] hover:text-[#d1d4dc]",
                  )}
                >
                  <span>{filter.label}</span>
                  <span className="text-[10px] text-[#848e9c]">{formatInteger(filter.count)}</span>
                </button>
              ))}
            </div>
          </MarketPanel>

          <MarketPanel className="px-4 py-4">
            <h3 className="text-[13px] font-semibold leading-5 text-[#d1d4dc]">점수 범위</h3>
            <div className="mt-3 grid grid-cols-[1fr_12px_1fr] items-center gap-2">
              <input
                value={scoreMin}
                min={0}
                max={scoreMax}
                type="number"
                onChange={(event) => setScoreMin(Number(event.target.value))}
                className="h-9 rounded-[4px] border border-[#2b2f36] bg-[#161b24] px-3 text-[13px] text-[#d1d4dc] outline-none"
              />
              <span className="text-center text-[12px] text-[#848e9c]">~</span>
              <input
                value={scoreMax}
                min={scoreMin}
                max={100}
                type="number"
                onChange={(event) => setScoreMax(Number(event.target.value))}
                className="h-9 rounded-[4px] border border-[#2b2f36] bg-[#161b24] px-3 text-[13px] text-[#d1d4dc] outline-none"
              />
            </div>
          </MarketPanel>

          <MarketPanel className="px-4 py-4">
            <h3 className="text-[13px] font-semibold leading-5 text-[#d1d4dc]">변동률 범위 (%)</h3>
            <div className="mt-3 grid grid-cols-[1fr_12px_1fr] items-center gap-2">
              <input
                value={volatilityMin}
                min={-10}
                max={volatilityMax}
                type="number"
                onChange={(event) => setVolatilityMin(Number(event.target.value))}
                className="h-9 rounded-[4px] border border-[#2b2f36] bg-[#161b24] px-3 text-[13px] text-[#d1d4dc] outline-none"
              />
              <span className="text-center text-[12px] text-[#848e9c]">~</span>
              <input
                value={volatilityMax}
                min={volatilityMin}
                max={10}
                type="number"
                onChange={(event) => setVolatilityMax(Number(event.target.value))}
                className="h-9 rounded-[4px] border border-[#2b2f36] bg-[#161b24] px-3 text-[13px] text-[#d1d4dc] outline-none"
              />
            </div>
          </MarketPanel>

          <MarketPanel className="px-4 py-4">
            <h3 className="text-[13px] font-semibold leading-5 text-[#d1d4dc]">기타 옵션</h3>
            <button
              type="button"
              onClick={() => setFavoritesOnly((current) => !current)}
              className={cn(
                "mt-3 inline-flex h-9 items-center rounded-[4px] border px-3 text-[12px] font-medium transition",
                favoritesOnly
                  ? "border-[#3366ff] bg-[rgba(51,102,255,0.12)] text-[#d1d4dc]"
                  : "border-[#2b2f36] bg-[#161b24] text-[#848e9c]",
              )}
            >
              즐겨찾기만 보기
            </button>
          </MarketPanel>
        </div>

        <MarketPanel className="p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-[16px] font-semibold leading-6 text-[#d1d4dc]">실시간 종목 보드</h2>
              <p className="mt-1 text-[12px] leading-5 text-[#848e9c]">
                탐색 조건으로 후보를 좁힌 뒤, 로그인 상태라면 같은 화면에서 바로 상세와 주문 흐름으로 이어갈 수 있습니다.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="프로젝트 검색"
                className="h-10 rounded-[4px] border border-[#2b2f36] bg-[#161b24] px-3 text-[13px] text-[#d1d4dc] outline-none placeholder:text-[#697586]"
              />
              <div className="inline-flex h-10 items-center rounded-[4px] border border-[#2b2f36] bg-[#161b24] px-3 text-[12px] text-[#848e9c]">
                결과 {formatInteger(filteredQuotes.length)}개
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
                  <th className="px-3 py-3">즐겨찾기</th>
                  <th className="px-3 py-3">내 수량</th>
                  <th className="px-3 py-3 text-right">이동</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-8 text-center text-[#848e9c]">
                      트레이딩 보드를 불러오는 중입니다.
                    </td>
                  </tr>
                ) : filteredQuotes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-8 text-center text-[#848e9c]">
                      조건에 맞는 종목이 없습니다.
                    </td>
                  </tr>
                ) : (
                  pagedQuotes.map((quote) => (
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
                      <td className="px-3 py-4">
                        <button
                          type="button"
                          onClick={() => toggleFavorite(quote.slug)}
                          className={cn(
                            "inline-flex h-7 items-center rounded-[4px] border px-2 text-[11px] transition",
                            favorites.includes(quote.slug)
                              ? "border-[#f0b90b] bg-[rgba(240,185,11,0.12)] text-[#f0b90b]"
                              : "border-[#2b2f36] bg-[#161b24] text-[#848e9c]",
                          )}
                        >
                          {favorites.includes(quote.slug) ? "★" : "☆"}
                        </button>
                      </td>
                      <td className="px-3 py-4">{formatInteger(positionsBySlug.get(quote.slug) ?? 0)}</td>
                      <td className="px-3 py-4 text-right">
                        <Link
                          href={`/market/trading/${quote.slug}`}
                          className="inline-flex h-8 items-center rounded-[4px] border border-[rgba(51,102,255,0.22)] bg-[rgba(51,102,255,0.1)] px-3 text-[12px] font-medium text-[#d1d4dc] transition hover:bg-[rgba(51,102,255,0.16)]"
                        >
                          {session ? "거래하기" : "상세 보기"}
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && filteredQuotes.length > PAGE_SIZE ? (
            <div className="mt-4 flex flex-col gap-3 border-t border-[#2b2f36] pt-4 lg:flex-row lg:items-center lg:justify-between">
              <p className="text-[12px] text-[#848e9c]">
                총 {formatInteger(filteredQuotes.length)}개 중 {(currentPage - 1) * PAGE_SIZE + 1}-
                {formatInteger(Math.min(currentPage * PAGE_SIZE, filteredQuotes.length))}번째 종목을 보는 중입니다.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className={cn(
                    "inline-flex h-9 items-center rounded-[4px] border px-3 text-[12px] font-medium transition",
                    currentPage === 1
                      ? "cursor-not-allowed border-[#232833] bg-[#131821] text-[#556070]"
                      : "border-[#2b2f36] bg-[#161b24] text-[#d1d4dc] hover:border-[#3a4250]",
                  )}
                >
                  이전 50개
                </button>
                <div className="inline-flex h-9 items-center rounded-[4px] border border-[#2b2f36] bg-[#11161f] px-3 text-[12px] text-[#d1d4dc]">
                  {formatInteger(currentPage)} / {formatInteger(pageCount)} 페이지
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
                  disabled={currentPage === pageCount}
                  className={cn(
                    "inline-flex h-9 items-center rounded-[4px] border px-3 text-[12px] font-medium transition",
                    currentPage === pageCount
                      ? "cursor-not-allowed border-[#232833] bg-[#131821] text-[#556070]"
                      : "border-[rgba(51,102,255,0.22)] bg-[rgba(51,102,255,0.1)] text-[#d1d4dc] hover:bg-[rgba(51,102,255,0.16)]",
                  )}
                >
                  다음 50개
                </button>
              </div>
            </div>
          ) : null}
        </MarketPanel>
      </div>
    </div>
  );
}
