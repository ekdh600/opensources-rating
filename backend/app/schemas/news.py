from datetime import datetime

from pydantic import BaseModel


class NewsLinkedProjectOut(BaseModel):
    slug: str
    name: str
    relation_type: str
    confidence: float


class NewsArticleOut(BaseModel):
    id: int
    title: str
    summary_ko: str
    market_impact_ko: str | None = None
    source_name: str
    source_type: str
    source_url: str
    canonical_url: str
    published_at: datetime
    collected_at: datetime
    importance_score: float
    interest_score: float
    final_score: float
    grade: str | None = None
    status: str
    linked_projects: list[NewsLinkedProjectOut]


class NewsHeadlineResponse(BaseModel):
    items: list[NewsArticleOut]
    total_count: int


class NewsAnalysisFeedResponse(BaseModel):
    generated_at: datetime
    headlines: list[NewsArticleOut]
    project_focus: list[NewsArticleOut]
