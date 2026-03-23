export {
  MARKET_INSTRUMENTS,
  MARKET_PROJECT_SEEDS,
  MARKET_TRADING_FILTERS,
  type MarketHeatTileData,
  type MarketIndexCardData,
  type MarketIndexDefinition,
  type MarketLiquidityTier,
  type MarketProjectData,
  type MarketSector,
  type MarketTrendTone,
  type OssFactorSnapshot,
  type OssInstrument,
  type OssMarketState,
  type OssRawMetricsSnapshot,
} from "@/lib/market-catalog";

export {
  MARKET_FACTOR_SNAPSHOTS,
  MARKET_MARKET_STATES,
  MARKET_PROJECTS,
  MARKET_RAW_METRICS_SNAPSHOTS,
} from "@/lib/market-pricing";

export {
  MARKET_INDEX_CARDS,
  MARKET_INDEX_DEFINITIONS,
} from "@/lib/market-indices";

import {
  type MarketHeatTileData,
  MARKET_TRADING_FILTERS,
} from "@/lib/market-catalog";
import { MARKET_PROJECTS } from "@/lib/market-pricing";

function formatArrowDelta(value: number, decimals = 1) {
  return `${value >= 0 ? "\u25B2" : "\u25BC"} ${Math.abs(value).toFixed(decimals)}`;
}

function heatmapPosition(index: number) {
  return {
    desktopCol: ((index % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6,
    desktopRow: (index < 6 ? 1 : 2) as 1 | 2,
  };
}

export const MARKET_HOME_STOCKS = MARKET_PROJECTS.slice(0, 12).map((project) => ({
  key: project.key,
  name: project.name,
  category: project.category,
  rank: project.rank,
  score: project.score.toFixed(1),
  delta: formatArrowDelta(project.delta, 1),
  change: `${project.changeRate >= 0 ? "+" : ""}${project.changeRate.toFixed(2)}%`,
  tone: project.tone,
  participants: project.participants.toLocaleString("en-US"),
  up: project.up,
  flat: project.flat,
  down: project.down,
  spark: project.spark,
  href: `/market/trading/${project.slug}`,
}));

export const MARKET_HEATMAP_TILES: MarketHeatTileData[] = [...MARKET_PROJECTS]
  .sort((a, b) => Math.abs(b.changeRate) - Math.abs(a.changeRate))
  .slice(0, 12)
  .map((project, index) => ({
    name: project.name,
    change: `${project.changeRate >= 0 ? "+" : ""}${project.changeRate.toFixed(2)}%`,
    tone: project.tone,
    ...heatmapPosition(index),
  }));

export const MARKET_TRADING_ROWS = MARKET_PROJECTS.map((project) => ({
  key: project.key,
  name: project.name,
  category: project.category,
  filter: project.filter,
  rank: `#${project.rank}`,
  score: project.score.toFixed(1),
  high: project.high.toFixed(1),
  low: project.low.toFixed(1),
  delta: formatArrowDelta(project.delta, 1),
  changeRate: `${project.changeRate >= 0 ? "+" : ""}${project.changeRate.toFixed(2)}%`,
  tone: project.tone,
  up: project.up,
  flat: project.flat,
  down: project.down,
  participants: project.participants.toLocaleString("en-US"),
  href: `/market/trading/${project.slug}`,
}));

export const MARKET_SCREENER_CATEGORIES = [
  ...new Set(MARKET_PROJECTS.map((project) => project.filter)),
] as string[];

export const MARKET_SCREENER_ROWS = MARKET_PROJECTS.map((project) => ({
  rank: `#${project.rank}`,
  name: project.name,
  slug: project.slug,
  category: project.category,
  filter: project.filter,
  score: project.score,
  delta: project.delta,
  changeRate: project.changeRate,
  up: project.up * 10 + Math.round(project.participants / 10),
  flat: project.flat * 10 + Math.round(project.participants / 20),
  down: project.down * 10 + Math.round(project.participants / 30),
  participants: project.participants,
}));

export const MARKET_DETAIL_OVERRIDES = Object.fromEntries(
  MARKET_PROJECTS.map((project) => [
    project.slug,
    {
      name: project.name,
      category: project.category,
      currentScore: `${project.score.toFixed(1)}\uC810`,
      dayChange: `${formatArrowDelta(project.changeRate, 2)}%`,
      dayChangeTone: project.tone,
    },
  ]),
);
