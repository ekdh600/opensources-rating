"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { clearTradingSession, useTradingSessionState } from "@/lib/trading-session";

type MarketLocale = "ko" | "en";

const NAV_ITEMS = [
  { key: "market", href: "/market", label: { ko: "시장", en: "Market" } },
  { key: "trading", href: "/market/trading", label: { ko: "트레이딩", en: "Trading" } },
  { key: "analysis", href: "/market/analysis", label: { ko: "분석", en: "Analysis" } },
  { key: "methodology", href: "/market/methodology", label: { ko: "계산 방식", en: "Methodology" } },
  { key: "screener", href: "/market/screener", label: { ko: "스크리너", en: "Screener" } },
  { key: "portfolio", href: "/market/my-positions", label: { ko: "포트폴리오", en: "Portfolio" } },
  { key: "ranking", href: "/market/season", label: { ko: "랭킹", en: "Ranking" } },
  { key: "badges", href: "/market/badges", label: { ko: "뱃지", en: "Badges" } },
  { key: "design", href: "/market/design", label: { ko: "디자인", en: "Design" } },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/market" ? pathname === href : pathname.startsWith(href);
}

function BrandIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
      <rect fill="#3366ff" height="16" rx="3" width="16" />
      <path d="M4 10.5L6.5 8L8.5 10L12 6.5" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
      <circle cx="4" cy="10.5" fill="#ffffff" r="1" />
      <circle cx="6.5" cy="8" fill="#ffffff" r="1" />
      <circle cx="8.5" cy="10" fill="#ffffff" r="1" />
      <circle cx="12" cy="6.5" fill="#ffffff" r="1" />
    </svg>
  );
}

