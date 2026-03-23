export interface Category {
  id: number;
  slug: string;
  name_ko: string;
  name_en: string;
  parent_id: number | null;
  sort_order: number;
}

export interface ProjectSummary {
  id: number;
  slug: string;
  display_name_ko: string;
  display_name_en: string;
  short_description_ko: string | null;
  foundation_type: string | null;
  cncf_stage: string | null;
  category: Category | null;
  primary_language: string | null;
  logo_url: string | null;
  is_active: boolean;
}

export interface ProjectDetail extends ProjectSummary {
  short_description_en: string | null;
  primary_repo_url: string;
  homepage_url: string | null;
  aggregation_policy: string;
  sources: ProjectSource[];
  created_at: string;
  updated_at: string;
}

export interface ProjectSource {
  id: number;
  source_type: string;
  external_id: string | null;
  external_url: string | null;
  is_primary: boolean;
}

export interface ScoreOut {
  project_id: number;
  score_date: string;
  attention_score: number;
  execution_score: number;
  health_score: number;
  trust_score: number;
  total_score: number;
  rank_global: number | null;
  rank_cncf: number | null;
  rank_category: number | null;
  rising_rank: number | null;
  anomaly_flag: boolean;
  scoring_version: string;
}

export interface ScoreTrend {
  dates: string[];
  total_scores: number[];
  attention_scores: number[];
  execution_scores: number[];
  health_scores: number[];
  trust_scores: number[];
}

export interface LeaderboardEntry {
  rank: number;
  project: ProjectSummary;
  total_score: number;
  attention_score: number;
  execution_score: number;
  health_score: number;
  trust_score: number;
  rank_change: number | null;
  anomaly_flag: boolean;
}

export interface LeaderboardResponse {
  date: string;
  total_count: number;
  page: number;
  page_size: number;
  entries: LeaderboardEntry[];
}

export interface ExplanationOut {
  project_id: number;
  score_date: string;
  summary_ko: string | null;
  summary_en: string | null;
  top_positive_factors: { factor: string; label_ko: string; label_en: string; score: number }[] | null;
  top_negative_factors: { factor: string; label_ko: string; label_en: string; score: number }[] | null;
  momentum_summary_ko: string | null;
  anomaly_summary_ko: string | null;
}

export interface ComparisonItem {
  project: ProjectSummary;
  latest_score: ScoreOut | null;
  stars_total: number | null;
  forks_total: number | null;
  contributors_30d: number | null;
  commits_30d: number | null;
  prs_merged_30d: number | null;
  issues_closed_30d: number | null;
  last_release_at: string | null;
}

// --- 예측 시장 타입 (§20) ---

export interface UserProfile {
  id: number;
  username: string;
  display_name: string;
  points_balance: number;
  level: number;
  experience: number;
  reputation_score: number;
  foresight_score: number;
  total_predictions: number;
  total_hits: number;
  current_streak: number;
  best_streak: number;
  level_title_ko: string;
  level_title_en: string;
}

export interface SeasonInfo {
  id: number;
  name: string;
  slug: string;
  start_date: string;
  end_date: string;
  status: string;
  initial_points: number;
  is_current: boolean;
  settlement_threshold_up: number;
  settlement_threshold_down: number;
}

export interface PredictionItem {
  id: number;
  project_id: number;
  season_id: number;
  position: "up" | "neutral" | "down";
  points_staked: number;
  reason: string | null;
  base_score: number;
  base_date: string;
  maturity_date: string;
  status: string;
  final_score: number | null;
  score_change_pct: number | null;
  actual_outcome: string | null;
  points_earned: number | null;
  difficulty_bonus: number | null;
  created_at: string;
}

export interface PredictionProduct {
  id: number;
  project_id: number;
  season_id: number;
  product_name: string;
  base_score: number;
  base_date: string;
  maturity_date: string;
  total_predictions: number;
  up_ratio: number;
  neutral_ratio: number;
  down_ratio: number;
  weighted_up_ratio: number;
  weighted_neutral_ratio: number;
  weighted_down_ratio: number;
  community_expected_score: number | null;
  is_settled: boolean;
}

export interface BadgeInfo {
  id: number;
  slug: string;
  name_ko: string;
  name_en: string;
  description_ko: string;
  description_en: string;
  icon: string;
  rarity: string;
}

export interface UserBadgeInfo {
  badge: BadgeInfo;
  season_name: string | null;
  awarded_at: string;
}

export interface SeasonRankEntry {
  rank: number;
  user: UserProfile;
  accuracy_rate: number;
  points_profit: number;
  season_reputation: number;
}
