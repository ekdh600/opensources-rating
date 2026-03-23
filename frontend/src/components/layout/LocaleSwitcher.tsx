"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggle = () => {
    const next = locale === "ko" ? "en" : "ko";
    router.replace(pathname, { locale: next });
  };

  return (
    <button
      onClick={toggle}
      className="rounded-pill border border-line bg-white/70 px-3 py-1.5 text-sm font-medium text-ink transition hover:border-brand/30 hover:bg-brand-soft hover:text-brand-strong"
    >
      {locale === "ko" ? "EN" : "한국어"}
    </button>
  );
}
