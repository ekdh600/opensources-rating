from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.project_repo import ProjectRepository
from app.repositories.explanation_repo import ExplanationRepository
from app.schemas.explanation import ExplanationOut

router = APIRouter(prefix="/scoring", tags=["점수 설명"])


@router.get("/explain/{slug}", response_model=ExplanationOut | None)
async def explain_score(slug: str, db: AsyncSession = Depends(get_db)):
    """프로젝트 점수 설명 조회"""
    proj_repo = ProjectRepository(db)
    project = await proj_repo.get_by_slug(slug)
    if not project:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")

    expl_repo = ExplanationRepository(db)
    explanation = await expl_repo.get_latest(project.id)
    if not explanation:
        return None

    return ExplanationOut(
        project_id=explanation.project_id,
        score_date=explanation.score_date,
        summary_ko=explanation.summary_ko,
        summary_en=explanation.summary_en,
        top_positive_factors=explanation.top_positive_factors_json,
        top_negative_factors=explanation.top_negative_factors_json,
        momentum_summary_ko=explanation.momentum_summary_ko,
        anomaly_summary_ko=explanation.anomaly_summary_ko,
    )
