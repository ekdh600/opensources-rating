"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";

const ITEMS = [
  { key: "seasonRanking", href: "/market/season" },
  { key: "topPredictors", href: "/market/top-predictors" },
  { key: "myPositions", href: "/market/my-positions" },
  { key: "badges", href: "/market/badges" },
] as const;

export function MarketSubnav() {
  const t = useTranslations("market");
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-2">
      {ITEMS.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`inline-flex h-8 items-center rounded-[4px] border px-3 text-[12px] font-medium leading-4 transition ${
              active
                ? "border-[rgba(51,102,255,0.16)] bg-[rgba(51,102,255,0.1)] text-[#3366ff]"
                : "border-[#2b2f36] bg-[rgba(43,47,54,0.42)] text-[#848e9c] hover:border-[#3a4050] hover:text-[#d1d4dc]"
            }`}
          >
            {t(item.key)}
          </Link>
        );
      })}
    </div>
  );
}
