from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.project_repo import ProjectRepository
from app.repositories.score_repo import ScoreRepository
from app.repositories.metric_repo import MetricRepository
from app.schemas.project import ProjectSummary, ProjectDetail
from app.schemas.score import ScoreOut, ScoreTrend

router = APIRouter(prefix="/projects", tags=["프로젝트"])


@router.get("", response_model=dict)
async def list_projects(
    category: str | None = None,
    foundation: str | None = None,
    cncf_stage: str | None = None,
    language: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """프로젝트 목록 조회"""
    repo = ProjectRepository(db)
    projects, total = await repo.list_projects(
        category_slug=category,
        foundation_type=foundation,
        cncf_stage=cncf_stage,
        language=language,
        page=page,
        page_size=page_size,
    )
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": [ProjectSummary.model_validate(p) for p in projects],
    }


@router.get("/{slug}", response_model=ProjectDetail)
async def get_project(slug: str, db: AsyncSession = Depends(get_db)):
    """프로젝트 상세 조회"""
    repo = ProjectRepository(db)
    project = await repo.get_by_slug(slug)
    if not project:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")
    return ProjectDetail.model_validate(project)


@router.get("/{slug}/score", response_model=ScoreOut | None)
async def get_project_score(slug: str, db: AsyncSession = Depends(get_db)):
    """프로젝트 최신 점수 조회"""
    proj_repo = ProjectRepository(db)
    project = await proj_repo.get_by_slug(slug)
    if not project:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")

    score_repo = ScoreRepository(db)
    score = await score_repo.get_latest_score(project.id)
    if not score:
        return None
    return ScoreOut.model_validate(score)


@router.get("/{slug}/trend", response_model=ScoreTrend)
async def get_project_trend(
    slug: str,
    days: int = Query(30, ge=7, le=365),
    db: AsyncSession = Depends(get_db),
):
    """프로젝트 점수 추세 조회"""
    proj_repo = ProjectRepository(db)
    project = await proj_repo.get_by_slug(slug)
    if not project:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")

    score_repo = ScoreRepository(db)
    scores = await score_repo.get_score_trend(project.id, days=days)

    return ScoreTrend(
        dates=[s.score_date for s in scores],
        total_scores=[s.total_score for s in scores],
        attention_scores=[s.attention_score for s in scores],
        execution_scores=[s.execution_score for s in scores],
        health_scores=[s.health_score for s in scores],
        trust_scores=[s.trust_score for s in scores],
    )
