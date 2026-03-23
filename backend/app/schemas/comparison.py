from datetime import date
from pydantic import BaseModel

from app.schemas.project import ProjectSummary
from app.schemas.score import ScoreOut


class ComparisonItem(BaseModel):
    project: ProjectSummary
    latest_score: ScoreOut | None = None
    stars_total: int | None = None
    forks_total: int | None = None
    contributors_30d: int | None = None
    commits_30d: int | None = None
    prs_merged_30d: int | None = None
    issues_closed_30d: int | None = None
    last_release_at: str | None = None


class ComparisonResponse(BaseModel):
    date: date
    items: list[ComparisonItem]
    summary_ko: str | None = None
