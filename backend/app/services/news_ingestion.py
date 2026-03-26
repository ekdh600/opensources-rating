from dataclasses import dataclass
from datetime import datetime
from typing import Iterable

from app.models.project import Project


@dataclass(slots=True)
class KRSSSourceRecord:
    slug: str
    name: str
    source_type: str
    base_url: str
    feed_url: str | None = None


@dataclass(slots=True)
class KRSSArticleRecord:
    source_slug: str
    title: str
    source_url: str
    canonical_url: str
    summary_ko: str
    market_impact_ko: str | None
    published_at: datetime
    collected_at: datetime
    importance_score: float
    interest_score: float
    final_score: float
    grade: str | None
    status: str = "processed"


def map_article_to_projects(title: str, summary: str, projects: Iterable[Project]) -> list[tuple[Project, str, float]]:
    haystack = f"{title} {summary}".lower()
    matches: list[tuple[Project, str, float]] = []
    for project in projects:
        aliases = {
            project.slug.lower(),
            (project.display_name_en or "").lower(),
            (project.display_name_ko or "").lower(),
        }
        for alias in aliases:
            if alias and alias in haystack:
                relation_type = "primary" if alias in title.lower() else "mentioned"
                confidence = 0.92 if relation_type == "primary" else 0.71
                matches.append((project, relation_type, confidence))
                break
    return matches


def calculate_editorial_score(importance_score: float, interest_score: float) -> float:
    return round((importance_score * 0.6 + interest_score * 0.4) * 10, 2)
