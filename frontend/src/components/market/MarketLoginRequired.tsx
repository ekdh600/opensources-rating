"use client";

import { Link } from "@/i18n/routing";
import { MarketPanel } from "@/components/market/MarketUi";

export function MarketLoginRequired({
  title = "로그인이 필요합니다.",
  body = "이 기능은 개인 계정으로 로그인한 뒤 사용할 수 있습니다.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <MarketPanel className="mx-auto max-w-[680px] p-6">
      <h2 className="text-[20px] font-semibold text-[#d1d4dc]">{title}</h2>
      <p className="mt-3 text-[14px] leading-6 text-[#848e9c]">{body}</p>
      <div className="mt-5 flex gap-3">
        <Link
          href="/market/auth"
          className="inline-flex h-10 items-center rounded-[4px] border border-[rgba(51,102,255,0.22)] bg-[rgba(51,102,255,0.1)] px-4 text-[13px] font-medium text-[#d1d4dc] transition hover:bg-[rgba(51,102,255,0.16)]"
        >
          로그인하러 가기
        </Link>
        <Link
          href="/market"
          className="inline-flex h-10 items-center rounded-[4px] border border-[#2b2f36] bg-[#161b24] px-4 text-[13px] font-medium text-[#d1d4dc] transition hover:border-[#3a4252]"
        >
          시장으로 돌아가기
        </Link>
      </div>
    </MarketPanel>
  );
}
