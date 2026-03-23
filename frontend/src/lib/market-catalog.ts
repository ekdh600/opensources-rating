export type MarketTrendTone = "up" | "down" | "neutral";

export type MarketSector =
  | "platform-ops"
  | "observability"
  | "security"
  | "data-infra"
  | "ai-infra"
  | "networking"
  | "runtime"
  | "delivery"
  | "developer-tooling"
  | "database"
  | "messaging";

export type MarketFoundation = "cncf" | "linux-foundation" | "apache" | "independent";
export type MarketLiquidityTier = "large" | "mid" | "small";
export type MarketIndexGroup = "benchmark" | "sector" | "factor" | "theme";

export interface MarketIndexCardData {
  key: string;
  eyebrow: { ko: string; en: string };
  label: string;
  value: string;
  delta: string;
  change: string;
  tone: MarketTrendTone;
  spark: number[];
}

export interface MarketProjectData {
  key: string;
  slug: string;
  name: string;
  category: string;
  filter: string;
  rank: number;
  score: number;
  high: number;
  low: number;
  delta: number;
  changeRate: number;
  tone: Exclude<MarketTrendTone, "neutral">;
  up: number;
  flat: number;
  down: number;
  participants: number;
  spark: number[];
}

export interface MarketHeatTileData {
  name: string;
  change: string;
  tone: MarketTrendTone;
  desktopCol: 1 | 2 | 3 | 4 | 5 | 6;
  desktopRow: 1 | 2;
}

export interface OssInstrument {
  id: string;
  slug: string;
  name: string;
  repoOwner: string;
  repoName: string;
  sector: MarketSector;
  category: string;
  filter: string;
  capabilities: string[];
  foundation: MarketFoundation;
  cncfMaturity?: "sandbox" | "incubating" | "graduated";
  license: string;
  packageKeys?: { system: "GO" | "NPM" | "PYPI" | "MAVEN"; name: string }[];
  status: "active" | "watchlist" | "delisted";
  listedAt: string;
  ageDays: number;
}

export interface OssRawMetricsSnapshot {
  instrumentId: string;
  asOfDate: string;
  githubStars: number;
  githubStars90d: number;
  githubForks: number;
  githubContributors90d: number;
  githubCommitDays90d: number;
  githubOpenIssues: number;
  githubClosedIssues90d: number;
  githubMergedPrs90d: number;
  githubReleaseCount365d: number;
  githubArchived: boolean;
  depsDependentPackages: number;
  packageEcosystems: string[];
  securityScore: number;
  sourceRank: number;
}

export interface OssFactorSnapshot {
  instrumentId: string;
  asOfDate: string;
  attention: number;
  execution: number;
  health: number;
  trust: number;
  adoption: number;
  momentum: number;
  fairScore: number;
  growthBoost: number;
  fairPrice: number;
}

export interface OssMarketState {
  instrumentId: string;
  asOfDate: string;
  lastPrice: number;
  prevClose: number;
  open: number;
  high: number;
  low: number;
  change: number;
  changeRate: number;
  liquidityTier: MarketLiquidityTier;
  liquidityDepth: number;
  spreadBps: number;
  feeBps: number;
  participants: number;
  volume24h: number;
  netDemand24h: number;
}

export interface MarketIndexDefinition {
  key: string;
  label: string;
  eyebrow: { ko: string; en: string };
  group: MarketIndexGroup;
  weighting: "score-capped" | "equal-weight" | "factor-weighted";
  constituentSlugs: string[];
  displayScale: number;
}

export interface MarketProjectSeed extends OssInstrument {
  rank: number;
  scoreAnchor: number;
  changeRate: number;
  participants: number;
  up: number;
  flat: number;
  down: number;
  spark: number[];
}

export const MARKET_TRADING_FILTERS = [
  { key: "all", label: "All" },
  { key: "Platform", label: "Platform" },
  { key: "Observability", label: "Observability" },
  { key: "Networking", label: "Networking" },
  { key: "Delivery", label: "Delivery" },
  { key: "Runtime", label: "Runtime" },
  { key: "Data", label: "Data" },
  { key: "Security", label: "Security" },
  { key: "AI/ML", label: "AI/ML" },
] as const;

