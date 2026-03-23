import type {
  BadgeInfo,
  ComparisonItem,
  ExplanationOut,
  LeaderboardEntry,
  PredictionItem,
  ProjectSummary,
  ScoreOut,
} from "@/types";
import type { AxisKey } from "@/lib/utils";

export interface LocalizedText {
  ko: string;
  en: string;
}

export interface CategorySummary {
  slug: string;
  name: LocalizedText;
  summary: LocalizedText;
  count: number;
  dominantAxis: AxisKey;
}

export interface ProjectModel {
  summary: ProjectSummary;
  description: LocalizedText;
  repo: string;
  homepage: string;
  scores: {
    attention: number;
    execution: number;
    health: number;
    trust: number;
    total: number;
  };
  ranking: {
    global: number;
    cncf: number | null;
    category: number | null;
    rising: number | null;
    change: number | null;
  };
  metrics: {
    stars: number;
    forks: number;
    contributors: number;
    commits: number;
    prsMerged: number;
    issuesClosed: number;
    releases: number;
  };
  highlight: LocalizedText;
  explanation: ExplanationOut;
  trend: { date: string; score: number; expected: number }[];
  market: {
    upRatio: number;
    neutralRatio: number;
    downRatio: number;
    weightedUp: number;
    weightedNeutral: number;
    weightedDown: number;
    totalPredictions: number;
  };
  relatedSlugs: string[];
}

export interface RisingSignal {
  rank: number;
  slug: string;
  deltaPct: number;
  weeklyStars: number;
  summary: LocalizedText;
}

export interface PredictionProductCard {
  slug: string;
  name: LocalizedText;
  score: number;
  up: number;
  neutral: number;
  down: number;
  total: number;
}

export interface PredictorSummary {
  rank: number;
  username: string;
  display: string;
  level: number;
  titleKo: string;
  titleEn: string;
  accuracy: number;
  profit: number;
  reputation: number;
  foresight?: number;
  totalPredictions?: number;
  streak?: number;
}

export interface UserSummary {
  display_name: string;
  username: string;
  points_balance: number;
  level: number;
  titleKo: string;
  titleEn: string;
  totalPredictions: number;
  totalHits: number;
  streak: number;
  reputation: number;
}

const categories = {
  kubernetes: {
    id: 1,
    slug: "kubernetes",
    name_ko: "쿠버네티스",
    name_en: "Kubernetes",
    parent_id: null,
    sort_order: 1,
  },
  observability: {
    id: 2,
    slug: "observability",
    name_ko: "관측성",
    name_en: "Observability",
    parent_id: null,
    sort_order: 2,
  },
  networking: {
    id: 3,
    slug: "networking-cni",
    name_ko: "네트워킹/CNI",
    name_en: "Networking/CNI",
    parent_id: null,
    sort_order: 3,
  },
  cicd: {
    id: 4,
    slug: "cicd",
    name_ko: "CI/CD",
    name_en: "CI/CD",
    parent_id: null,
    sort_order: 4,
  },
  gateway: {
    id: 5,
    slug: "ingress-api-gateway",
    name_ko: "인그레스/API 게이트웨이",
    name_en: "Ingress/API Gateway",
    parent_id: null,
    sort_order: 5,
  },
  database: {
    id: 6,
    slug: "database",
    name_ko: "데이터베이스",
    name_en: "Database",
    parent_id: null,
    sort_order: 6,
  },
  iac: {
    id: 7,
    slug: "iac",
    name_ko: "IaC",
    name_en: "Infrastructure as Code",
    parent_id: null,
    sort_order: 7,
  },
} as const;

const projectSummary = (
  id: number,
  slug: string,
  ko: string,
  en: string,
  shortKo: string,
  foundation_type: string | null,
  cncf_stage: string | null,
  category: ProjectSummary["category"],
  primary_language: string
): ProjectSummary => ({
  id,
  slug,
  display_name_ko: ko,
  display_name_en: en,
  short_description_ko: shortKo,
  foundation_type,
  cncf_stage,
  category,
  primary_language,
  logo_url: null,
  is_active: true,
});

const createTrend = (base: number, slope: number, wave: number) =>
  Array.from({ length: 8 }, (_, index) => {
    const score = base + slope * index + Math.sin(index * 0.75) * wave;
    return {
      date: `2026-03-${String(index * 3 + 1).padStart(2, "0")}`,
      score: Number(score.toFixed(1)),
      expected: Number((base + slope * index * 0.86).toFixed(1)),
    };
  });

const createExplanation = (params: {
  projectId: number;
  date: string;
  summaryKo: string;
  summaryEn: string;
  momentumKo: string;
  positives: { factor: string; ko: string; en: string; score: number }[];
  negatives: { factor: string; ko: string; en: string; score: number }[];
  anomaly?: string | null;
}): ExplanationOut => ({
  project_id: params.projectId,
  score_date: params.date,
  summary_ko: params.summaryKo,
  summary_en: params.summaryEn,
  top_positive_factors: params.positives.map((factor) => ({
    factor: factor.factor,
    label_ko: factor.ko,
    label_en: factor.en,
    score: factor.score,
  })),
  top_negative_factors: params.negatives.map((factor) => ({
    factor: factor.factor,
    label_ko: factor.ko,
    label_en: factor.en,
    score: factor.score,
  })),
  momentum_summary_ko: params.momentumKo,
  anomaly_summary_ko: params.anomaly ?? null,
});

