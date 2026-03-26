import type { ReactNode } from "react";
import { MarketFooter, MarketHeader, MarketMethodologyNotice } from "@/components/market/MarketChrome";

export default function MarketLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="market-shell relative left-1/2 min-h-screen w-screen -translate-x-1/2">
      <MarketHeader />
      <main className="mx-auto w-full max-w-[1680px] px-4 py-5 sm:px-6 2xl:px-8">{children}</main>
      <MarketMethodologyNotice />
      <MarketFooter />
    </div>
  );
}