function NavIcon({ kind }: { kind: string }) {
  if (kind === "market") {
    return (
      <svg aria-hidden="true" className="h-[14px] w-[14px]" fill="none" viewBox="0 0 14 14">
        <path d="M2 9.8L5 6.8L7 8L11.5 3.6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
      </svg>
    );
  }
  if (kind === "trading" || kind === "ranking") {
    return (
      <svg aria-hidden="true" className="h-[14px] w-[14px]" fill="none" viewBox="0 0 14 14">
        <path d="M2.25 10.5H11.75" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
        <path d="M4 10.5V6.75" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
        <path d="M7 10.5V3.75" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
        <path d="M10 10.5V5.25" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
      </svg>
    );
  }
  if (kind === "portfolio") {
    return (
      <svg aria-hidden="true" className="h-[14px] w-[14px]" fill="none" viewBox="0 0 14 14">
        <rect height="7.5" rx="1.2" stroke="currentColor" strokeWidth="1.2" width="10" x="2" y="3.25" />
        <path d="M5 3.25V2.2C5 1.76 5.36 1.4 5.8 1.4H8.2C8.64 1.4 9 1.76 9 2.2V3.25" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    );
  }
  if (kind === "methodology") {
    return (
      <svg aria-hidden="true" className="h-[14px] w-[14px]" fill="none" viewBox="0 0 14 14">
        <circle cx="7" cy="7" r="4.8" stroke="currentColor" strokeWidth="1.2" />
        <path d="M7 5.15V7.25" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
        <circle cx="7" cy="9.55" fill="currentColor" r="0.7" />
      </svg>
    );
  }
  if (kind === "badges") {
    return (
      <svg aria-hidden="true" className="h-[14px] w-[14px]" fill="none" viewBox="0 0 14 14">
        <path d="M4 2.5H10V5.5C10 7.16 8.66 8.5 7 8.5C5.34 8.5 4 7.16 4 5.5V2.5Z" stroke="currentColor" strokeWidth="1.2" />
        <path d="M5.5 8.5L4.75 11.5L7 10.45L9.25 11.5L8.5 8.5" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.2" />
      </svg>
    );
  }
  if (kind === "design") {
    return (
      <svg aria-hidden="true" className="h-[14px] w-[14px]" fill="none" viewBox="0 0 14 14">
        <path d="M4 3.75H10.25V10H4V3.75Z" stroke="currentColor" strokeWidth="1.2" />
        <path d="M2.4 6.85H11.6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
        <path d="M6.9 2.4V11.6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" className="h-[14px] w-[14px]" fill="none" viewBox="0 0 14 14">
      <path d="M2.4 11V3.2H11.6V11" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4.6 8.6L6.2 6.8L7.7 7.7L9.8 5.4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
    </svg>
  );
}

export function MarketHeader() {
  const locale = (useLocale() === "ko" ? "ko" : "en") as MarketLocale;
  const pathname = usePathname();
  const { session, hydrated } = useTradingSessionState();
  const actionLabel = session ? (locale === "ko" ? "마이페이지" : "My Page") : (locale === "ko" ? "로그인" : "Login");
  const actionHref = session ? "/market/account" : "/market/auth";

  return (
    <header className="border-b border-[#2b2f36] bg-[#1e2026]">
      <div className="mx-auto flex h-14 w-full max-w-[1680px] items-center justify-between gap-4 px-4 sm:px-6 2xl:px-8">
        <div className="flex min-w-0 items-center gap-6">
          <Link href="/market" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-[rgba(51,102,255,0.1)]">
              <BrandIcon />
            </div>
            <span className="truncate text-[14px] font-bold leading-5 text-[#d1d4dc]">OSS Market</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex h-7 items-center gap-2 rounded-[4px] px-3 text-[12px] font-medium leading-4 transition ${
                    active ? "bg-[rgba(51,102,255,0.1)] text-[#3366ff]" : "text-[#848e9c] hover:bg-[rgba(43,47,54,0.42)] hover:text-[#d1d4dc]"
                  }`}
                >
                  <NavIcon kind={item.key} />
                  <span>{item.label[locale]}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <span className="text-[10px] leading-[15px] text-[#848e9c]">Season 2026-Q1</span>
          <Link
            href={hydrated ? actionHref : "/market/auth"}
            className="inline-flex h-8 items-center rounded-[4px] border border-[rgba(51,102,255,0.22)] bg-[rgba(51,102,255,0.1)] px-3 text-[12px] font-medium text-[#d1d4dc] transition hover:bg-[rgba(51,102,255,0.16)]"
          >
            {hydrated ? actionLabel : locale === "ko" ? "로그인" : "Login"}
          </Link>
          {hydrated && session ? (
            <button
              type="button"
              onClick={() => clearTradingSession()}
              className="inline-flex h-8 items-center rounded-[4px] border border-[#2b2f36] bg-[#161b24] px-3 text-[12px] font-medium text-[#d1d4dc] transition hover:border-[#3a4252]"
            >
              {locale === "ko" ? "로그아웃" : "Logout"}
            </button>
          ) : null}
        </div>
      </div>
      <nav className="mx-auto flex w-full max-w-[1680px] items-center gap-1 overflow-x-auto px-4 pb-3 md:hidden sm:px-6 2xl:px-8">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex h-7 shrink-0 items-center gap-2 rounded-[4px] px-3 text-[12px] font-medium leading-4 transition ${
                active ? "bg-[rgba(51,102,255,0.1)] text-[#3366ff]" : "text-[#848e9c] hover:bg-[rgba(43,47,54,0.42)] hover:text-[#d1d4dc]"
              }`}
            >
              <NavIcon kind={item.key} />
              <span>{item.label[locale]}</span>
            </Link>
          );
        })}
        <Link
          href={hydrated ? actionHref : "/market/auth"}
          className="inline-flex h-7 shrink-0 items-center rounded-[4px] border border-[rgba(51,102,255,0.22)] bg-[rgba(51,102,255,0.1)] px-3 text-[12px] font-medium leading-4 text-[#d1d4dc]"
        >
          {hydrated ? actionLabel : locale === "ko" ? "로그인" : "Login"}
        </Link>
        {hydrated && session ? (
          <button
            type="button"
            onClick={() => clearTradingSession()}
            className="inline-flex h-7 shrink-0 items-center rounded-[4px] border border-[#2b2f36] bg-[#161b24] px-3 text-[12px] font-medium leading-4 text-[#d1d4dc]"
          >
            {locale === "ko" ? "로그아웃" : "Logout"}
          </button>
        ) : null}
      </nav>
    </header>
  );
}