export const projectModels: Record<string, ProjectModel> = {
  kubernetes: {
    summary: projectSummary(
      1,
      "kubernetes",
      "쿠버네티스",
      "Kubernetes",
      "프로덕션 등급 컨테이너 오케스트레이션",
      "cncf",
      "graduated",
      categories.kubernetes,
      "Go"
    ),
    description: {
      ko: "클러스터 운영 자동화와 폭넓은 생태계 확장성이 강점인 표준 오케스트레이션 플랫폼입니다.",
      en: "The standard orchestration platform with strong automation and a broad ecosystem.",
    },
    repo: "https://github.com/kubernetes/kubernetes",
    homepage: "https://kubernetes.io",
    scores: {
      attention: 91.2,
      execution: 89.5,
      health: 78.4,
      trust: 82.1,
      total: 87.3,
    },
    ranking: { global: 1, cncf: 1, category: 1, rising: 6, change: 0 },
    metrics: {
      stars: 112000,
      forks: 39000,
      contributors: 180,
      commits: 450,
      prsMerged: 320,
      issuesClosed: 280,
      releases: 8,
    },
    highlight: {
      ko: "여전히 가장 넓은 생태계와 유지보수 규모를 유지합니다.",
      en: "Still leads in ecosystem depth and maintainer scale.",
    },
    explanation: createExplanation({
      projectId: 1,
      date: "2026-03-19",
      summaryKo:
        "쿠버네티스는 실행력과 관심도 모두 최상위권이며, 대규모 기여자 기반이 총점을 견인합니다.",
      summaryEn:
        "Kubernetes stays near the top on both execution and attention thanks to its broad contributor base.",
      momentumKo:
        "최근 릴리스 cadence와 커뮤니티 이벤트가 겹치며 점수 흐름이 안정적으로 상승했습니다.",
      positives: [
        { factor: "contributors", ko: "기여자 규모", en: "Contributor breadth", score: 93.4 },
        { factor: "prs", ko: "PR 병합량", en: "Merged PR volume", score: 89.8 },
        { factor: "release", ko: "릴리스 cadence", en: "Release cadence", score: 85.5 },
      ],
      negatives: [
        { factor: "response", ko: "응답 속도", en: "Maintainer response", score: 35.1 },
        { factor: "stale", ko: "오래된 이슈 비율", en: "Stale issue ratio", score: 29.2 },
      ],
    }),
    trend: createTrend(80, 1.05, 2.6),
    market: {
      upRatio: 0.55,
      neutralRatio: 0.3,
      downRatio: 0.15,
      weightedUp: 0.6,
      weightedNeutral: 0.28,
      weightedDown: 0.12,
      totalPredictions: 48,
    },
    relatedSlugs: ["cilium", "etcd", "argo-cd"],
  },
  grafana: {
    summary: projectSummary(
      7,
      "grafana",
      "그라파나",
      "Grafana",
      "관측성 대시보드와 시각화 도구",
      "independent",
      null,
      categories.observability,
      "TypeScript"
    ),
    description: {
      ko: "관측성 도구군에서 가장 넓은 시각화 레이어를 담당하며 사용자 저변이 매우 넓습니다.",
      en: "A widely adopted observability visualization layer with a massive user base.",
    },
    repo: "https://github.com/grafana/grafana",
    homepage: "https://grafana.com",
    scores: {
      attention: 88.5,
      execution: 86.2,
      health: 76.8,
      trust: 79.5,
      total: 84.6,
    },
    ranking: { global: 2, cncf: null, category: 1, rising: 3, change: 1 },
    metrics: {
      stars: 66000,
      forks: 13000,
      contributors: 125,
      commits: 380,
      prsMerged: 260,
      issuesClosed: 210,
      releases: 11,
    },
    highlight: {
      ko: "시각화 레이어에서 높은 브랜드 파워와 꾸준한 릴리스 속도를 보입니다.",
      en: "Shows strong brand power and release cadence in the visualization layer.",
    },
    explanation: createExplanation({
      projectId: 7,
      date: "2026-03-19",
      summaryKo:
        "그라파나는 관심도와 실행력이 모두 높고 릴리스 신선도가 우수해 상위권을 유지합니다.",
      summaryEn:
        "Grafana combines strong attention with release freshness to remain near the top.",
      momentumKo:
        "플러그인 생태계 확장과 엔터프라이즈 채택 확산이 단기 관심도를 지지하고 있습니다.",
      positives: [
        { factor: "stars", ko: "브랜드 관심도", en: "Brand attention", score: 90.2 },
        { factor: "release", ko: "릴리스 최신성", en: "Release freshness", score: 87.4 },
        { factor: "issues", ko: "이슈 처리량", en: "Issue throughput", score: 82.1 },
      ],
      negatives: [
        { factor: "security", ko: "보안 신호", en: "Security signal", score: 41.6 },
        { factor: "deps", ko: "의존성 복잡도", en: "Dependency complexity", score: 39.4 },
      ],
    }),
    trend: createTrend(74, 1.12, 2.1),
    market: {
      upRatio: 0.41,
      neutralRatio: 0.38,
      downRatio: 0.21,
      weightedUp: 0.44,
      weightedNeutral: 0.34,
      weightedDown: 0.22,
      totalPredictions: 28,
    },
    relatedSlugs: ["prometheus", "envoy", "docker"],
  },
  prometheus: {
    summary: projectSummary(
      2,
      "prometheus",
      "프로메테우스",
      "Prometheus",
      "시스템 모니터링 및 알림 도구",
      "cncf",
      "graduated",
      categories.observability,
      "Go"
    ),
    description: {
      ko: "핵심 CNCF 관측성 프로젝트로서 유지보수 안정성과 생태계 연결성이 높습니다.",
      en: "A core CNCF observability project with strong ecosystem connectivity.",
    },
    repo: "https://github.com/prometheus/prometheus",
    homepage: "https://prometheus.io",
    scores: {
      attention: 82.1,
      execution: 80.4,
      health: 74.2,
      trust: 77.9,
      total: 79.8,
    },
    ranking: { global: 3, cncf: 2, category: 2, rising: 5, change: -1 },
    metrics: {
      stars: 57000,
      forks: 9800,
      contributors: 92,
      commits: 240,
      prsMerged: 174,
      issuesClosed: 162,
      releases: 6,
    },
    highlight: {
      ko: "지속적인 유지보수와 넓은 CNCF 연동성이 강점입니다.",
      en: "Steady maintenance and broad CNCF integrations are major strengths.",
    },
    explanation: createExplanation({
      projectId: 2,
      date: "2026-03-19",
      summaryKo:
        "프로메테우스는 신뢰도와 건강도가 고르게 높고, 유지보수 안정성이 강점입니다.",
      summaryEn:
        "Prometheus stays balanced with strong trust and health characteristics.",
      momentumKo:
        "점수 급등은 크지 않지만, 장기적으로 매우 안정적인 상승 흐름을 유지합니다.",
      positives: [
        { factor: "health", ko: "유지보수 안정성", en: "Maintenance stability", score: 84.9 },
        { factor: "trust", ko: "신뢰도", en: "Trust posture", score: 80.6 },
        { factor: "ecosystem", ko: "생태계 연결성", en: "Ecosystem fit", score: 79.1 },
      ],
      negatives: [
        { factor: "growth", ko: "급격한 관심도 증가", en: "Short-term attention surge", score: 36.8 },
        { factor: "response", ko: "응답 속도", en: "Response time", score: 34.4 },
      ],
    }),
    trend: createTrend(71, 0.84, 1.9),
    market: {
      upRatio: 0.35,
      neutralRatio: 0.45,
      downRatio: 0.2,
      weightedUp: 0.38,
      weightedNeutral: 0.43,
      weightedDown: 0.19,
      totalPredictions: 36,
    },
    relatedSlugs: ["grafana", "envoy", "kubernetes"],
  },
  istio: {
    summary: projectSummary(
      6,
      "istio",
      "이스티오",
      "Istio",
      "서비스 메시 플랫폼",
      "cncf",
      "graduated",
      categories.networking,
      "Go"
    ),
    description: {
      ko: "서비스 메시 영역의 대표 프로젝트로 실행력은 높지만 학습 난이도가 리스크로 남습니다.",
      en: "A flagship service mesh project with strong execution but higher adoption friction.",
    },
    repo: "https://github.com/istio/istio",
    homepage: "https://istio.io",
    scores: {
      attention: 79,
      execution: 77.8,
      health: 71.5,
      trust: 75.2,
      total: 76.5,
    },
    ranking: { global: 4, cncf: 3, category: 2, rising: null, change: 0 },
    metrics: {
      stars: 37000,
      forks: 7700,
      contributors: 60,
      commits: 180,
      prsMerged: 120,
      issuesClosed: 80,
      releases: 5,
    },
    highlight: {
      ko: "대형 엔터프라이즈 운영 경험과 풍부한 기능 세트가 강점입니다.",
      en: "Enterprise operating experience and a rich feature set keep it relevant.",
    },
    explanation: createExplanation({
      projectId: 6,
      date: "2026-03-19",
      summaryKo:
        "이스티오는 실행력은 강하지만, 채택 복잡도와 경쟁 심화가 관심도 성장에 제약을 줍니다.",
      summaryEn:
        "Istio executes well, though adoption complexity limits attention growth.",
      momentumKo:
        "최근에는 보수적인 상승세로, 신규 채택보다 기존 운영 안정화 신호가 강합니다.",
      positives: [
        { factor: "commits", ko: "개발 활동량", en: "Commit activity", score: 81.3 },
        { factor: "release", ko: "릴리스 관리", en: "Release management", score: 76.8 },
        { factor: "cncf", ko: "CNCF 성숙도", en: "CNCF maturity", score: 75.1 },
      ],
      negatives: [
        { factor: "attention", ko: "단기 관심도", en: "Short-term attention", score: 39.2 },
        { factor: "adoption", ko: "도입 복잡도", en: "Adoption complexity", score: 33.9 },
      ],
    }),
    trend: createTrend(68, 0.8, 1.5),
    market: {
      upRatio: 0.28,
      neutralRatio: 0.42,
      downRatio: 0.3,
      weightedUp: 0.27,
      weightedNeutral: 0.43,
      weightedDown: 0.3,
      totalPredictions: 18,
    },
    relatedSlugs: ["cilium", "envoy", "argo-cd"],
  },
  docker: {
    summary: projectSummary(
      9,
      "docker",
      "도커 (Moby)",
      "Docker (Moby)",
      "컨테이너 이미지와 개발 워크플로우의 표준 도구",
      "independent",
      null,
      categories.kubernetes,
      "Go"
    ),
    description: {
      ko: "브랜드 영향력은 여전히 크지만 핵심 인프라 영역에서는 실행력 편차가 존재합니다.",
      en: "Still commands strong brand power, with some execution variance in core infra.",
    },
    repo: "https://github.com/moby/moby",
    homepage: "https://www.docker.com",
    scores: {
      attention: 85.3,
      execution: 68.1,
      health: 65.4,
      trust: 72,
      total: 74.2,
    },
    ranking: { global: 5, cncf: null, category: 3, rising: null, change: 2 },
    metrics: {
      stars: 69000,
      forks: 18400,
      contributors: 48,
      commits: 122,
      prsMerged: 88,
      issuesClosed: 69,
      releases: 4,
    },
    highlight: {
      ko: "개발자 접점이 넓어 브랜드 관심도는 높게 유지됩니다.",
      en: "Broad developer touchpoints keep brand attention elevated.",
    },
    explanation: createExplanation({
      projectId: 9,
      date: "2026-03-19",
      summaryKo:
        "도커는 관심도는 높지만, 코어 저장소 차원의 실행력과 건강도는 상위권 대비 낮습니다.",
      summaryEn:
        "Docker remains highly visible, though execution and health trail the leaders.",
      momentumKo:
        "최근 관심도는 회복했지만 점수 구조는 브랜드 영향력에 더 크게 기대고 있습니다.",
      positives: [
        { factor: "brand", ko: "브랜드 파워", en: "Brand strength", score: 88.6 },
        { factor: "community", ko: "개발자 접점", en: "Developer reach", score: 80.3 },
      ],
      negatives: [
        { factor: "velocity", ko: "개발 속도", en: "Delivery velocity", score: 32.8 },
        { factor: "health", ko: "건강도", en: "Maintenance health", score: 38.7 },
      ],
    }),
    trend: createTrend(64, 1.05, 1.8),
    market: {
      upRatio: 0.49,
      neutralRatio: 0.31,
      downRatio: 0.2,
      weightedUp: 0.46,
      weightedNeutral: 0.33,
      weightedDown: 0.21,
      totalPredictions: 26,
    },
    relatedSlugs: ["kubernetes", "terraform", "grafana"],
  },
  cilium: {
    summary: projectSummary(
      5,
      "cilium",
      "실리움",
      "Cilium",
      "eBPF 기반 네트워킹과 보안, 관측성 플랫폼",
      "cncf",
      "graduated",
      categories.networking,
      "Go"
    ),
    description: {
      ko: "네트워킹과 보안, 관측성이 결합된 성장형 프로젝트로 급상승 모멘텀이 강합니다.",
      en: "A fast-growing project blending networking, security, and observability.",
    },
    repo: "https://github.com/cilium/cilium",
    homepage: "https://cilium.io",
    scores: {
      attention: 76.8,
      execution: 75.3,
      health: 68.2,
      trust: 70.5,
      total: 73.1,
    },
    ranking: { global: 6, cncf: 4, category: 1, rising: 1, change: 2 },
    metrics: {
      stars: 20000,
      forks: 2900,
      contributors: 55,
      commits: 150,
      prsMerged: 110,
      issuesClosed: 70,
      releases: 7,
    },
    highlight: {
      ko: "eBPF 흐름과 보안 수요 증가가 성장 모멘텀을 밀어주고 있습니다.",
      en: "eBPF adoption and security demand are powering its momentum.",
    },
    explanation: createExplanation({
      projectId: 5,
      date: "2026-03-19",
      summaryKo:
        "실리움은 급상승도 1위로, 최근 관심도와 실행력의 동반 상승이 돋보입니다.",
      summaryEn:
        "Cilium leads the rising chart with simultaneous gains in attention and execution.",
      momentumKo:
        "최근 30일은 커뮤니티 기대치와 실제 개발 활동이 함께 올라가는 구간입니다.",
      positives: [
        { factor: "momentum", ko: "모멘텀", en: "Momentum", score: 92.1 },
        { factor: "contributors", ko: "기여자 증가", en: "Contributor growth", score: 82.8 },
        { factor: "security", ko: "보안 포지셔닝", en: "Security positioning", score: 75.6 },
      ],
      negatives: [
        { factor: "response", ko: "응답 속도", en: "Response time", score: 37.2 },
        { factor: "release", ko: "릴리스 예측성", en: "Release predictability", score: 41.3 },
      ],
    }),
    trend: createTrend(61, 1.3, 2.4),
    market: {
      upRatio: 0.72,
      neutralRatio: 0.18,
      downRatio: 0.1,
      weightedUp: 0.76,
      weightedNeutral: 0.16,
      weightedDown: 0.08,
      totalPredictions: 32,
    },
    relatedSlugs: ["istio", "kubernetes", "envoy"],
  },
  envoy: {
    summary: projectSummary(
      3,
      "envoy",
      "엔보이",
      "Envoy",
      "클라우드 네이티브 고성능 프록시",
      "cncf",
      "graduated",
      categories.gateway,
      "C++"
    ),
    description: {
      ko: "인그레스와 서비스 메시 기반에서 여전히 강력한 핵심 인프라 역할을 수행합니다.",
      en: "Still a core infrastructure project across ingress and service mesh layers.",
    },
    repo: "https://github.com/envoyproxy/envoy",
    homepage: "https://www.envoyproxy.io",
    scores: {
      attention: 68.5,
      execution: 78.2,
      health: 67.1,
      trust: 68.9,
      total: 71.8,
    },
    ranking: { global: 7, cncf: 5, category: 1, rising: 4, change: -1 },
    metrics: {
      stars: 25000,
      forks: 4400,
      contributors: 58,
      commits: 172,
      prsMerged: 96,
      issuesClosed: 84,
      releases: 5,
    },
    highlight: {
      ko: "핵심 프록시 계층에서 꾸준한 유지보수와 높은 실행력이 두드러집니다.",
      en: "Consistent maintenance and execution remain key strengths in the proxy layer.",
    },
    explanation: createExplanation({
      projectId: 3,
      date: "2026-03-19",
      summaryKo:
        "엔보이는 실행력은 높지만 대중적 관심도 확산은 상대적으로 제한적입니다.",
      summaryEn:
        "Envoy executes strongly, though broader attention is more constrained.",
      momentumKo:
        "운영 안정성 중심의 개선이 이어지며 급격한 변동 없이 상승세를 유지합니다.",
      positives: [
        { factor: "exec", ko: "실행력", en: "Execution", score: 80.4 },
        { factor: "proxy", ko: "핵심 인프라성", en: "Critical infrastructure role", score: 78.8 },
      ],
      negatives: [
        { factor: "attention", ko: "대중 관심도", en: "Mass attention", score: 33.7 },
        { factor: "newcomer", ko: "신규 진입 난이도", en: "Newcomer entry cost", score: 35.4 },
      ],
    }),
    trend: createTrend(63, 0.88, 1.7),
    market: {
      upRatio: 0.34,
      neutralRatio: 0.39,
      downRatio: 0.27,
      weightedUp: 0.33,
      weightedNeutral: 0.41,
      weightedDown: 0.26,
      totalPredictions: 20,
    },
    relatedSlugs: ["istio", "cilium", "prometheus"],
  },
  etcd: {
    summary: projectSummary(
      10,
      "etcd",
      "etcd",
      "etcd",
      "분산 키-값 저장소",
      "cncf",
      "graduated",
      categories.database,
      "Go"
    ),
    description: {
      ko: "화려한 관심도보다 핵심 인프라 안정성에 강한 프로젝트입니다.",
      en: "A stability-first infrastructure project with quieter attention signals.",
    },
    repo: "https://github.com/etcd-io/etcd",
    homepage: "https://etcd.io",
    scores: {
      attention: 72.3,
      execution: 66.5,
      health: 64.8,
      trust: 71.2,
      total: 68.9,
    },
    ranking: { global: 8, cncf: 6, category: 1, rising: null, change: 1 },
    metrics: {
      stars: 49000,
      forks: 9700,
      contributors: 38,
      commits: 102,
      prsMerged: 68,
      issuesClosed: 60,
      releases: 3,
    },
    highlight: {
      ko: "기저 인프라로서 신뢰도 축이 점수를 지탱합니다.",
      en: "Trust posture is carrying much of its score as foundational infrastructure.",
    },
    explanation: createExplanation({
      projectId: 10,
      date: "2026-03-19",
      summaryKo:
        "etcd는 화려한 급상승보다는 신뢰도와 안정성 기반의 점수 구조를 보입니다.",
      summaryEn:
        "etcd relies more on trust and stability than short-term momentum.",
      momentumKo:
        "최근 점수는 완만한 회복세지만, 관심도보다는 안정성 개선이 중심입니다.",
      positives: [
        { factor: "trust", ko: "신뢰도", en: "Trust", score: 74.3 },
        { factor: "infra", ko: "핵심 인프라 역할", en: "Infrastructure role", score: 71.8 },
      ],
      negatives: [
        { factor: "attention", ko: "관심도", en: "Attention", score: 35.9 },
        { factor: "release", ko: "릴리스 빈도", en: "Release frequency", score: 37.4 },
      ],
    }),
    trend: createTrend(61, 0.72, 1.2),
    market: {
      upRatio: 0.31,
      neutralRatio: 0.49,
      downRatio: 0.2,
      weightedUp: 0.29,
      weightedNeutral: 0.51,
      weightedDown: 0.2,
      totalPredictions: 17,
    },
    relatedSlugs: ["kubernetes", "prometheus", "terraform"],
  },
  "argo-cd": {
    summary: projectSummary(
      4,
      "argo-cd",
      "Argo CD",
      "Argo CD",
      "GitOps 기반 지속적 배포 도구",
      "cncf",
      "graduated",
      categories.cicd,
      "Go"
    ),
    description: {
      ko: "GitOps 채택 확대의 수혜를 받으며 비교적 빠르게 관심도를 회복한 프로젝트입니다.",
      en: "Benefiting from growing GitOps adoption with renewed attention.",
    },
    repo: "https://github.com/argoproj/argo-cd",
    homepage: "https://argo-cd.readthedocs.io",
    scores: {
      attention: 70.1,
      execution: 68.9,
      health: 62.3,
      trust: 65.7,
      total: 67.4,
    },
    ranking: { global: 9, cncf: 7, category: 1, rising: 2, change: 2 },
    metrics: {
      stars: 21000,
      forks: 6800,
      contributors: 46,
      commits: 136,
      prsMerged: 98,
      issuesClosed: 74,
      releases: 6,
    },
    highlight: {
      ko: "GitOps 도입 흐름과 함께 모멘텀 회복이 빠른 편입니다.",
      en: "Momentum recovery is strong alongside GitOps adoption.",
    },
    explanation: createExplanation({
      projectId: 4,
      date: "2026-03-19",
      summaryKo:
        "Argo CD는 모멘텀이 빠르게 회복 중이지만, 건강도와 신뢰도는 보수적으로 봐야 합니다.",
      summaryEn:
        "Argo CD is regaining momentum quickly, while health and trust remain mixed.",
      momentumKo:
        "최근 30일은 스타 성장과 커밋 활동이 동시에 증가한 구간입니다.",
      positives: [
        { factor: "gitops", ko: "GitOps 수요", en: "GitOps demand", score: 83.1 },
        { factor: "momentum", ko: "단기 모멘텀", en: "Short-term momentum", score: 81.6 },
      ],
      negatives: [
        { factor: "response", ko: "응답 속도", en: "Response time", score: 34.7 },
        { factor: "stale", ko: "백로그 누적", en: "Backlog pressure", score: 32.9 },
      ],
    }),
    trend: createTrend(57, 1.18, 2.3),
    market: {
      upRatio: 0.63,
      neutralRatio: 0.22,
      downRatio: 0.15,
      weightedUp: 0.66,
      weightedNeutral: 0.21,
      weightedDown: 0.13,
      totalPredictions: 22,
    },
    relatedSlugs: ["terraform", "kubernetes", "cilium"],
  },
  terraform: {
    summary: projectSummary(
      8,
      "terraform",
      "테라폼",
      "Terraform",
      "Infrastructure as Code 도구",
      "independent",
      null,
      categories.iac,
      "Go"
    ),
    description: {
      ko: "IaC 표준 도구로 높은 인지도는 유지하지만 제품 전략 변화에 대한 민감도가 큽니다.",
      en: "A leading IaC tool with high awareness and more visible strategy sensitivity.",
    },
    repo: "https://github.com/hashicorp/terraform",
    homepage: "https://www.terraform.io",
    scores: {
      attention: 78.2,
      execution: 59.8,
      health: 58.5,
      trust: 62.3,
      total: 65.1,
    },
    ranking: { global: 10, cncf: null, category: 1, rising: null, change: -2 },
    metrics: {
      stars: 45000,
      forks: 9500,
      contributors: 40,
      commits: 88,
      prsMerged: 61,
      issuesClosed: 52,
      releases: 4,
    },
    highlight: {
      ko: "높은 인지도와 시장 존재감이 점수의 주요 기반입니다.",
      en: "High awareness and market presence remain the backbone of its score.",
    },
    explanation: createExplanation({
      projectId: 8,
      date: "2026-03-19",
      summaryKo:
        "테라폼은 관심도는 높지만 실행력과 건강도가 최근 상대적으로 둔화된 모습입니다.",
      summaryEn:
        "Terraform keeps strong attention, while execution and health have cooled recently.",
      momentumKo:
        "새로운 관심도 유입은 존재하지만 실질적인 전달 속도는 다소 보수적입니다.",
      positives: [
        { factor: "attention", ko: "시장 인지도", en: "Market awareness", score: 82.4 },
        { factor: "ecosystem", ko: "생태계 범위", en: "Ecosystem breadth", score: 74.1 },
      ],
      negatives: [
        { factor: "velocity", ko: "전달 속도", en: "Delivery velocity", score: 28.9 },
        { factor: "health", ko: "건강도", en: "Maintenance health", score: 31.4 },
      ],
    }),
    trend: createTrend(55, 0.7, 1.4),
    market: {
      upRatio: 0.29,
      neutralRatio: 0.41,
      downRatio: 0.3,
      weightedUp: 0.28,
      weightedNeutral: 0.38,
      weightedDown: 0.34,
      totalPredictions: 19,
    },
    relatedSlugs: ["argo-cd", "docker", "kubernetes"],
  },
};

