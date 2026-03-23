import {
  MARKET_PROJECT_SEEDS,
  type MarketLiquidityTier,
  type MarketProjectData,
  type MarketProjectSeed,
  type MarketTrendTone,
  type OssFactorSnapshot,
  type OssMarketState,
  type OssRawMetricsSnapshot,
} from "@/lib/market-catalog";
import { MARKET_CNCF_SNAPSHOTS } from "@/lib/market-cncf-snapshots.generated";
import { MARKET_DEPS_SNAPSHOTS } from "@/lib/market-deps-snapshots.generated";
import { MARKET_GITHUB_REPO_SNAPSHOTS } from "@/lib/market-github-snapshots.generated";

const AS_OF_DATE = "2026-03-23";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function daysBetween(from: string, to: string) {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  return Math.max(0, Math.round((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)));
}

function toneFromChange(changeRate: number): Exclude<MarketTrendTone, "neutral"> {
  return changeRate >= 0 ? "up" : "down";
}

function getPackageEcosystems(seed: MarketProjectSeed) {
  if (seed.filter === "AI/ML") return ["PyPI", "Docker Hub", "Helm"];
  if (seed.filter === "Observability") return ["Docker Hub", "Helm", "Homebrew"];
  if (seed.filter === "Security") return ["Docker Hub", "ArtifactHub", "Homebrew"];
  if (seed.filter === "Data") return ["Docker Hub", "Maven", "Helm"];
  return ["Docker Hub", "Helm"];
}

function buildRawMetrics(seed: MarketProjectSeed): OssRawMetricsSnapshot {
  const snapshot = MARKET_GITHUB_REPO_SNAPSHOTS[seed.slug];
  const depsSnapshot = MARKET_DEPS_SNAPSHOTS[seed.slug];
  const cncfSnapshot = MARKET_CNCF_SNAPSHOTS[seed.slug];
  const foundationBonus =
    seed.foundation === "cncf" ? 8000 : seed.foundation === "apache" ? 5000 : seed.foundation === "linux-foundation" ? 3500 : 0;
  const maturityBonus =
    seed.cncfMaturity === "graduated" ? 14 : seed.cncfMaturity === "incubating" ? 8 : seed.cncfMaturity === "sandbox" ? 4 : 0;
  const landscapeBonus = cncfSnapshot?.listedInLandscape ? 3600 : 0;
  const sparkTrend = (seed.spark[seed.spark.length - 1] ?? 50) - (seed.spark[0] ?? 50);
  const githubStars = snapshot?.stargazersCount ?? Math.round(seed.scoreAnchor * 1450 + seed.participants * 42 + foundationBonus + sparkTrend * 140);
  const githubForks = snapshot?.forksCount ?? Math.round(githubStars * 0.17);
  const githubOpenIssues = snapshot?.openIssuesCount ?? Math.round(120 + (100 - seed.scoreAnchor) * 18 + seed.rank * 6);
  const subscribers = snapshot?.subscribersCount ?? Math.max(18, Math.round(seed.participants / 11));
  const network = snapshot?.networkCount ?? githubForks;
  const pushedDaysAgo = snapshot?.pushedAt ? daysBetween(snapshot.pushedAt, `${AS_OF_DATE}T00:00:00Z`) : 12;
  const recency = clamp((90 - pushedDaysAgo) / 90, 0.08, 1);
  const githubStars90d = clamp(
    Math.round(githubStars * (0.004 + recency * 0.012) + subscribers * 9 + Math.max(sparkTrend, 0) * 40),
    24,
    Math.max(githubStars, 24),
  );
  const githubContributors90d = clamp(
    Math.round(Math.log10(githubStars + 1) * 12 + subscribers * 0.42 + network * 0.018 + recency * 16 + maturityBonus),
    4,
    220,
  );
  const githubCommitDays90d = clamp(Math.round(18 + recency * 52 + subscribers * 0.015), 8, 90);
  const githubClosedIssues90d = Math.round(160 + githubContributors90d * 4 + seed.scoreAnchor * 2);
  const githubMergedPrs90d = Math.round(90 + githubContributors90d * 3 + seed.scoreAnchor * 2.4);
  const githubReleaseCount365d = clamp(Math.round(2 + recency * 7 + subscribers / 130 + githubContributors90d / 30), 2, 18);
  const depsPackageBonus = (depsSnapshot?.packagesFound ?? 0) * 1600 + (depsSnapshot?.totalVersionCount ?? 0) * 12 + (depsSnapshot?.linksCount ?? 0) * 140;
  const depsDependentPackages = Math.round(network * 12 + subscribers * 38 + githubStars * 0.09 + foundationBonus / 4 + landscapeBonus + depsPackageBonus);
  const hasLicense = snapshot?.license ? 1 : 0;
  const depsLicenseBonus = Math.min(8, (depsSnapshot?.licensesCount ?? 0) * 2);
  const depsAdvisoryPenalty = Math.min(10, (depsSnapshot?.advisoriesCount ?? 0) * 4);
  const securityScore = clamp(
    Math.round(52 + seed.scoreAnchor * 0.24 + maturityBonus * 0.9 + hasLicense * 6 + recency * 10 + (cncfSnapshot?.listedInLandscape ? 5 : 0) + depsLicenseBonus - depsAdvisoryPenalty),
    48,
    97,
  );
  const sourceRank = clamp(
    Math.round(44 + Math.log10(githubStars + 1) * 8 + Math.log10(githubForks + 1) * 6 + hasLicense * 4 + recency * 10 + (depsSnapshot?.systems.length ?? 0) * 3 + (cncfSnapshot?.listedInLandscape ? 3 : 0)),
    42,
    99,
  );

  return {
    instrumentId: seed.slug,
    asOfDate: AS_OF_DATE,
    githubStars,
    githubStars90d,
    githubForks,
    githubContributors90d,
    githubCommitDays90d,
    githubOpenIssues,
    githubClosedIssues90d,
    githubMergedPrs90d,
    githubReleaseCount365d,
    githubArchived: snapshot?.archived ?? false,
    depsDependentPackages,
    packageEcosystems: depsSnapshot?.systems.length ? depsSnapshot.systems : getPackageEcosystems(seed),
    securityScore,
    sourceRank,
  };
}

