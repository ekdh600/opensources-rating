"use client";

import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/routing";

export function Footer() {
  const locale = useLocale();
  const pathname = usePathname();

  if (
    pathname === "/" ||
    pathname === "" ||
    pathname === "/rising" ||
    pathname === "/categories" ||
    pathname === "/scoring" ||
    pathname === "/market" ||
    pathname.startsWith("/market/")
  ) {
    return null;
  }

  const copy =
    locale === "ko"
      ? {
          title: "OSS 리더보드",
          description:
            "한국어 우선 오픈소스 프로젝트 관측 플랫폼. 다양한 지표를 통해 프로젝트의 현재 상태를 읽기 쉬운 형태로 정리합니다.",
          sources: "GitHub API · CNCF DevStats · OSS Insight · deps.dev",
        }
      : {
          title: "OSS Leaderboard",
          description:
            "A Korean-first observability platform for open source projects, built around readable multi-signal scoring.",
          sources: "GitHub API · CNCF DevStats · OSS Insight · deps.dev",
        };

  return (
    <footer className="border-t border-[#2d3548] bg-[#0a0e17] py-8">
      <div className="mx-auto max-w-[1440px] px-4 md:px-6">
        <div className="oss-panel flex flex-col gap-4 px-5 py-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-figma-display text-[24px] leading-none tracking-[-0.4px] text-[#6b9bd1]">{copy.title}</p>
            <p className="font-figma-body mt-3 max-w-2xl text-sm leading-6 text-[#64748b]">{copy.description}</p>
          </div>
          <div className="space-y-2 text-sm text-[#64748b] md:text-right">
            <p className="font-figma-mono text-[11px] uppercase tracking-[0.6px]">{copy.sources}</p>
            <p className="font-figma-mono text-[11px] uppercase tracking-[0.6px]">© 2026 OSS Leaderboard</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