const scoreOutFor = (slug: string): ScoreOut => {
  const project = projectModels[slug];
  return {
    project_id: project.summary.id,
    score_date: "2026-03-19",
    attention_score: project.scores.attention,
    execution_score: project.scores.execution,
    health_score: project.scores.health,
    trust_score: project.scores.trust,
    total_score: project.scores.total,
    rank_global: project.ranking.global,
    rank_cncf: project.ranking.cncf,
    rank_category: project.ranking.category,
    rising_rank: project.ranking.rising,
    anomaly_flag: false,
    scoring_version: "v1.0",
  };
};

const leaderboardEntryFor = (slug: string): LeaderboardEntry => {
  const project = projectModels[slug];
  return {
    rank: project.ranking.global,
    project: project.summary,
    total_score: project.scores.total,
    attention_score: project.scores.attention,
    execution_score: project.scores.execution,
    health_score: project.scores.health,
    trust_score: project.scores.trust,
    rank_change: project.ranking.change,
    anomaly_flag: false,
  };
};

export const projectCatalog = Object.values(projectModels)
  .map((item) => item.summary)
  .sort((left, right) => left.display_name_en.localeCompare(right.display_name_en));

export const globalLeaderboard = [
  "kubernetes",
  "grafana",
  "prometheus",
  "istio",
  "docker",
  "cilium",
  "envoy",
  "etcd",
  "argo-cd",
  "terraform",
].map(leaderboardEntryFor);

