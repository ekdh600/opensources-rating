from datetime import date
from pydantic import BaseModel

from app.schemas.project import ProjectSummary


class LeaderboardEntry(BaseModel):
    rank: int
    project: ProjectSummary
    total_score: float
    attention_score: float
    execution_score: float
    health_score: float
    trust_score: float
    rank_change: int | None = None
    anomaly_flag: bool = False


class LeaderboardResponse(BaseModel):
    date: date
    total_count: int
    page: int
    page_size: int
    entries: list[LeaderboardEntry]


class RisingEntry(BaseModel):
    rank: int
    project: ProjectSummary
    total_score: float
    score_change_30d: float
    stars_delta_30d: int | None = None
    momentum_summary_ko: str | None = None
