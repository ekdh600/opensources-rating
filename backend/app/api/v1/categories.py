from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.category import Category
from app.schemas.project import CategoryOut

router = APIRouter(prefix="/categories", tags=["카테고리"])


@router.get("", response_model=list[CategoryOut])
async def list_categories(db: AsyncSession = Depends(get_db)):
    """카테고리 목록 조회"""
    stmt = select(Category).order_by(Category.sort_order)
    result = await db.execute(stmt)
    categories = result.scalars().all()
    return [CategoryOut.model_validate(c) for c in categories]


@router.get("/{slug}/leaderboard", response_model=dict)
async def category_leaderboard(
    slug: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """카테고리별 리더보드"""
    from app.repositories.project_repo import ProjectRepository
    from app.repositories.score_repo import ScoreRepository
    from app.schemas.project import ProjectSummary
    from app.schemas.leaderboard import LeaderboardEntry
    from datetime import date

    proj_repo = ProjectRepository(db)
    projects, total = await proj_repo.list_projects(
        category_slug=slug, page=page, page_size=page_size
    )

    score_repo = ScoreRepository(db)
    entries = []
    for p in projects:
        score = await score_repo.get_latest_score(p.id)
        if score:
            entries.append(
                LeaderboardEntry(
                    rank=score.rank_category or 0,
                    project=ProjectSummary.model_validate(p),
                    total_score=score.total_score,
                    attention_score=score.attention_score,
                    execution_score=score.execution_score,
                    health_score=score.health_score,
                    trust_score=score.trust_score,
                    anomaly_flag=score.anomaly_flag,
                )
            )

    entries.sort(key=lambda e: e.total_score, reverse=True)
    return {
        "category": slug,
        "date": date.today(),
        "total_count": total,
        "page": page,
        "page_size": page_size,
        "entries": entries,
    }