function buildFactorSnapshot(seed: MarketProjectSeed, raw: OssRawMetricsSnapshot): OssFactorSnapshot {
  const depsSnapshot = MARKET_DEPS_SNAPSHOTS[seed.slug];
  const cncfSnapshot = MARKET_CNCF_SNAPSHOTS[seed.slug];
  const starScale = clamp(Math.log10(raw.githubStars + 1) * 18, 35, 100);
  const growthScale = clamp(48 + seed.changeRate * 10 + raw.githubStars90d / 180, 20, 100);
  const activityScale = clamp(raw.githubCommitDays90d * 1.05, 25, 100);
  const contributorScale = clamp(raw.githubContributors90d * 1.05, 25, 100);
  const closeRate = clamp((raw.githubClosedIssues90d / Math.max(raw.githubOpenIssues, 1)) * 28, 18, 100);
  const mergeScale = clamp(raw.githubMergedPrs90d / 7, 20, 100);
  const adoptionScale = clamp(
    Math.log10(raw.depsDependentPackages + 1) * 20 + (depsSnapshot?.systems.length ?? 0) * 2 + (depsSnapshot?.packagesFound ?? 0) * 3,
    20,
    100,
  );
  const foundationTrust =
    seed.foundation === "cncf" ? 12 : seed.foundation === "apache" ? 10 : seed.foundation === "linux-foundation" ? 8 : 5;
  const maturityTrust =
    seed.cncfMaturity === "graduated" ? 10 : seed.cncfMaturity === "incubating" ? 6 : seed.cncfMaturity === "sandbox" ? 3 : 0;
  const landscapeTrust = cncfSnapshot?.listedInLandscape ? 8 : 0;
  const ecosystemTrust = Math.min(8, (depsSnapshot?.packagesFound ?? 0) * 2 + (depsSnapshot?.systems.length ?? 0));

  const attention = clamp(seed.scoreAnchor * 0.52 + starScale * 0.28 + growthScale * 0.2, 30, 99);
  const execution = clamp(seed.scoreAnchor * 0.45 + activityScale * 0.3 + contributorScale * 0.25, 28, 99);
  const health = clamp(seed.scoreAnchor * 0.4 + closeRate * 0.3 + mergeScale * 0.3, 26, 99);
  const trust = clamp(seed.scoreAnchor * 0.38 + raw.securityScore * 0.32 + foundationTrust + maturityTrust + landscapeTrust + ecosystemTrust, 30, 99);
  const adoption = clamp(seed.scoreAnchor * 0.44 + adoptionScale * 0.36 + raw.sourceRank * 0.2, 26, 99);
  const momentum = clamp(46 + seed.changeRate * 10 + (seed.spark[seed.spark.length - 1] - seed.spark[0]) * 0.9, 18, 99);
  const fairScore = Number(
    (0.22 * attention + 0.23 * execution + 0.18 * health + 0.17 * trust + 0.2 * adoption).toFixed(2),
  );
  const growthBoost = Number(clamp(1 + ((momentum - 50) / 100) * 0.12, 0.92, 1.15).toFixed(3));
  const fairPrice = Number((fairScore * growthBoost).toFixed(2));

  return {
    instrumentId: seed.slug,
    asOfDate: AS_OF_DATE,
    attention: Number(attention.toFixed(2)),
    execution: Number(execution.toFixed(2)),
    health: Number(health.toFixed(2)),
    trust: Number(trust.toFixed(2)),
    adoption: Number(adoption.toFixed(2)),
    momentum: Number(momentum.toFixed(2)),
    fairScore,
    growthBoost,
    fairPrice,
  };
}

