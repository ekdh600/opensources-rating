"use client";

import { useEffect, useState } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { MarketLoginRequired } from "@/components/market/MarketLoginRequired";
import { MarketPageIntro, MarketPanel } from "@/components/market/MarketUi";
import { api } from "@/lib/api";
import { clearTradingSession, useTradingSessionState } from "@/lib/trading-session";

type Me = {
  id: number;
  username: string;
  display_name: string;
  points_balance: number;
  level: number;
  experience: number;
  reputation_score: number;
  foresight_score: number;
  total_predictions: number;
  total_hits: number;
  current_streak: number;
  best_streak: number;
  level_title_ko: string;
};

type Portfolio = {
  total_equity: number;
  positions: Array<{ project_slug: string; quantity: number }>;
};

function formatInteger(value: number) {
  return value.toLocaleString("ko-KR");
}

export function FigmaMarketAccountPage() {
  const router = useRouter();
  const { session, hydrated } = useTradingSessionState();
  const [profile, setProfile] = useState<Me | null>(null);
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
        const [me, portfolioData] = await Promise.all([
          api.auth.me(session.accessToken),
          api.trading.portfolio(session.accessToken),
        ]);
        if (!cancelled) {
          setProfile(me);
          setPortfolio(portfolioData);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "계정 정보를 불러오지 못했습니다.");
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
      <MarketPanel className="mx-auto max-w-[680px] p-6">
        <p className="text-[13px] text-[#848e9c]">계정 정보를 준비하는 중입니다.</p>
      </MarketPanel>
    );
  }

  if (!session) {
    return (
      <MarketLoginRequired
        title="마이페이지는 로그인 후 이용할 수 있습니다"
        body="프로필, 포인트, 개인 포지션은 로그인한 계정 기준으로만 표시됩니다."
      />
    );
  }

  return (
    <div className="space-y-6">
      <MarketPageIntro
        eyebrow="Account"
        title="마이페이지"
        description="로그인한 계정의 프로필, 포인트, 시즌 활동, 보유 포지션을 확인할 수 있습니다."
        stats={[
          { label: "사용자", value: session.username, note: "현재 로그인한 개인 계정" },
          {
            label: "포인트",
            value: profile ? `${formatInteger(profile.points_balance)}p` : "-",
            note: portfolio ? `총 자산 ${formatInteger(portfolio.total_equity)}p` : "계정 정보 조회 중",
          },
          {
            label: "레벨",
            value: profile ? `Lv.${profile.level}` : "-",
            note: profile?.level_title_ko || "프로필 조회 중",
          },
          {
            label: "보유 포지션",
            value: formatInteger(portfolio?.positions.length ?? 0),
            note: profile ? `총 예측 ${formatInteger(profile.total_predictions)}회` : "시즌 활동 집계 중",
          },
        ]}
      />

      {error ? (
        <MarketPanel className="p-4">
          <div className="rounded-[6px] border border-[rgba(214,88,58,0.28)] bg-[rgba(214,88,58,0.1)] px-4 py-3 text-[13px] text-[#ffd7cf]">
            {error}
          </div>
        </MarketPanel>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <MarketPanel className="p-5">
          <h2 className="text-[18px] font-semibold text-[#d1d4dc]">프로필 요약</h2>
          {loading ? (
            <p className="mt-4 text-[13px] text-[#848e9c]">계정 정보를 불러오는 중입니다.</p>
          ) : profile ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { label: "아이디", value: profile.username },
                { label: "표시 이름", value: profile.display_name },
                { label: "명성 점수", value: profile.reputation_score.toFixed(1) },
                { label: "선구안 점수", value: profile.foresight_score.toFixed(1) },
                { label: "연속 적중", value: `${formatInteger(profile.current_streak)}회` },
                { label: "최고 연속 적중", value: `${formatInteger(profile.best_streak)}회` },
              ].map((item) => (
                <article key={item.label} className="rounded-[6px] border border-[#2b2f36] bg-[#161b24] px-4 py-4">
                  <p className="text-[10px] uppercase tracking-[0.8px] text-[#848e9c]">{item.label}</p>
                  <p className="mt-2 text-[18px] font-semibold text-[#d1d4dc]">{item.value}</p>
                </article>
              ))}
            </div>
          ) : null}
        </MarketPanel>

        <MarketPanel className="p-5">
          <h2 className="text-[18px] font-semibold text-[#d1d4dc]">계정 액션</h2>
          <div className="mt-4 grid gap-3">
            <Link
              href="/market/my-positions"
              className="inline-flex h-11 items-center justify-center rounded-[4px] border border-[rgba(51,102,255,0.22)] bg-[rgba(51,102,255,0.1)] px-3 text-[13px] font-medium text-[#d1d4dc] transition hover:bg-[rgba(51,102,255,0.16)]"
            >
              개인 포지션 보기
            </Link>
            <Link
              href="/market/trading"
              className="inline-flex h-11 items-center justify-center rounded-[4px] border border-[#2b2f36] bg-[#161b24] px-3 text-[13px] font-medium text-[#d1d4dc] transition hover:border-[#3a4252]"
            >
              트레이딩 보드 이동
            </Link>
            <button
              type="button"
              onClick={() => {
                clearTradingSession();
                router.push("/market/auth");
                router.refresh();
              }}
              className="inline-flex h-11 items-center justify-center rounded-[4px] border border-[#2b2f36] bg-[#161b24] px-3 text-[13px] font-medium text-[#d1d4dc] transition hover:border-[#3a4252]"
            >
              로그아웃
            </button>
          </div>
        </MarketPanel>
      </div>
    </div>
  );
}