export const cncfLeaderboard = [
  "kubernetes",
  "prometheus",
  "istio",
  "cilium",
  "envoy",
  "etcd",
  "argo-cd",
].map(leaderboardEntryFor);

export const categorySummaries: CategorySummary[] = [
  {
    slug: "kubernetes",
    name: { ko: "쿠버네티스", en: "Kubernetes" },
    summary: {
      ko: "클러스터 오케스트레이션과 운영 자동화 중심",
      en: "Centered on orchestration and cluster operations",
    },
    count: 14,
    dominantAxis: "execution",
  },
  {
    slug: "observability",
    name: { ko: "관측성", en: "Observability" },
    summary: {
      ko: "모니터링, 대시보드, 텔레메트리 파이프라인",
      en: "Monitoring, dashboards, and telemetry pipelines",
    },
    count: 18,
    dominantAxis: "attention",
  },
  {
    slug: "networking-cni",
    name: { ko: "네트워킹/CNI", en: "Networking/CNI" },
    summary: {
      ko: "클러스터 네트워크, 서비스 메시, 정책 계층",
      en: "Cluster networking, service mesh, and policy layers",
    },
    count: 12,
    dominantAxis: "trust",
  },
  {
    slug: "cicd",
    name: { ko: "CI/CD", en: "CI/CD" },
    summary: {
      ko: "배포 파이프라인과 운영 자동화 흐름",
      en: "Delivery pipelines and release automation",
    },
    count: 11,
    dominantAxis: "attention",
  },
  {
    slug: "database",
    name: { ko: "데이터베이스", en: "Database" },
    summary: {
      ko: "코어 저장소와 운영 안정성이 중요한 영역",
      en: "An area where operational stability matters most",
    },
    count: 9,
    dominantAxis: "trust",
  },
  {
    slug: "ai-ml",
    name: { ko: "AI/ML", en: "AI/ML" },
    summary: {
      ko: "생태계 확장과 관심도 변동이 큰 고성장 영역",
      en: "A fast-growing area with volatile attention signals",
    },
    count: 16,
    dominantAxis: "attention",
  },
];

