import {
  type MarketIndexCardData,
  type MarketIndexDefinition,
  MARKET_PROJECT_SEEDS,
} from "@/lib/market-catalog";
import { MARKET_PROJECTS } from "@/lib/market-pricing";

const INDEX_SEEDS = [
  {
    key: "oss",
    label: "OSS Index",
    eyebrow: { ko: "\uC804\uCCB4 \uC624\uD508\uC18C\uC2A4 \uC2DC\uC7A5 \uC9C0\uC218", en: "Overall open source market index" },
    group: "benchmark" as const,
    weighting: "score-capped" as const,
    displayScale: 14.9,
    constituentSlugs: MARKET_PROJECTS.map((project) => project.slug),
  },
  {
    key: "github-stars",
    label: "GitHub Star Index",
    eyebrow: { ko: "GitHub \uC2A4\uD0C0 \uBAA8\uBA58\uD140 \uC9C0\uC218", en: "GitHub star momentum index" },
    group: "factor" as const,
    weighting: "factor-weighted" as const,
    displayScale: 11.5,
    constituentSlugs: ["kubernetes", "docker", "grafana", "supabase", "prometheus", "terraform", "nginx", "clickhouse", "milvus", "backstage"],
  },
  {
    key: "cncf",
    label: "CNCF Index",
    eyebrow: { ko: "CNCF \uD504\uB85C\uC81D\uD2B8 \uC9C0\uC218", en: "CNCF project index" },
    group: "theme" as const,
    weighting: "score-capped" as const,
    displayScale: 10.8,
    constituentSlugs: MARKET_PROJECT_SEEDS.filter((project) => project.foundation === "cncf").map((project) => project.slug),
  },
  {
    key: "observability",
    label: "Observability Index",
    eyebrow: { ko: "\uAD00\uCE21\uC131 \uC9C0\uC218", en: "Observability sector index" },
    group: "sector" as const,
    weighting: "equal-weight" as const,
    displayScale: 8.4,
    constituentSlugs: MARKET_PROJECT_SEEDS.filter((project) => project.filter === "Observability").map((project) => project.slug),
  },
  {
    key: "platform",
    label: "Platform Ops Index",
    eyebrow: { ko: "\uD50C\uB7AB\uD3FC \uC6B4\uC601 \uC9C0\uC218", en: "Platform operations index" },
    group: "sector" as const,
    weighting: "score-capped" as const,
    displayScale: 11,
    constituentSlugs: MARKET_PROJECT_SEEDS.filter((project) => project.filter === "Platform" || project.filter === "Runtime").map((project) => project.slug),
  },
  {
    key: "release",
    label: "Release Cadence Index",
    eyebrow: { ko: "\uB9B4\uB9AC\uC2A4 \uC0AC\uC774\uD074 \uC9C0\uC218", en: "Release cadence index" },
    group: "factor" as const,
    weighting: "factor-weighted" as const,
    displayScale: 8.8,
    constituentSlugs: ["argo-cd", "kubernetes", "opentelemetry", "supabase", "backstage", "helm", "flux", "trivy"],
  },
  {
    key: "maintainer",
    label: "Maintainer Velocity Index",
    eyebrow: { ko: "\uBA54\uC778\uD14C\uC774\uB108 \uC18D\uB3C4 \uC9C0\uC218", en: "Maintainer velocity index" },
    group: "factor" as const,
    weighting: "factor-weighted" as const,
    displayScale: 9.5,
    constituentSlugs: ["kubernetes", "prometheus", "opentelemetry", "backstage", "supabase", "clickhouse", "argo-cd", "kyverno"],
  },
  {
    key: "security",
    label: "Security Index",
    eyebrow: { ko: "\uD074\uB77C\uC6B0\uB4DC \uBCF4\uC548 \uC9C0\uC218", en: "Cloud security index" },
    group: "sector" as const,
    weighting: "equal-weight" as const,
    displayScale: 7.7,
    constituentSlugs: MARKET_PROJECT_SEEDS.filter((project) => project.filter === "Security").map((project) => project.slug),
  },
  {
    key: "data",
    label: "Data Infra Index",
    eyebrow: { ko: "\uB370\uC774\uD130 \uC778\uD504\uB77C \uC9C0\uC218", en: "Data infrastructure index" },
    group: "sector" as const,
    weighting: "score-capped" as const,
    displayScale: 8.9,
    constituentSlugs: MARKET_PROJECT_SEEDS.filter((project) => project.filter === "Data").map((project) => project.slug),
  },
  {
    key: "ai",
    label: "AI Infra Index",
    eyebrow: { ko: "AI \uC778\uD504\uB77C \uC9C0\uC218", en: "AI infrastructure index" },
    group: "sector" as const,
    weighting: "equal-weight" as const,
    displayScale: 8.7,
    constituentSlugs: MARKET_PROJECT_SEEDS.filter((project) => project.filter === "AI/ML").map((project) => project.slug),
  },
];

function formatArrowDelta(value: number, decimals = 2) {
  return `${value >= 0 ? "\u25B2" : "\u25BC"} ${Math.abs(value).toFixed(decimals)}`;
}

function normalizeSpark(values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return values.map((value) => Math.round(((value - min) / range) * 44 + 52));
}

function buildIndexCard(definition: MarketIndexDefinition): MarketIndexCardData {
  const members = MARKET_PROJECTS.filter((project) => definition.constituentSlugs.includes(project.slug));
  const totalWeight = members.reduce((sum, project) => sum + Math.max(project.score, 1), 0) || 1;
  const weightedScore = members.reduce((sum, project) => sum + (project.score / totalWeight) * project.score, 0);
  const weightedChange = members.reduce((sum, project) => sum + (project.score / totalWeight) * project.changeRate, 0);
  const displayValue = weightedScore * definition.displayScale;
  const deltaValue = displayValue * (weightedChange / 100);
  const sparkValues = Array.from({ length: 8 }, (_, index) =>
    members.reduce((sum, project) => sum + project.spark[index] * (project.score / totalWeight), 0),
  );

  return {
    key: definition.key,
    eyebrow: definition.eyebrow,
    label: definition.label,
    value: displayValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    delta: formatArrowDelta(deltaValue, 2),
    change: `${weightedChange >= 0 ? "+" : ""}${weightedChange.toFixed(2)}%`,
    tone: weightedChange >= 0 ? "up" : "down",
    spark: normalizeSpark(sparkValues),
  };
}

export const MARKET_INDEX_DEFINITIONS: MarketIndexDefinition[] = INDEX_SEEDS;
export const MARKET_INDEX_CARDS: MarketIndexCardData[] = MARKET_INDEX_DEFINITIONS.map(buildIndexCard);
