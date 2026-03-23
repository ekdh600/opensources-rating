from datetime import date, datetime
from pydantic import BaseModel, Field


# --- Auth ---
class UserRegister(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: str
    display_name: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=6)


class UserLogin(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserProfile(BaseModel):
    id: int
    username: str
    display_name: str
    points_balance: int
    level: int
    experience: int
    reputation_score: float
    foresight_score: float
    total_predictions: int
    total_hits: int
    current_streak: int
    best_streak: int
    level_title_ko: str = ""
    level_title_en: str = ""

    model_config = {"from_attributes": True}


# --- Season ---
class SeasonOut(BaseModel):
    id: int
    name: str
    slug: str
    start_date: date
    end_date: date
    status: str
    initial_points: int
    is_current: bool
    settlement_threshold_up: float
    settlement_threshold_down: float

    model_config = {"from_attributes": True}


# --- Prediction ---
class PredictionCreate(BaseModel):
    project_slug: str
    position: str = Field(pattern="^(up|neutral|down)$")
    points_staked: int = Field(gt=0)
    reason: str | None = None


class PredictionOut(BaseModel):
    id: int
    project_id: int
    season_id: int
    position: str
    points_staked: int
    reason: str | None
    base_score: float
    base_date: date
    maturity_date: date
    status: str
    final_score: float | None
    score_change_pct: float | None
    actual_outcome: str | None
    points_earned: int | None
    difficulty_bonus: float | None
    created_at: datetime

    model_config = {"from_attributes": True}


# --- Product (커뮤니티 기대치 집계) ---
class ProductOut(BaseModel):
    id: int
    project_id: int
    season_id: int
    product_name: str
    base_score: float
    base_date: date
    maturity_date: date
    total_predictions: int
    up_ratio: float
    neutral_ratio: float
    down_ratio: float
    weighted_up_ratio: float
    weighted_neutral_ratio: float
    weighted_down_ratio: float
    community_expected_score: float | None
    is_settled: bool

    model_config = {"from_attributes": True}


# --- Season Result ---
class SeasonResultOut(BaseModel):
    season_rank: int | None
    total_predictions: int
    total_hits: int
    accuracy_rate: float
    points_start: int
    points_end: int
    points_profit: int
    best_streak: int
    season_reputation: float
    season_foresight: float
    contrarian_hits: int
    early_hits: int

    model_config = {"from_attributes": True}


# --- Season Ranking ---
class SeasonRankEntry(BaseModel):
    rank: int
    user: UserProfile
    accuracy_rate: float
    points_profit: int
    season_reputation: float


# --- Badge ---
class BadgeOut(BaseModel):
    id: int
    slug: str
    name_ko: str
    name_en: str
    description_ko: str
    description_en: str
    icon: str
    rarity: str

    model_config = {"from_attributes": True}


class UserBadgeOut(BaseModel):
    badge: BadgeOut
    season_name: str | None = None
    awarded_at: datetime

    model_config = {"from_attributes": True}