export const comparisonRecommendations = [
  {
    a: "cilium",
    b: "istio",
    title: { ko: "Cilium vs Istio", en: "Cilium vs Istio" },
    summary: {
      ko: "네트워킹 중심 접근과 서비스 메시 접근을 비교합니다.",
      en: "Compare networking-led and service-mesh-led approaches.",
    },
  },
  {
    a: "argo-cd",
    b: "terraform",
    title: { ko: "Argo CD vs Terraform", en: "Argo CD vs Terraform" },
    summary: {
      ko: "배포 자동화와 인프라 선언형 관리의 차이를 봅니다.",
      en: "Contrast GitOps delivery with infrastructure-as-code control.",
    },
  },
  {
    a: "prometheus",
    b: "grafana",
    title: { ko: "Prometheus vs Grafana", en: "Prometheus vs Grafana" },
    summary: {
      ko: "데이터 수집 계층과 시각화 계층의 역할을 나눠 봅니다.",
      en: "Break down collection versus visualization responsibilities.",
    },
  },
];

export const homeStats = [
  {
    label: { ko: "수집 프로젝트", en: "Tracked Projects" },
    value: "128",
    note: { ko: "일별 스냅샷 기준", en: "Daily snapshot coverage" },
  },
  {
    label: { ko: "CNCF 프로젝트", en: "CNCF Projects" },
    value: "46",
    note: { ko: "DevStats 심화 평가 포함", en: "Includes DevStats enrichment" },
  },
  {
    label: { ko: "최근 30일 급상승", en: "Rising in 30d" },
    value: "19",
    note: { ko: "상승률 기준 상위군", en: "Top movers by momentum" },
  },
];

