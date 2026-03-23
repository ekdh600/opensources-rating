"use client";

import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { BadgeInfo, UserBadgeInfo } from "@/types";

const RARITY_STYLES = {
  common: "border-[#2b2f36] bg-[#1e2026] text-[#848e9c]",
  rare: "border-[rgba(51,102,255,0.24)] bg-[rgba(51,102,255,0.08)] text-[#3366ff]",
  epic: "border-[rgba(168,85,247,0.24)] bg-[rgba(168,85,247,0.08)] text-[#a855f7]",
  legendary: "border-[rgba(240,185,11,0.24)] bg-[rgba(240,185,11,0.08)] text-[#f0b90b]",
};

const RARITY_LABELS = {
  common: { ko: "일반", en: "Common" },
  rare: { ko: "희귀", en: "Rare" },
  epic: { ko: "에픽", en: "Epic" },
  legendary: { ko: "전설", en: "Legendary" },
};

export function BadgeCard({
  badge,
  seasonName,
}: {
  badge: BadgeInfo;
  seasonName?: string | null;
  awarded?: string;
}) {
  const locale = useLocale();
  const style =
    RARITY_STYLES[badge.rarity as keyof typeof RARITY_STYLES] || RARITY_STYLES.common;
  const rarityLabel =
    RARITY_LABELS[badge.rarity as keyof typeof RARITY_LABELS] || RARITY_LABELS.common;

  return (
    <div className={cn("rounded-[4px] border p-5 transition hover:border-[#4b5262]", style)}>
      <div className="text-4xl">{badge.icon}</div>
      <h4 className="mt-4 text-base font-semibold text-[#d1d4dc]">
        {locale === "ko" ? badge.name_ko : badge.name_en}
      </h4>
      <p className="mt-2 text-sm leading-6 text-[#848e9c]">
        {locale === "ko" ? badge.description_ko : badge.description_en}
      </p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span className="rounded-[4px] border border-[#2b2f36] bg-[rgba(43,47,54,0.42)] px-2.5 py-1 text-[#d1d4dc]">
          {locale === "ko" ? rarityLabel.ko : rarityLabel.en}
        </span>
        {seasonName ? (
          <span className="rounded-[4px] border border-[#2b2f36] bg-[rgba(43,47,54,0.42)] px-2.5 py-1 text-[#d1d4dc]">
            {seasonName}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function BadgeGrid({ badges }: { badges: UserBadgeInfo[] }) {
  const t = useTranslations("market");

  if (badges.length === 0) {
    return (
      <div className="rounded-[4px] border border-dashed border-[#2b2f36] bg-[#1e2026] p-8 text-center text-[#848e9c]">
        {t("noBadges")}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {badges.map((badgeInfo, index) => (
        <BadgeCard
          key={`${badgeInfo.badge.slug}-${index}`}
          badge={badgeInfo.badge}
          seasonName={badgeInfo.season_name}
          awarded={badgeInfo.awarded_at}
        />
      ))}
    </div>
  );
}
