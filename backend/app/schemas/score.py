from datetime import date
from pydantic import BaseModel


class ScoreOut(BaseModel):
    project_id: int
    score_date: date
    attention_score: float
    execution_score: float
    health_score: float
    trust_score: float
    total_score: float
    rank_global: int | None = None
    rank_cncf: int | None = None
    rank_category: int | None = None
    rising_rank: int | None = None
    anomaly_flag: bool = False
    scoring_version: str

    model_config = {"from_attributes": True}


class ScoreTrend(BaseModel):
    dates: list[date]
    total_scores: list[float]
    attention_scores: list[float]
    execution_scores: list[float]
    health_scores: list[float]
    trust_scores: list[float]