export const risingSignals: RisingSignal[] = [
  {
    rank: 1,
    slug: "cilium",
    deltaPct: 12.5,
    weeklyStars: 340,
    summary: {
      ko: "eBPF와 보안 포지셔닝이 함께 강화되며 최근 기대치가 크게 올랐습니다.",
      en: "eBPF momentum and security positioning are lifting recent expectations.",
    },
  },
  {
    rank: 2,
    slug: "argo-cd",
    deltaPct: 8.2,
    weeklyStars: 210,
    summary: {
      ko: "GitOps 채택 증가 흐름을 타고 빠르게 반등하고 있습니다.",
      en: "Riding a broader GitOps adoption curve with a quick rebound.",
    },
  },
  {
    rank: 3,
    slug: "grafana",
    deltaPct: 6.1,
    weeklyStars: 280,
    summary: {
      ko: "시각화 레이어 확장과 제품군 확장이 관심도를 견인합니다.",
      en: "Visualization expansion and product breadth are driving attention.",
    },
  },
  {
    rank: 4,
    slug: "envoy",
    deltaPct: 5.8,
    weeklyStars: 150,
    summary: {
      ko: "조용하지만 꾸준한 실행력이 지표 개선으로 이어지고 있습니다.",
      en: "Quiet, steady execution is translating into improved metrics.",
    },
  },
  {
    rank: 5,
    slug: "prometheus",
    deltaPct: 4.3,
    weeklyStars: 180,
    summary: {
      ko: "급격한 반등보다는 안정적 회복 흐름이 눈에 띕니다.",
      en: "A stable recovery trend stands out more than a sharp rebound.",
    },
  },
];