export const MARKET_PROJECT_SEEDS: MarketProjectSeed[] = [
  { id: "kubernetes", slug: "kubernetes", name: "Kubernetes", repoOwner: "kubernetes", repoName: "kubernetes", sector: "platform-ops", category: "Orchestration", filter: "Platform", capabilities: ["orchestration", "platform"], foundation: "cncf", cncfMaturity: "graduated", license: "Apache-2.0", packageKeys: [{ system: "GO", name: "k8s.io/kubernetes" }], status: "active", listedAt: "2024-01-15", ageDays: 3650, rank: 1, scoreAnchor: 94.5, changeRate: 2.49, participants: 1668, up: 75, flat: 20, down: 5, spark: [82, 83, 83, 84, 85, 86, 88, 89] },
  { id: "prometheus", slug: "prometheus", name: "Prometheus", repoOwner: "prometheus", repoName: "prometheus", sector: "observability", category: "Observability", filter: "Observability", capabilities: ["metrics", "alerting"], foundation: "cncf", cncfMaturity: "graduated", license: "Apache-2.0", packageKeys: [{ system: "GO", name: "github.com/prometheus/prometheus" }], status: "active", listedAt: "2024-01-15", ageDays: 3300, rank: 2, scoreAnchor: 88.2, changeRate: 2.08, participants: 1260, up: 71, flat: 19, down: 10, spark: [78, 79, 80, 80, 81, 82, 83, 84] },
  { id: "grafana", slug: "grafana", name: "Grafana", repoOwner: "grafana", repoName: "grafana", sector: "observability", category: "Observability", filter: "Observability", capabilities: ["dashboard", "visualization"], foundation: "independent", license: "AGPL-3.0", packageKeys: [{ system: "GO", name: "github.com/grafana/grafana" }], status: "active", listedAt: "2024-01-18", ageDays: 3200, rank: 3, scoreAnchor: 86.1, changeRate: 1.77, participants: 1444, up: 72, flat: 22, down: 7, spark: [74, 75, 76, 76, 77, 78, 80, 81] },
  { id: "envoy", slug: "envoy", name: "Envoy", repoOwner: "envoyproxy", repoName: "envoy", sector: "networking", category: "Networking", filter: "Networking", capabilities: ["proxy", "gateway"], foundation: "cncf", cncfMaturity: "graduated", license: "Apache-2.0", status: "active", listedAt: "2024-01-20", ageDays: 3000, rank: 4, scoreAnchor: 83.9, changeRate: 0.96, participants: 1000, up: 57, flat: 29, down: 14, spark: [69, 70, 71, 72, 72, 73, 74, 75] },
  { id: "cilium", slug: "cilium", name: "Cilium", repoOwner: "cilium", repoName: "cilium", sector: "networking", category: "Networking", filter: "Networking", capabilities: ["cni", "ebpf"], foundation: "cncf", cncfMaturity: "graduated", license: "Apache-2.0", status: "active", listedAt: "2024-01-21", ageDays: 2500, rank: 5, scoreAnchor: 82.7, changeRate: -0.6, participants: 932, up: 49, flat: 31, down: 20, spark: [75, 74, 73, 73, 72, 72, 71, 70] },
  { id: "docker", slug: "docker", name: "Docker", repoOwner: "docker", repoName: "cli", sector: "runtime", category: "Container Platform", filter: "Runtime", capabilities: ["containers", "build"], foundation: "independent", license: "Apache-2.0", status: "active", listedAt: "2024-01-22", ageDays: 4200, rank: 6, scoreAnchor: 80.8, changeRate: 1.13, participants: 1148, up: 54, flat: 30, down: 16, spark: [63, 64, 65, 66, 67, 68, 69, 71] },
  { id: "argo-cd", slug: "argo-cd", name: "Argo CD", repoOwner: "argoproj", repoName: "argo-cd", sector: "delivery", category: "CI/CD", filter: "Delivery", capabilities: ["gitops", "delivery"], foundation: "cncf", cncfMaturity: "graduated", license: "Apache-2.0", packageKeys: [{ system: "GO", name: "github.com/argoproj/argo-cd/v2" }], status: "active", listedAt: "2024-01-24", ageDays: 1900, rank: 7, scoreAnchor: 79.4, changeRate: 4.2, participants: 952, up: 71, flat: 21, down: 8, spark: [60, 61, 64, 66, 70, 74, 77, 82] },
  { id: "terraform", slug: "terraform", name: "Terraform", repoOwner: "hashicorp", repoName: "terraform", sector: "platform-ops", category: "Infrastructure as Code", filter: "Platform", capabilities: ["iac", "provisioning"], foundation: "independent", license: "BUSL-1.1", packageKeys: [{ system: "GO", name: "github.com/hashicorp/terraform" }], status: "active", listedAt: "2024-01-25", ageDays: 3800, rank: 8, scoreAnchor: 79.2, changeRate: 1.41, participants: 1192, up: 63, flat: 24, down: 13, spark: [59, 60, 61, 63, 64, 66, 67, 69] },
  { id: "containerd", slug: "containerd", name: "containerd", repoOwner: "containerd", repoName: "containerd", sector: "runtime", category: "Container Runtime", filter: "Runtime", capabilities: ["runtime", "cri"], foundation: "cncf", cncfMaturity: "graduated", license: "Apache-2.0", status: "active", listedAt: "2024-01-27", ageDays: 2400, rank: 9, scoreAnchor: 78.6, changeRate: -0.38, participants: 966, up: 44, flat: 37, down: 19, spark: [64, 63, 63, 62, 62, 61, 61, 60] },
  { id: "etcd", slug: "etcd", name: "etcd", repoOwner: "etcd-io", repoName: "etcd", sector: "data-infra", category: "Distributed Database", filter: "Data", capabilities: ["kv-store", "consensus"], foundation: "cncf", cncfMaturity: "graduated", license: "Apache-2.0", status: "active", listedAt: "2024-01-29", ageDays: 3600, rank: 10, scoreAnchor: 77.8, changeRate: -0.51, participants: 688, up: 39, flat: 37, down: 24, spark: [66, 66, 65, 64, 64, 63, 63, 62] },
  { id: "opentelemetry", slug: "opentelemetry", name: "OpenTelemetry", repoOwner: "open-telemetry", repoName: "opentelemetry-collector", sector: "observability", category: "Telemetry", filter: "Observability", capabilities: ["telemetry", "collector"], foundation: "cncf", cncfMaturity: "graduated", license: "Apache-2.0", status: "active", listedAt: "2024-02-01", ageDays: 1800, rank: 11, scoreAnchor: 76.6, changeRate: 1.92, participants: 1276, up: 61, flat: 25, down: 14, spark: [57, 58, 59, 61, 62, 63, 65, 67] },
  { id: "istio", slug: "istio", name: "Istio", repoOwner: "istio", repoName: "istio", sector: "networking", category: "Service Mesh", filter: "Networking", capabilities: ["service-mesh", "traffic-policy"], foundation: "cncf", cncfMaturity: "graduated", license: "Apache-2.0", status: "active", listedAt: "2024-02-02", ageDays: 2700, rank: 12, scoreAnchor: 75.3, changeRate: -1.57, participants: 980, up: 35, flat: 42, down: 23, spark: [68, 67, 66, 65, 64, 63, 62, 61] },
  { id: "helm", slug: "helm", name: "Helm", repoOwner: "helm", repoName: "helm", sector: "delivery", category: "Package Manager", filter: "Platform", capabilities: ["package-manager", "charts"], foundation: "cncf", cncfMaturity: "graduated", license: "Apache-2.0", packageKeys: [{ system: "GO", name: "helm.sh/helm/v3" }], status: "active", listedAt: "2024-02-04", ageDays: 3000, rank: 13, scoreAnchor: 74.8, changeRate: 0.84, participants: 834, up: 53, flat: 29, down: 18, spark: [61, 61, 62, 63, 64, 65, 65, 66] },
  { id: "backstage", slug: "backstage", name: "Backstage", repoOwner: "backstage", repoName: "backstage", sector: "developer-tooling", category: "Developer Portal", filter: "Delivery", capabilities: ["developer-portal", "catalog"], foundation: "cncf", cncfMaturity: "incubating", license: "Apache-2.0", status: "active", listedAt: "2024-02-06", ageDays: 1500, rank: 14, scoreAnchor: 73.9, changeRate: 2.24, participants: 744, up: 64, flat: 23, down: 13, spark: [52, 54, 56, 59, 61, 63, 66, 68] },
  { id: "flux", slug: "flux", name: "Flux", repoOwner: "fluxcd", repoName: "flux2", sector: "delivery", category: "GitOps", filter: "Delivery", capabilities: ["gitops", "automation"], foundation: "cncf", cncfMaturity: "graduated", license: "Apache-2.0", status: "active", listedAt: "2024-02-08", ageDays: 1900, rank: 15, scoreAnchor: 73.6, changeRate: 1.66, participants: 621, up: 59, flat: 25, down: 16, spark: [54, 55, 56, 58, 60, 61, 63, 65] },
  { id: "nginx", slug: "nginx", name: "NGINX", repoOwner: "nginx", repoName: "nginx", sector: "networking", category: "Gateway", filter: "Networking", capabilities: ["gateway", "web-server"], foundation: "independent", license: "BSD-2-Clause", status: "active", listedAt: "2024-02-10", ageDays: 5200, rank: 16, scoreAnchor: 72.8, changeRate: -0.22, participants: 1420, up: 42, flat: 35, down: 23, spark: [65, 65, 64, 64, 63, 63, 62, 62] },
  { id: "kafka", slug: "kafka", name: "Kafka", repoOwner: "apache", repoName: "kafka", sector: "messaging", category: "Streaming", filter: "Data", capabilities: ["streaming", "messaging"], foundation: "apache", license: "Apache-2.0", status: "active", listedAt: "2024-02-12", ageDays: 4300, rank: 17, scoreAnchor: 72.3, changeRate: 1.31, participants: 1102, up: 55, flat: 27, down: 18, spark: [56, 57, 58, 59, 60, 61, 63, 64] },
  { id: "clickhouse", slug: "clickhouse", name: "ClickHouse", repoOwner: "ClickHouse", repoName: "ClickHouse", sector: "data-infra", category: "Analytics DB", filter: "Data", capabilities: ["analytics", "warehouse"], foundation: "independent", license: "Apache-2.0", status: "active", listedAt: "2024-02-15", ageDays: 2400, rank: 18, scoreAnchor: 71.9, changeRate: 1.88, participants: 918, up: 58, flat: 24, down: 18, spark: [51, 52, 54, 56, 58, 60, 62, 65] },
  { id: "postgresql", slug: "postgresql", name: "PostgreSQL", repoOwner: "postgres", repoName: "postgres", sector: "database", category: "Database", filter: "Data", capabilities: ["database", "sql"], foundation: "independent", license: "PostgreSQL", status: "active", listedAt: "2024-02-17", ageDays: 7000, rank: 19, scoreAnchor: 71.4, changeRate: 0.74, participants: 1542, up: 52, flat: 30, down: 18, spark: [63, 63, 64, 64, 65, 65, 66, 67] },
  { id: "supabase", slug: "supabase", name: "Supabase", repoOwner: "supabase", repoName: "supabase", sector: "data-infra", category: "Backend Platform", filter: "Data", capabilities: ["backend-platform", "auth"], foundation: "independent", license: "Apache-2.0", status: "active", listedAt: "2024-02-19", ageDays: 1600, rank: 20, scoreAnchor: 70.8, changeRate: 2.97, participants: 1310, up: 67, flat: 19, down: 14, spark: [49, 51, 54, 57, 60, 64, 68, 72] },
  { id: "loki", slug: "loki", name: "Loki", repoOwner: "grafana", repoName: "loki", sector: "observability", category: "Log Analytics", filter: "Observability", capabilities: ["logging", "query"], foundation: "cncf", cncfMaturity: "graduated", license: "AGPL-3.0", status: "active", listedAt: "2024-02-21", ageDays: 1600, rank: 21, scoreAnchor: 70.2, changeRate: 1.42, participants: 706, up: 56, flat: 25, down: 19, spark: [47, 48, 49, 50, 51, 52, 54, 55] },
  { id: "jaeger", slug: "jaeger", name: "Jaeger", repoOwner: "jaegertracing", repoName: "jaeger", sector: "observability", category: "Tracing", filter: "Observability", capabilities: ["tracing", "collector"], foundation: "cncf", cncfMaturity: "graduated", license: "Apache-2.0", status: "active", listedAt: "2024-02-22", ageDays: 2700, rank: 22, scoreAnchor: 69.7, changeRate: -0.44, participants: 688, up: 41, flat: 34, down: 25, spark: [55, 54, 54, 53, 53, 52, 52, 51] },
  { id: "milvus", slug: "milvus", name: "Milvus", repoOwner: "milvus-io", repoName: "milvus", sector: "ai-infra", category: "Vector DB", filter: "AI/ML", capabilities: ["vector-db", "search"], foundation: "linux-foundation", license: "Apache-2.0", status: "active", listedAt: "2024-02-24", ageDays: 1700, rank: 23, scoreAnchor: 68.9, changeRate: 2.61, participants: 744, up: 63, flat: 20, down: 17, spark: [40, 42, 45, 49, 52, 55, 58, 62] },
  { id: "trivy", slug: "trivy", name: "Trivy", repoOwner: "aquasecurity", repoName: "trivy", sector: "security", category: "Vulnerability Scan", filter: "Security", capabilities: ["security", "scanning"], foundation: "independent", license: "Apache-2.0", status: "active", listedAt: "2024-02-26", ageDays: 1900, rank: 24, scoreAnchor: 68.3, changeRate: 1.05, participants: 632, up: 57, flat: 24, down: 19, spark: [45, 46, 47, 49, 50, 51, 52, 54] },
  { id: "falco", slug: "falco", name: "Falco", repoOwner: "falcosecurity", repoName: "falco", sector: "security", category: "Runtime Security", filter: "Security", capabilities: ["runtime-security", "detection"], foundation: "cncf", cncfMaturity: "graduated", license: "Apache-2.0", status: "active", listedAt: "2024-02-28", ageDays: 2100, rank: 25, scoreAnchor: 67.6, changeRate: 0.58, participants: 584, up: 51, flat: 28, down: 21, spark: [44, 44, 45, 46, 47, 48, 49, 50] },
  { id: "kyverno", slug: "kyverno", name: "Kyverno", repoOwner: "kyverno", repoName: "kyverno", sector: "security", category: "Policy Engine", filter: "Security", capabilities: ["policy", "governance"], foundation: "cncf", cncfMaturity: "incubating", license: "Apache-2.0", status: "active", listedAt: "2024-03-01", ageDays: 1500, rank: 26, scoreAnchor: 67.1, changeRate: 1.26, participants: 548, up: 54, flat: 27, down: 19, spark: [42, 43, 44, 46, 47, 48, 49, 51] },
  { id: "opentofu", slug: "opentofu", name: "OpenTofu", repoOwner: "opentofu", repoName: "opentofu", sector: "platform-ops", category: "Infrastructure as Code", filter: "Platform", capabilities: ["iac", "provisioning"], foundation: "linux-foundation", license: "MPL-2.0", status: "active", listedAt: "2024-03-03", ageDays: 600, rank: 27, scoreAnchor: 66.8, changeRate: 3.41, participants: 884, up: 66, flat: 20, down: 14, spark: [40, 42, 45, 48, 52, 56, 60, 65] },
  { id: "karpenter", slug: "karpenter", name: "Karpenter", repoOwner: "kubernetes-sigs", repoName: "karpenter", sector: "platform-ops", category: "Cluster Autoscaling", filter: "Platform", capabilities: ["autoscaling", "kubernetes"], foundation: "cncf", cncfMaturity: "sandbox", license: "Apache-2.0", status: "active", listedAt: "2024-03-05", ageDays: 900, rank: 28, scoreAnchor: 66.2, changeRate: 2.74, participants: 812, up: 61, flat: 22, down: 17, spark: [44, 45, 47, 49, 52, 55, 58, 61] },
  { id: "crossplane", slug: "crossplane", name: "Crossplane", repoOwner: "crossplane", repoName: "crossplane", sector: "platform-ops", category: "Control Plane", filter: "Platform", capabilities: ["control-plane", "iac"], foundation: "cncf", cncfMaturity: "incubating", license: "Apache-2.0", status: "active", listedAt: "2024-03-07", ageDays: 1500, rank: 29, scoreAnchor: 65.7, changeRate: 1.83, participants: 746, up: 58, flat: 24, down: 18, spark: [46, 47, 48, 49, 50, 52, 54, 56] },
  { id: "cert-manager", slug: "cert-manager", name: "cert-manager", repoOwner: "cert-manager", repoName: "cert-manager", sector: "security", category: "Certificate Management", filter: "Security", capabilities: ["certificates", "kubernetes"], foundation: "cncf", cncfMaturity: "graduated", license: "Apache-2.0", status: "active", listedAt: "2024-03-09", ageDays: 1800, rank: 30, scoreAnchor: 65.4, changeRate: 1.12, participants: 702, up: 55, flat: 25, down: 20, spark: [43, 44, 45, 46, 48, 50, 52, 53] },
  { id: "harbor", slug: "harbor", name: "Harbor", repoOwner: "goharbor", repoName: "harbor", sector: "security", category: "Artifact Registry", filter: "Security", capabilities: ["registry", "supply-chain"], foundation: "cncf", cncfMaturity: "graduated", license: "Apache-2.0", status: "active", listedAt: "2024-03-10", ageDays: 2200, rank: 31, scoreAnchor: 65.1, changeRate: 0.94, participants: 688, up: 53, flat: 27, down: 20, spark: [42, 43, 44, 45, 46, 47, 49, 50] },
  { id: "linkerd", slug: "linkerd", name: "Linkerd", repoOwner: "linkerd", repoName: "linkerd2", sector: "networking", category: "Service Mesh", filter: "Networking", capabilities: ["service-mesh", "security"], foundation: "cncf", cncfMaturity: "graduated", license: "Apache-2.0", status: "active", listedAt: "2024-03-11", ageDays: 2300, rank: 32, scoreAnchor: 64.8, changeRate: 0.68, participants: 640, up: 49, flat: 30, down: 21, spark: [48, 48, 49, 49, 50, 51, 52, 53] },
  { id: "keycloak", slug: "keycloak", name: "Keycloak", repoOwner: "keycloak", repoName: "keycloak", sector: "security", category: "Identity", filter: "Security", capabilities: ["identity", "access-management"], foundation: "independent", license: "Apache-2.0", status: "active", listedAt: "2024-03-12", ageDays: 2800, rank: 33, scoreAnchor: 64.4, changeRate: 1.01, participants: 978, up: 56, flat: 24, down: 20, spark: [50, 51, 52, 53, 54, 55, 56, 58] },
  { id: "minio", slug: "minio", name: "MinIO", repoOwner: "minio", repoName: "minio", sector: "data-infra", category: "Object Storage", filter: "Data", capabilities: ["storage", "s3"], foundation: "independent", license: "AGPL-3.0", status: "active", listedAt: "2024-03-14", ageDays: 3400, rank: 34, scoreAnchor: 64.1, changeRate: 1.24, participants: 944, up: 57, flat: 23, down: 20, spark: [49, 50, 51, 52, 53, 54, 55, 57] },
  { id: "redis", slug: "redis", name: "Redis", repoOwner: "redis", repoName: "redis", sector: "database", category: "Database", filter: "Data", capabilities: ["cache", "database"], foundation: "independent", license: "RSALv2", status: "active", listedAt: "2024-03-16", ageDays: 5400, rank: 35, scoreAnchor: 63.8, changeRate: 0.57, participants: 1188, up: 51, flat: 28, down: 21, spark: [55, 55, 56, 56, 57, 57, 58, 59] },
  { id: "rabbitmq", slug: "rabbitmq", name: "RabbitMQ", repoOwner: "rabbitmq", repoName: "rabbitmq-server", sector: "messaging", category: "Messaging", filter: "Data", capabilities: ["messaging", "queue"], foundation: "independent", license: "MPL-2.0", status: "active", listedAt: "2024-03-18", ageDays: 5200, rank: 36, scoreAnchor: 63.4, changeRate: 0.73, participants: 822, up: 52, flat: 27, down: 21, spark: [51, 51, 52, 52, 53, 53, 54, 55] },
  { id: "temporal", slug: "temporal", name: "Temporal", repoOwner: "temporalio", repoName: "temporal", sector: "delivery", category: "Workflow Engine", filter: "Delivery", capabilities: ["workflow", "orchestration"], foundation: "independent", license: "MIT", status: "active", listedAt: "2024-03-20", ageDays: 1700, rank: 37, scoreAnchor: 63.1, changeRate: 1.94, participants: 684, up: 58, flat: 23, down: 19, spark: [45, 46, 47, 48, 49, 51, 53, 55] },
  { id: "airflow", slug: "airflow", name: "Apache Airflow", repoOwner: "apache", repoName: "airflow", sector: "delivery", category: "Workflow Scheduler", filter: "Delivery", capabilities: ["workflow", "scheduler"], foundation: "apache", license: "Apache-2.0", packageKeys: [{ system: "PYPI", name: "apache-airflow" }], status: "active", listedAt: "2024-03-22", ageDays: 3200, rank: 38, scoreAnchor: 62.8, changeRate: 0.88, participants: 1110, up: 53, flat: 26, down: 21, spark: [50, 50, 51, 52, 52, 53, 54, 55] },
  { id: "vector", slug: "vector", name: "Vector", repoOwner: "vectordotdev", repoName: "vector", sector: "observability", category: "Telemetry Pipeline", filter: "Observability", capabilities: ["pipeline", "logging"], foundation: "independent", license: "MPL-2.0", status: "active", listedAt: "2024-03-24", ageDays: 1700, rank: 39, scoreAnchor: 62.4, changeRate: 1.37, participants: 612, up: 55, flat: 24, down: 21, spark: [44, 45, 46, 47, 48, 49, 51, 53] },
  { id: "victoriametrics", slug: "victoriametrics", name: "VictoriaMetrics", repoOwner: "VictoriaMetrics", repoName: "VictoriaMetrics", sector: "observability", category: "Time Series DB", filter: "Observability", capabilities: ["metrics", "time-series"], foundation: "independent", license: "Apache-2.0", status: "active", listedAt: "2024-03-26", ageDays: 1800, rank: 40, scoreAnchor: 62.1, changeRate: 1.28, participants: 598, up: 54, flat: 25, down: 21, spark: [43, 44, 45, 46, 47, 48, 49, 51] },
  { id: "airbyte", slug: "airbyte", name: "Airbyte", repoOwner: "airbytehq", repoName: "airbyte", sector: "data-infra", category: "Data Integration", filter: "Data", capabilities: ["etl", "integration"], foundation: "independent", license: "ELv2", status: "active", listedAt: "2024-03-28", ageDays: 1400, rank: 41, scoreAnchor: 61.7, changeRate: 1.66, participants: 702, up: 57, flat: 23, down: 20, spark: [42, 43, 44, 46, 47, 49, 51, 54] },
  { id: "dbt-core", slug: "dbt-core", name: "dbt Core", repoOwner: "dbt-labs", repoName: "dbt-core", sector: "developer-tooling", category: "Analytics Engineering", filter: "Data", capabilities: ["transformation", "analytics"], foundation: "independent", license: "Apache-2.0", packageKeys: [{ system: "PYPI", name: "dbt-core" }], status: "active", listedAt: "2024-03-30", ageDays: 2100, rank: 42, scoreAnchor: 61.3, changeRate: 1.09, participants: 688, up: 54, flat: 24, down: 22, spark: [46, 46, 47, 48, 49, 50, 51, 52] },
  { id: "ollama", slug: "ollama", name: "Ollama", repoOwner: "ollama", repoName: "ollama", sector: "ai-infra", category: "Model Runtime", filter: "AI/ML", capabilities: ["llm-runtime", "inference"], foundation: "independent", license: "MIT", packageKeys: [{ system: "GO", name: "github.com/ollama/ollama" }], status: "active", listedAt: "2024-04-02", ageDays: 500, rank: 43, scoreAnchor: 60.9, changeRate: 4.12, participants: 1184, up: 69, flat: 17, down: 14, spark: [38, 41, 45, 50, 56, 61, 67, 73] },
  { id: "vllm", slug: "vllm", name: "vLLM", repoOwner: "vllm-project", repoName: "vllm", sector: "ai-infra", category: "Inference Engine", filter: "AI/ML", capabilities: ["inference", "serving"], foundation: "independent", license: "Apache-2.0", packageKeys: [{ system: "PYPI", name: "vllm" }], status: "active", listedAt: "2024-04-04", ageDays: 650, rank: 44, scoreAnchor: 60.5, changeRate: 3.78, participants: 1018, up: 67, flat: 18, down: 15, spark: [39, 42, 46, 49, 53, 58, 63, 69] },
  { id: "kserve", slug: "kserve", name: "KServe", repoOwner: "kserve", repoName: "kserve", sector: "ai-infra", category: "Model Serving", filter: "AI/ML", capabilities: ["serving", "kubernetes"], foundation: "cncf", cncfMaturity: "sandbox", license: "Apache-2.0", status: "active", listedAt: "2024-04-06", ageDays: 1400, rank: 45, scoreAnchor: 60.2, changeRate: 2.11, participants: 556, up: 59, flat: 22, down: 19, spark: [41, 42, 43, 45, 47, 49, 51, 54] },
  { id: "mlflow", slug: "mlflow", name: "MLflow", repoOwner: "mlflow", repoName: "mlflow", sector: "ai-infra", category: "MLOps", filter: "AI/ML", capabilities: ["mlops", "tracking"], foundation: "linux-foundation", license: "Apache-2.0", packageKeys: [{ system: "PYPI", name: "mlflow" }], status: "active", listedAt: "2024-04-08", ageDays: 2300, rank: 46, scoreAnchor: 59.8, changeRate: 1.34, participants: 790, up: 55, flat: 24, down: 21, spark: [44, 45, 45, 46, 47, 48, 50, 52] },
  { id: "kubeflow", slug: "kubeflow", name: "Kubeflow", repoOwner: "kubeflow", repoName: "kubeflow", sector: "ai-infra", category: "ML Platform", filter: "AI/ML", capabilities: ["ml-platform", "pipelines"], foundation: "cncf", cncfMaturity: "sandbox", license: "Apache-2.0", status: "active", listedAt: "2024-04-10", ageDays: 2600, rank: 47, scoreAnchor: 59.3, changeRate: 0.92, participants: 734, up: 52, flat: 26, down: 22, spark: [45, 45, 46, 46, 47, 48, 49, 50] },
  { id: "langfuse", slug: "langfuse", name: "Langfuse", repoOwner: "langfuse", repoName: "langfuse", sector: "ai-infra", category: "LLM Observability", filter: "AI/ML", capabilities: ["llm-observability", "tracing"], foundation: "independent", license: "MIT", packageKeys: [{ system: "PYPI", name: "langfuse" }, { system: "NPM", name: "langfuse" }], status: "active", listedAt: "2024-04-12", ageDays: 400, rank: 48, scoreAnchor: 58.9, changeRate: 3.65, participants: 644, up: 66, flat: 18, down: 16, spark: [37, 39, 42, 46, 50, 55, 61, 68] },
  { id: "open-webui", slug: "open-webui", name: "Open WebUI", repoOwner: "open-webui", repoName: "open-webui", sector: "ai-infra", category: "AI Application Layer", filter: "AI/ML", capabilities: ["ai-ui", "chat-interface"], foundation: "independent", license: "BSD-3-Clause", status: "active", listedAt: "2024-04-14", ageDays: 300, rank: 49, scoreAnchor: 58.4, changeRate: 4.46, participants: 982, up: 71, flat: 15, down: 14, spark: [35, 38, 42, 47, 53, 60, 67, 75] },
  { id: "dagger", slug: "dagger", name: "Dagger", repoOwner: "dagger", repoName: "dagger", sector: "developer-tooling", category: "Developer Automation", filter: "Delivery", capabilities: ["automation", "pipelines"], foundation: "independent", license: "Apache-2.0", status: "active", listedAt: "2024-04-16", ageDays: 1200, rank: 50, scoreAnchor: 58.0, changeRate: 1.58, participants: 522, up: 57, flat: 22, down: 21, spark: [41, 42, 43, 44, 46, 48, 50, 53] },
];

export const MARKET_INSTRUMENTS: OssInstrument[] = MARKET_PROJECT_SEEDS.map(
  ({ rank, scoreAnchor, changeRate, participants, up, flat, down, spark, ...instrument }) => instrument,
);
