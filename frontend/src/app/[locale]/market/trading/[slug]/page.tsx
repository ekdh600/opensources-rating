"use client";

import { use } from "react";
import { FigmaMarketTradingDetailPage } from "@/components/market/FigmaMarketTradingDetailPage";

export default function TradingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  return <FigmaMarketTradingDetailPage slug={slug} />;
}