export const marketProducts: PredictionProductCard[] = [
  {
    slug: "kubernetes",
    name: { ko: "쿠버네티스", en: "Kubernetes" },
    score: 87.3,
    up: 0.55,
    neutral: 0.3,
    down: 0.15,
    total: 48,
  },
  {
    slug: "cilium",
    name: { ko: "실리움", en: "Cilium" },
    score: 73.1,
    up: 0.72,
    neutral: 0.18,
    down: 0.1,
    total: 32,
  },
  {
    slug: "grafana",
    name: { ko: "그라파나", en: "Grafana" },
    score: 84.6,
    up: 0.41,
    neutral: 0.38,
    down: 0.21,
    total: 28,
  },
  {
    slug: "argo-cd",
    name: { ko: "Argo CD", en: "Argo CD" },
    score: 67.4,
    up: 0.63,
    neutral: 0.22,
    down: 0.15,
    total: 22,
  },
  {
    slug: "prometheus",
    name: { ko: "프로메테우스", en: "Prometheus" },
    score: 79.8,
    up: 0.35,
    neutral: 0.45,
    down: 0.2,
    total: 36,
  },
  {
    slug: "istio",
    name: { ko: "이스티오", en: "Istio" },
    score: 76.5,
    up: 0.28,
    neutral: 0.42,
    down: 0.3,
    total: 18,
  },
];

export const marketTrend = createTrend(84, 0.38, 2.5);

export const seasonRanking: PredictorSummary[] = [
  {
    rank: 1,
    username: "techseer",
    display: "테크시어",
    level: 35,
    titleKo: "트렌드 헌터",
    titleEn: "Trend Hunter",
    accuracy: 0.78,
    profit: 4200,
    reputation: 72.5,
  },
  {
    rank: 2,
    username: "ossvoyager",
    display: "OSS 보이저",
    level: 20,
    titleKo: "분석가",
    titleEn: "Analyst",
    accuracy: 0.71,
    profit: 3100,
    reputation: 65.3,
  },
  {
    rank: 3,
    username: "cloudnative_kr",
    display: "클라우드네이티브",
    level: 20,
    titleKo: "분석가",
    titleEn: "Analyst",
    accuracy: 0.68,
    profit: 2800,
    reputation: 61.8,
  },
  {
    rank: 4,
    username: "devops_master",
    display: "데브옵스마스터",
    level: 10,
    titleKo: "탐색자",
    titleEn: "Explorer",
    accuracy: 0.65,
    profit: 2200,
    reputation: 55.2,
  },
  {
    rank: 5,
    username: "k8s_fan",
    display: "쿠버마니아",
    level: 10,
    titleKo: "탐색자",
    titleEn: "Explorer",
    accuracy: 0.62,
    profit: 1800,
    reputation: 48.7,
  },
];

export const topPredictors: PredictorSummary[] = [
  {
    rank: 1,
    username: "early_adopter",
    display: "얼리어답터",
    level: 50,
    titleKo: "시그널 리더",
    titleEn: "Signal Reader",
    accuracy: 0.81,
    profit: 5600,
    reputation: 82.3,
    foresight: 78.5,
    totalPredictions: 45,
    streak: 7,
  },
  {
    rank: 2,
    username: "techseer",
    display: "테크시어",
    level: 35,
    titleKo: "트렌드 헌터",
    titleEn: "Trend Hunter",
    accuracy: 0.78,
    profit: 4200,
    reputation: 72.5,
    foresight: 68.2,
    totalPredictions: 38,
    streak: 5,
  },
  {
    rank: 3,
    username: "cloudnative_kr",
    display: "클라우드네이티브",
    level: 20,
    titleKo: "분석가",
    titleEn: "Analyst",
    accuracy: 0.71,
    profit: 2800,
    reputation: 65.3,
    foresight: 55.8,
    totalPredictions: 52,
    streak: 3,
  },
];