function buildMarketState(seed: MarketProjectSeed): OssMarketState {
  const liquidityTier: MarketLiquidityTier =
    seed.participants >= 1200 ? "large" : seed.participants >= 750 ? "mid" : "small";
  const lastPrice = Number(seed.scoreAnchor.toFixed(2));
  const prevClose = Number((lastPrice / (1 + seed.changeRate / 100)).toFixed(2));
  const open = Number((prevClose * (1 + seed.changeRate / 320)).toFixed(2));
  const high = Number((Math.max(lastPrice, open) * (1.006 + Math.abs(seed.changeRate) / 180)).toFixed(2));
  const low = Number((Math.min(lastPrice, open) * (0.994 - Math.min(Math.abs(seed.changeRate) / 220, 0.018))).toFixed(2));

  return {
    instrumentId: seed.slug,
    asOfDate: AS_OF_DATE,
    lastPrice,
    prevClose,
    open,
    high,
    low,
    change: Number((lastPrice - prevClose).toFixed(2)),
    changeRate: Number(seed.changeRate.toFixed(2)),
    liquidityTier,
    liquidityDepth: liquidityTier === "large" ? 100000 : liquidityTier === "mid" ? 42000 : 16000,
    spreadBps: liquidityTier === "large" ? 18 : liquidityTier === "mid" ? 28 : 45,
    feeBps: 20,
    participants: seed.participants,
    volume24h: Math.round(seed.participants * (0.7 + Math.abs(seed.changeRate) / 4)),
    netDemand24h: Math.round((seed.up - seed.down) * seed.participants * 0.9),
  };
}

export const MARKET_RAW_METRICS_SNAPSHOTS = MARKET_PROJECT_SEEDS.map(buildRawMetrics);
export const MARKET_FACTOR_SNAPSHOTS = MARKET_PROJECT_SEEDS.map((seed, index) =>
  buildFactorSnapshot(seed, MARKET_RAW_METRICS_SNAPSHOTS[index]),
);
export const MARKET_MARKET_STATES = MARKET_PROJECT_SEEDS.map((seed, index) => {
  const factors = MARKET_FACTOR_SNAPSHOTS[index];
  const baseState = buildMarketState(seed);
  const lastPrice = Number(factors.fairPrice.toFixed(2));
  const prevClose = Number((lastPrice / (1 + seed.changeRate / 100)).toFixed(2));
  const open = Number((prevClose * (1 + seed.changeRate / 320)).toFixed(2));
  const high = Number((Math.max(lastPrice, open) * (1.006 + Math.abs(seed.changeRate) / 180)).toFixed(2));
  const low = Number((Math.min(lastPrice, open) * (0.994 - Math.min(Math.abs(seed.changeRate) / 220, 0.018))).toFixed(2));

  return {
    ...baseState,
    lastPrice,
    prevClose,
    open,
    high,
    low,
    change: Number((lastPrice - prevClose).toFixed(2)),
  };
});

export const MARKET_PROJECTS: MarketProjectData[] = MARKET_PROJECT_SEEDS.map((seed, index) => {
  const state = MARKET_MARKET_STATES[index];
  return {
    key: seed.slug,
    slug: seed.slug,
    name: seed.name,
    category: seed.category,
    filter: seed.filter,
    rank: seed.rank,
    score: Number(state.lastPrice.toFixed(1)),
    high: Number(state.high.toFixed(1)),
    low: Number(state.low.toFixed(1)),
    delta: Number(state.change.toFixed(1)),
    changeRate: state.changeRate,
    tone: toneFromChange(state.changeRate),
    up: seed.up,
    flat: seed.flat,
    down: seed.down,
    participants: seed.participants,
    spark: seed.spark,
  };
});
