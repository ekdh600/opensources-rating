"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";

type MarketLocale = "ko" | "en";

const NAV_ITEMS = [
  { key: "market", href: "/market", label: { ko: "시장", en: "Market" } },
  { key: "trading", href: "/market/trading", label: { ko: "트레이딩", en: "Trading" } },
  { key: "analysis", href: "/market/analysis", label: { ko: "분석", en: "Analysis" } },
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
      <path
        d="M4 10.5L6.5 8L8.5 10L12 6.5"
        stroke="#ffffff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.2"
      />
      <circle cx="4" cy="10.5" fill="#ffffff" r="1" />
      <circle cx="6.5" cy="8" fill="#ffffff" r="1" />
      <circle cx="8.5" cy="10" fill="#ffffff" r="1" />
      <circle cx="12" cy="6.5" fill="#ffffff" r="1" />
    </svg>
  );
}

function MarketIcon() {
  return (
    <svg aria-hidden="true" className="h-[14px] w-[14px]" fill="none" viewBox="0 0 14 14">
      <path
        d="M2 9.8L5 6.8L7 8L11.5 3.6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function PortfolioIcon() {
  return (
    <svg aria-hidden="true" className="h-[14px] w-[14px]" fill="none" viewBox="0 0 14 14">
      <rect height="7.5" rx="1.2" stroke="currentColor" strokeWidth="1.2" width="10" x="2" y="3.25" />
      <path
        d="M5 3.25V2.2C5 1.76 5.36 1.4 5.8 1.4H8.2C8.64 1.4 9 1.76 9 2.2V3.25"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function AnalysisIcon() {
  return (
    <svg aria-hidden="true" className="h-[14px] w-[14px]" fill="none" viewBox="0 0 14 14">
      <path d="M2.4 11V3.2H11.6V11" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4.6 8.6L6.2 6.8L7.7 7.7L9.8 5.4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
    </svg>
  );
}

function ScreenerIcon() {
  return (
    <svg aria-hidden="true" className="h-[14px] w-[14px]" fill="none" viewBox="0 0 14 14">
      <path d="M2.5 3.2H11.5L8.3 6.8V10.2L5.7 11.4V6.8L2.5 3.2Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.2" />
    </svg>
  );
}

function TradingIcon() {
  return (
    <svg aria-hidden="true" className="h-[14px] w-[14px]" fill="none" viewBox="0 0 14 14">
      <path d="M2.25 10.5H11.75" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
      <path d="M4 10.5V6.75" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
      <path d="M7 10.5V3.75" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
      <path d="M10 10.5V5.25" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
    </svg>
  );
}

function RankingIcon() {
  return (
    <svg aria-hidden="true" className="h-[14px] w-[14px]" fill="none" viewBox="0 0 14 14">
      <path d="M2.5 10.75H11.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
      <path d="M4.25 9.25V5.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
      <path d="M7 9.25V3.75" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
      <path d="M9.75 9.25V6.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
    </svg>
  );
}

function BadgeIcon() {
  return (
    <svg aria-hidden="true" className="h-[14px] w-[14px]" fill="none" viewBox="0 0 14 14">
      <path
        d="M4 2.5H10V5.5C10 7.16 8.66 8.5 7 8.5C5.34 8.5 4 7.16 4 5.5V2.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M5.5 8.5L4.75 11.5L7 10.45L9.25 11.5L8.5 8.5"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function DesignIcon() {
  return (
    <svg aria-hidden="true" className="h-[14px] w-[14px]" fill="none" viewBox="0 0 14 14">
      <path d="M4 3.75H10.25V10H4V3.75Z" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2.4 6.85H11.6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
      <path d="M6.9 2.4V11.6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
    </svg>
  );
}

function navIcon(key: (typeof NAV_ITEMS)[number]["key"]) {
  if (key === "market") return <MarketIcon />;
  if (key === "trading") return <TradingIcon />;
  if (key === "analysis") return <AnalysisIcon />;
  if (key === "screener") return <ScreenerIcon />;
  if (key === "portfolio") return <PortfolioIcon />;
  if (key === "ranking") return <RankingIcon />;
  if (key === "badges") return <BadgeIcon />;
  return <DesignIcon />;
}

function copy(locale: MarketLocale) {
  return {
    season: "Season 2024-Q1",
    footerLine1:
      locale === "ko"
        ? "© 2026 OSS Market. 이 서비스는 실제 금융 거래 플랫폼이 아닙니다."
        : "© 2026 OSS Market. This is not a real financial trading platform.",
    footerLine2:
      locale === "ko"
        ? "오픈소스 프로젝트 데이터를 시장 메타포로 해석한 분석 도구입니다."
        : "An analytical tool interpreting open source project data through a market metaphor.",
    updated:
      locale === "ko"
        ? "데이터 업데이트: 2026.03.22 09:00 KST"
        : "Data updated: 2026.03.22 09:00 KST",
    designVersion: "Design System v1.0",
  };
}

export function MarketHeader() {
  const locale = (useLocale() === "ko" ? "ko" : "en") as MarketLocale;
  const pathname = usePathname();
  const text = copy(locale);

  return (
    <header className="border-b border-[#2b2f36] bg-[#1e2026]">
      <div className="mx-auto flex h-14 w-full max-w-[1232px] items-center justify-between gap-4 px-4 sm:px-6 xl:px-0">
        <div className="flex min-w-0 items-center gap-6">
          <Link href="/market" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-[rgba(51,102,255,0.1)]">
              <BrandIcon />
            </div>
            <span className="truncate font-figma-body text-[14px] font-bold leading-5 text-[#d1d4dc]">
              OSS Market
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex h-7 items-center gap-2 rounded-[4px] px-3 text-[12px] font-medium leading-4 transition ${
                    active
                      ? "bg-[rgba(51,102,255,0.1)] text-[#3366ff]"
                      : "text-[#848e9c] hover:bg-[rgba(43,47,54,0.42)] hover:text-[#d1d4dc]"
                  }`}
                >
                  {navIcon(item.key)}
                  <span>{item.label[locale]}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <span className="hidden text-[10px] leading-[15px] text-[#848e9c] md:inline">{text.season}</span>
      </div>

      <nav className="mx-auto flex w-full max-w-[1232px] items-center gap-1 overflow-x-auto px-4 pb-3 md:hidden sm:px-6 xl:px-0">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex h-7 shrink-0 items-center gap-2 rounded-[4px] px-3 text-[12px] font-medium leading-4 transition ${
                active
                  ? "bg-[rgba(51,102,255,0.1)] text-[#3366ff]"
                  : "text-[#848e9c] hover:bg-[rgba(43,47,54,0.42)] hover:text-[#d1d4dc]"
              }`}
            >
              {navIcon(item.key)}
              <span>{item.label[locale]}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

export function MarketFooter() {
  const locale = (useLocale() === "ko" ? "ko" : "en") as MarketLocale;
  const pathname = usePathname();
  const text = copy(locale);
  const metaLabel = pathname.startsWith("/market/design") ? text.designVersion : text.updated;

  return (
    <footer className="border-t border-[#2b2f36] bg-[#181c21]">
      <div className="mx-auto flex w-full max-w-[1232px] flex-col gap-3 px-4 py-[21px] text-[10px] leading-[15px] text-[#848e9c] sm:px-6 md:flex-row md:items-end md:justify-between xl:px-0">
        <div className="space-y-0.5">
          <p>{text.footerLine1}</p>
          <p>{text.footerLine2}</p>
        </div>
        <p className="text-[9px] leading-[13.5px]">{metaLabel}</p>
      </div>
    </footer>
  );
}