export const currentUser: UserSummary = {
  display_name: "테크시어",
  username: "techseer",
  points_balance: 12400,
  level: 35,
  titleKo: "트렌드 헌터",
  titleEn: "Trend Hunter",
  totalPredictions: 38,
  totalHits: 29,
  streak: 5,
  reputation: 72.5,
};

export const userPredictions: (PredictionItem & { projectName: string })[] = [
  {
    id: 1,
    project_id: 5,
    season_id: 1,
    position: "up",
    points_staked: 500,
    reason: "eBPF 생태계 성장과 Kubernetes 기본 CNI 채택 가능성",
    base_score: 73.1,
    base_date: "2026-03-01",
    maturity_date: "2026-05-30",
    status: "active",
    final_score: null,
    score_change_pct: null,
    actual_outcome: null,
    points_earned: null,
    difficulty_bonus: null,
    created_at: "2026-03-01T10:00:00",
    projectName: "실리움",
  },
  {
    id: 2,
    project_id: 4,
    season_id: 1,
    position: "up",
    points_staked: 300,
    reason: "GitOps 채택률 증가로 점수 회복 가능성이 높다고 판단",
    base_score: 67.4,
    base_date: "2026-03-05",
    maturity_date: "2026-06-03",
    status: "active",
    final_score: null,
    score_change_pct: null,
    actual_outcome: null,
    points_earned: null,
    difficulty_bonus: null,
    created_at: "2026-03-05T14:30:00",
    projectName: "Argo CD",
  },
  {
    id: 3,
    project_id: 6,
    season_id: 1,
    position: "down",
    points_staked: 400,
    reason: "서비스 메시 경쟁 심화로 단기 점수 조정 가능성이 있다고 봄",
    base_score: 76.5,
    base_date: "2026-02-15",
    maturity_date: "2026-05-16",
    status: "settled_hit",
    final_score: 65.2,
    score_change_pct: -14.8,
    actual_outcome: "down",
    points_earned: 920,
    difficulty_bonus: 2.1,
    created_at: "2026-02-15T09:00:00",
    projectName: "이스티오",
  },
];

export const badgeCatalog: BadgeInfo[] = [
  {
    id: 1,
    slug: "season_champion",
    name_ko: "시즌 챔피언",
    name_en: "Season Champion",
    description_ko: "시즌 최종 1위를 차지한 예측가",
    description_en: "Top predictor of the season",
    icon: "🏆",
    rarity: "legendary",
  },
  {
    id: 2,
    slug: "season_top10",
    name_ko: "상위 10 예측가",
    name_en: "Season Top 10",
    description_ko: "시즌 최종 TOP 10 진입",
    description_en: "Finished in season top 10",
    icon: "🥇",
    rarity: "epic",
  },
  {
    id: 3,
    slug: "accuracy_excellent",
    name_ko: "정확도 우수",
    name_en: "Accuracy Master",
    description_ko: "적중률 70% 이상 달성",
    description_en: "Achieved 70%+ accuracy",
    icon: "🎯",
    rarity: "rare",
  },
  {
    id: 4,
    slug: "undervalue_hunter",
    name_ko: "저평가 헌터",
    name_en: "Undervalue Hunter",
    description_ko: "저평가 프로젝트를 다수 적중",
    description_en: "Correctly predicted multiple undervalued projects",
    icon: "🔍",
    rarity: "epic",
  },
  {
    id: 5,
    slug: "contrarian_hit",
    name_ko: "역발상 적중자",
    name_en: "Contrarian Hit",
    description_ko: "다수 의견과 반대 포지션으로 적중",
    description_en: "Successfully went against the majority",
    icon: "🔄",
    rarity: "rare",
  },
  {
    id: 6,
    slug: "early_signal",
    name_ko: "얼리 시그널",
    name_en: "Early Signal",
    description_ko: "주목받기 전 프로젝트를 조기 포착",
    description_en: "Spotted projects before they gained attention",
    icon: "⚡",
    rarity: "epic",
  },
  {
    id: 7,
    slug: "streak_master",
    name_ko: "연속 적중왕",
    name_en: "Streak Master",
    description_ko: "10연속 적중 달성",
    description_en: "Achieved 10 consecutive hits",
    icon: "🔥",
    rarity: "rare",
  },
  {
    id: 8,
    slug: "first_prediction",
    name_ko: "첫 예측",
    name_en: "First Prediction",
    description_ko: "첫 예측 완료",
    description_en: "Made the first prediction",
    icon: "🌱",
    rarity: "common",
  },
];

export function pickText(locale: string, value: LocalizedText): string {
  return locale === "ko" ? value.ko : value.en;
}

export function getProjectModel(slug: string): ProjectModel {
  return projectModels[slug] ?? projectModels.kubernetes;
}

export function getComparisonItems(slugs: string[]): ComparisonItem[] {
  return slugs
    .map((slug) => projectModels[slug])
    .filter(Boolean)
    .map((project) => ({
      project: project.summary,
      latest_score: scoreOutFor(project.summary.slug),
      stars_total: project.metrics.stars,
      forks_total: project.metrics.forks,
      contributors_30d: project.metrics.contributors,
      commits_30d: project.metrics.commits,
      prs_merged_30d: project.metrics.prsMerged,
      issues_closed_30d: project.metrics.issuesClosed,
      last_release_at: project.explanation.score_date,
    }));
}
