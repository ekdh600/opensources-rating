from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.news import NewsArticle, NewsArticleProject, NewsSource
from app.models.project import Project
from app.schemas.news import (
    NewsAnalysisFeedResponse,
    NewsArticleOut,
    NewsHeadlineResponse,
    NewsLinkedProjectOut,
)

router = APIRouter(prefix="/news", tags=["뉴스"])


def _project_name(project: Project) -> str:
    return project.display_name_ko or project.display_name_en or project.slug


async def _serialize_articles(db: AsyncSession, articles: list[NewsArticle]) -> list[NewsArticleOut]:
    items: list[NewsArticleOut] = []
    for article in articles:
        source = article.source or await db.get(NewsSource, article.source_id)
        link_rows = (
            await db.execute(
                select(NewsArticleProject, Project)
                .join(Project, Project.id == NewsArticleProject.project_id)
                .where(NewsArticleProject.article_id == article.id)
                .order_by(desc(NewsArticleProject.confidence), Project.slug)
            )
        ).all()
        linked_projects = [
            NewsLinkedProjectOut(
                slug=project.slug,
                name=_project_name(project),
                relation_type=link.relation_type,
                confidence=round(link.confidence, 2),
            )
            for link, project in link_rows
        ]
        items.append(
            NewsArticleOut(
                id=article.id,
                title=article.title,
                summary_ko=article.summary_ko,
                market_impact_ko=article.market_impact_ko,
                source_name=source.name if source else "Unknown",
                source_type=source.source_type if source else "rss",
                source_url=article.source_url,
                canonical_url=article.canonical_url,
                published_at=article.published_at,
                collected_at=article.collected_at,
                importance_score=round(article.importance_score, 2),
                interest_score=round(article.interest_score, 2),
                final_score=round(article.final_score, 2),
                grade=article.grade,
                status=article.status,
                linked_projects=linked_projects,
            )
        )
    return items


@router.get("/headlines", response_model=NewsHeadlineResponse)
async def list_headlines(
    limit: int = Query(8, ge=1, le=30),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(NewsArticle)
        .where(NewsArticle.status == "processed")
        .order_by(desc(NewsArticle.final_score), desc(NewsArticle.published_at))
        .limit(limit)
    )
    articles = (await db.execute(stmt)).scalars().all()
    total_count = int(
        (await db.execute(select(func.count(NewsArticle.id)).where(NewsArticle.status == "processed"))).scalar() or 0
    )
    return NewsHeadlineResponse(
        items=await _serialize_articles(db, articles),
        total_count=total_count,
    )


@router.get("/projects/{slug}", response_model=NewsHeadlineResponse)
async def list_project_news(
    slug: str,
    limit: int = Query(8, ge=1, le=30),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(NewsArticle)
        .join(NewsArticleProject, NewsArticleProject.article_id == NewsArticle.id)
        .join(Project, Project.id == NewsArticleProject.project_id)
        .where(Project.slug == slug, NewsArticle.status == "processed")
        .order_by(desc(NewsArticle.published_at), desc(NewsArticle.final_score))
        .limit(limit)
    )
    articles = (await db.execute(stmt)).scalars().unique().all()
    total_count = int(
        (
            await db.execute(
                select(func.count(NewsArticle.id))
                .join(NewsArticleProject, NewsArticleProject.article_id == NewsArticle.id)
                .join(Project, Project.id == NewsArticleProject.project_id)
                .where(Project.slug == slug, NewsArticle.status == "processed")
            )
        ).scalar()
        or 0
    )
    return NewsHeadlineResponse(
        items=await _serialize_articles(db, articles),
        total_count=total_count,
    )


@router.get("/analysis-feed", response_model=NewsAnalysisFeedResponse)
async def get_analysis_feed(
    limit: int = Query(6, ge=1, le=20),
    db: AsyncSession = Depends(get_db),
):
    headlines_stmt = (
        select(NewsArticle)
        .where(NewsArticle.status == "processed")
        .order_by(desc(NewsArticle.final_score), desc(NewsArticle.published_at))
        .limit(limit)
    )
    project_focus_stmt = (
        select(NewsArticle)
        .join(NewsArticleProject, NewsArticleProject.article_id == NewsArticle.id)
        .where(NewsArticle.status == "processed", NewsArticleProject.relation_type == "primary")
        .order_by(desc(NewsArticle.published_at), desc(NewsArticle.final_score))
        .limit(limit)
    )
    headline_rows = (await db.execute(headlines_stmt)).scalars().unique().all()
    focus_rows = (await db.execute(project_focus_stmt)).scalars().unique().all()
    return NewsAnalysisFeedResponse(
        generated_at=datetime.utcnow(),
        headlines=await _serialize_articles(db, headline_rows),
        project_focus=await _serialize_articles(db, focus_rows),
    )
