"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/routing";
import { MarketLoginRequired } from "@/components/market/MarketLoginRequired";
import { MarketPageIntro, MarketPanel } from "@/components/market/MarketUi";
import { api } from "@/lib/api";
import { useTradingSessionState } from "@/lib/trading-session";
import { cn } from "@/lib/utils";

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

function formatInteger(value: number) {
  return value.toLocaleString("ko-KR");
}

function formatPrice(value: number) {
  return value.toLocaleString("ko-KR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function FigmaMarketPortfolioPage() {
  const { session, hydrated } = useTradingSessionState();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const data = await api.trading.portfolio(session.accessToken);
        if (!cancelled) setPortfolio(data);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "포트폴리오를 불러오지 못했습니다.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [session?.accessToken]);

  if (!hydrated) {
    return (
      <MarketPanel className="p-6">
        <p className="text-[13px] text-[#848e9c]">포트폴리오를 준비하는 중입니다.</p>
      </MarketPanel>
    );
  }

  if (!session) {
    return (
      <MarketLoginRequired
        title="개인 포지션은 로그인 후 확인할 수 있습니다"
        body="보유 종목, 평가 손익, 실현 손익은 로그인한 사용자 계정 기준으로만 표시됩니다."
      />
    );
  }

  const profitableCount = useMemo(
    () => (portfolio?.positions ?? []).filter((position) => position.unrealized_pnl_points >= 0).length,
    [portfolio],
  );

  return (
    <div className="space-y-6">
      <MarketPageIntro
        eyebrow="Portfolio"
        title="내 포트폴리오"
        description="로그인한 계정 기준으로 체결된 종목 보유 현황과 평가 손익을 보여줍니다."
        stats={[
          {
            label: "계정",
            value: session.username,
            note: "현재 로그인한 개인 계정",
          },
          {
            label: "현금 잔고",
            value: portfolio ? `${formatInteger(portfolio.cash_points)}p` : "-",
            note: portfolio ? `총 자산 ${formatInteger(portfolio.total_equity)}p` : "포트폴리오 조회 중",
          },
          {
            label: "보유 종목",
            value: formatInteger(portfolio?.positions.length ?? 0),
            note: `수익 중 ${formatInteger(profitableCount)}개`,
            accent: "text-[#14b8a6]",
          },
          {
            label: "평가 손익",
            value: portfolio ? `${portfolio.unrealized_pnl_points >= 0 ? "+" : ""}${formatInteger(portfolio.unrealized_pnl_points)}p` : "-",
            note: portfolio ? `실현 손익 ${formatInteger(portfolio.realized_pnl_points)}p` : "거래 내역 반영 중",
            accent: portfolio && portfolio.unrealized_pnl_points >= 0 ? "text-[#14b8a6]" : "text-[#d6583a]",
          },
        ]}
      />

      <MarketPanel className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-[16px] font-semibold leading-6 text-[#d1d4dc]">실제 보유 포지션</h2>
            <p className="mt-1 text-[12px] leading-5 text-[#848e9c]">
              시장가 주문으로 체결된 수량만 집계됩니다.
            </p>
          </div>
          <Link
            href="/market/trading"
            className="inline-flex h-9 items-center rounded-[4px] border border-[rgba(51,102,255,0.22)] bg-[rgba(51,102,255,0.1)] px-3 text-[12px] font-medium text-[#d1d4dc] transition hover:bg-[rgba(51,102,255,0.16)]"
          >
            트레이딩으로 이동
          </Link>
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
                <th className="px-3 py-3">수량</th>
                <th className="px-3 py-3">평균 단가</th>
                <th className="px-3 py-3">현재가</th>
                <th className="px-3 py-3">평가 금액</th>
                <th className="px-3 py-3">평가 손익</th>
                <th className="px-3 py-3 text-right">이동</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-[#848e9c]">
                    포트폴리오를 불러오는 중입니다.
                  </td>
                </tr>
              ) : (portfolio?.positions.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-[#848e9c]">
                    아직 체결된 포지션이 없습니다.
                  </td>
                </tr>
              ) : (
                portfolio?.positions.map((position) => (
                  <tr key={position.project_slug} className="border-b border-[rgba(43,47,54,0.55)]">
                    <td className="px-3 py-4 font-semibold">{position.project_name}</td>
                    <td className="px-3 py-4">{formatInteger(position.quantity)}</td>
                    <td className="px-3 py-4">{formatPrice(position.average_price)}</td>
                    <td className="px-3 py-4">{formatPrice(position.current_price)}</td>
                    <td className="px-3 py-4">{formatInteger(position.market_value)}p</td>
                    <td className={cn("px-3 py-4 font-medium", position.unrealized_pnl_points >= 0 ? "text-[#14b8a6]" : "text-[#d6583a]")}>
                      {position.unrealized_pnl_points >= 0 ? "+" : ""}
                      {formatInteger(position.unrealized_pnl_points)}p
                    </td>
                    <td className="px-3 py-4 text-right">
                      <Link
                        href={`/market/trading/${position.project_slug}`}
                        className="inline-flex h-8 items-center rounded-[4px] border border-[#2b2f36] bg-[#161b24] px-3 text-[12px] text-[#d1d4dc] transition hover:border-[#3a4252]"
                      >
                        상세
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
