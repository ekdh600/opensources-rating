"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";

const MAIN_NAV_ITEMS = [{ key: "market", href: "/market" }] as const;

type NavKey = (typeof MAIN_NAV_ITEMS)[number]["key"];

const COPY = {
  ko: {
    brand: "OSS LEADERBOARD",
    search: "검색",
    nav: {
      market: "예측 시장",
    },
  },
  en: {
    brand: "OSS LEADERBOARD",
    search: "Search",
    nav: {
      market: "Prediction Market",
    },
  },
} as const;

function isActive(pathname: string, href: string) {
  return pathname.startsWith(href);
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" className="h-[14px] w-[14px]" fill="none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M10.5 10.5L14 14" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
    </svg>
  );
}

export function Header() {
  const locale = useLocale();
  const pathname = usePathname();
  const copy = COPY[locale === "ko" ? "ko" : "en"];
  const home = pathname === "/" || pathname === "";

  if (pathname === "/market" || pathname.startsWith("/market/")) {
    return null;
  }

  const renderLink = (key: NavKey, href: string) => {
    const active = isActive(pathname, href);
    const textColor = active ? "text-[#a2c89d]" : "text-[#87af87]";

    return (
      <Link
        key={key}
        href={href}
        className={`font-figma-mono inline-flex items-center gap-[6px] whitespace-nowrap text-[12px] leading-4 tracking-[0.6px] uppercase transition hover:text-[#b8d8b2] ${textColor}`}
      >
        {copy.nav[key]}
        <span className="inline-flex h-4 items-center rounded-[4px] bg-[rgba(135,175,135,0.2)] px-[6px] text-[10px] leading-[13.333px] tracking-[0.6px] text-[#87af87]">
          BETA
        </span>
      </Link>
    );
  };

  return (
    <header
      className={`z-50 border-b border-[#2d3548] bg-[rgba(18,22,31,0.8)] ${
        home ? "" : "sticky top-0 backdrop-blur-xl"
      }`}
    >
      <div className="mx-auto max-w-[1440px] px-4 md:px-6">
        <div className="flex min-h-[56px] flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between lg:py-0">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-8">
            <div className="flex items-center gap-[32px]">
              <Link href="/market" className="flex items-center gap-[10px]">
                <div className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-[#6b9bd1] text-[#0a0e17] shadow-[0_0_20px_rgba(107,155,209,0.2)]">
                  <span className="font-figma-display text-[18px] leading-[18px]">O</span>
                </div>
                <span className="font-figma-display text-[16px] leading-6 tracking-[-0.4px] text-[#6b9bd1]">
                  {copy.brand}
                </span>
              </Link>

              <nav className="hidden items-center gap-6 lg:flex">
                {MAIN_NAV_ITEMS.map(({ key, href }) => renderLink(key, href))}
              </nav>
            </div>

            <nav className="flex items-center gap-5 overflow-x-auto pb-1 lg:hidden lg:pb-0">
              {MAIN_NAV_ITEMS.map(({ key, href }) => renderLink(key, href))}
            </nav>
          </div>

          <button
            type="button"
            className="inline-flex h-8 w-[73px] items-center gap-2 rounded-[4px] border border-[#2d3548] bg-[#12161f] px-[13px] text-[#64748b] transition hover:text-[#cbd5e1]"
          >
            <SearchIcon />
            <span className="font-figma-mono text-[12px] leading-4 tracking-[0.6px] uppercase">{copy.search}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