export function MarketFooter() {
  const pathname = usePathname();
  const metaLabel = pathname.startsWith("/market/design") ? "Design System v1.0" : "데이터 업데이트: 2026.03.24 09:30 KST";

  return (
    <footer className="border-t border-[#2b2f36] bg-[#181c21]">
      <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-3 px-4 py-[21px] text-[10px] leading-[15px] text-[#848e9c] sm:px-6 md:flex-row md:items-end md:justify-between 2xl:px-8">
        <div className="space-y-0.5">
          <p>© 2026 OSS Market. 이 서비스는 실제 금융 거래 플랫폼이 아닙니다.</p>
          <p>오픈소스 프로젝트 데이터를 시장 메타포로 해석한 분석 도구입니다.</p>
        </div>
        <p className="text-[9px] leading-[13.5px]">{metaLabel}</p>
      </div>
    </footer>
  );
}

export function MarketMethodologyNotice() {
  return (
    <section className="mx-auto mt-6 w-full max-w-[1680px] px-4 sm:px-6 2xl:px-8">
      <div className="rounded-[8px] border border-[#2b2f36] bg-[#161b24] px-5 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-[760px]">
            <p className="text-[10px] uppercase tracking-[0.8px] text-[#6f7c8f]">MARKET METHODOLOGY</p>
            <h2 className="mt-2 text-[20px] font-semibold leading-7 text-[#d1d4dc]">인덱스와 종목 점수는 이렇게 계산됩니다</h2>
            <p className="mt-2 text-[13px] leading-6 text-[#9aa4b2]">
              현재 시장 화면은 GitHub, CNCF, deps.dev 기반의 원천 지표를 정규화한 뒤 공정가와 인덱스를 계산하는 구조입니다.
            </p>
            <p className="mt-3 text-[13px] leading-6 text-[#c7d0da]">
              시장 메인의 인덱스는 종목 점수를 바구니로 묶어 가중 평균한 결과이며, 메인 차트는 선택한 인덱스의 시계열을 보여줍니다.
            </p>
          </div>
          <Link
            href="/market/methodology"
            className="inline-flex h-9 items-center rounded-[4px] border border-[rgba(51,102,255,0.22)] bg-[rgba(51,102,255,0.1)] px-3 text-[12px] font-medium text-[#d1d4dc] transition hover:bg-[rgba(51,102,255,0.16)]"
          >
            계산 방식 보기
          </Link>
        </div>
        <div className="mt-5 grid gap-3 lg:grid-cols-2 2xl:grid-cols-4">
          {[
            { title: "종목 점수 산식", body: "Attention 22% + Execution 23% + Health 18% + Trust 17% + Adoption 20%로 fairScore를 만들고, Momentum 기반 성장 배수를 곱해 fairPrice를 계산합니다." },
            { title: "원천 데이터", body: "GitHub stars, forks, contributors 추정치, release cadence, issue/PR 흐름, CNCF maturity, deps.dev 의존성·패키지 생태계 신호를 함께 사용합니다." },
            { title: "인덱스 계산 방식", body: "각 인덱스는 구성 종목 바구니를 만들고, 현재는 종목 score 기반 가중 평균으로 지수 값과 변동률을 계산합니다. weighting 타입은 추후 계산 분기용으로 확장 예정입니다." },
            { title: "갱신 주기", body: "스냅샷 갱신은 market refresh 스크립트로 수행되며, 현재 가격·인덱스는 스냅샷 갱신 시 재계산됩니다. 운영 기준 권장 주기는 일 단위입니다." },
          ].map((item) => (
            <article key={item.title} className="rounded-[6px] border border-[#222734] bg-[#10151d] px-4 py-4">
              <h3 className="text-[13px] font-semibold text-[#d1d4dc]">{item.title}</h3>
              <p className="mt-2 text-[12px] leading-6 text-[#8f9bad]">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
