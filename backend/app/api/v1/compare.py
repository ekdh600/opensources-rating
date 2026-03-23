from datetime import date

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.project_repo import ProjectRepository
from app.repositories.score_repo import ScoreRepository
from app.repositories.metric_repo import MetricRepository
from app.schemas.project import ProjectSummary
from app.schemas.score import ScoreOut
from app.schemas.comparison import ComparisonResponse, ComparisonItem

router = APIRouter(prefix="/compare", tags=["비교"])


@router.get("", response_model=ComparisonResponse)
async def compare_projects(
    projects: str = Query(..., description="쉼표로 구분된 프로젝트 slug (2~3개)"),
    db: AsyncSession = Depends(get_db),
):
    """프로젝트 비교"""
    slugs = [s.strip() for s in projects.split(",") if s.strip()]
    if len(slugs) < 2 or len(slugs) > 3:
        raise HTTPException(
            status_code=400,
            detail="비교할 프로젝트를 2~3개 지정해주세요",
        )

    proj_repo = ProjectRepository(db)
    score_repo = ScoreRepository(db)
    metric_repo = MetricRepository(db)

    items = []
    for slug in slugs:
        project = await proj_repo.get_by_slug(slug)
        if not project:
            # 라우트 404와 구분: 잘못된 슬러그는 400
            raise HTTPException(
                status_code=400,
                detail=f"프로젝트를 찾을 수 없습니다: {slug}",
            )

        score = await score_repo.get_latest_score(project.id)
        metric = await metric_repo.get_latest_metric(project.id)

        items.append(
            ComparisonItem(
                project=ProjectSummary.model_validate(project),
                latest_score=ScoreOut.model_validate(score) if score else None,
                stars_total=metric.stars_total if metric else None,
                forks_total=metric.forks_total if metric else None,
                contributors_30d=metric.contributors_30d if metric else None,
                commits_30d=metric.commits_30d if metric else None,
                prs_merged_30d=metric.prs_merged_30d if metric else None,
                issues_closed_30d=metric.issues_closed_30d if metric else None,
                last_release_at=str(metric.last_release_at) if metric and metric.last_release_at else None,
            )
        )

    return ComparisonResponse(
        date=date.today(),
        items=items,
    )
