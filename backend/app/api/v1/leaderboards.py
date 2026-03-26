from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.project_repo import ProjectRepository
from app.repositories.score_repo import ScoreRepository
from app.schemas.project import ProjectSummary
from app.schemas.leaderboard import LeaderboardResponse, LeaderboardEntry, RisingEntry

router = APIRouter(prefix="/leaderboards", tags=["리더보드"])


def _resolve_snapshot_date(scores, fallback: date | None = None) -> date:
    if scores:
        first = scores[0]
        if getattr(first, "score_date", None):
            return first.score_date
    return fallback or date.today()


async def _build_entries(
    scores, db: AsyncSession
) -> list[LeaderboardEntry]:
    proj_repo = ProjectRepository(db)
    entries = []
    for s in scores:
        project = await proj_repo.get_by_id(s.project_id)
        if not project:
            continue
        entries.append(
            LeaderboardEntry(
                rank=s.rank_global or 0,
                project=ProjectSummary.model_validate(project),
                total_score=s.total_score,
                attention_score=s.attention_score,
                execution_score=s.execution_score,
                health_score=s.health_score,
                trust_score=s.trust_score,
                anomaly_flag=s.anomaly_flag,
            )
        )
    return entries


@router.get("/global", response_model=LeaderboardResponse)
async def global_leaderboard(
    score_date: date | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """전체 글로벌 리더보드"""
    repo = ScoreRepository(db)
    scores, total = await repo.get_global_leaderboard(
        score_date=score_date, page=page, page_size=page_size
    )
    entries = await _build_entries(scores, db)
    return LeaderboardResponse(
        date=_resolve_snapshot_date(scores, score_date),
        total_count=total,
        page=page,
        page_size=page_size,
        entries=entries,
    )


@router.get("/cncf", response_model=LeaderboardResponse)
async def cncf_leaderboard(
    score_date: date | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """CNCF 전용 리더보드"""
    repo = ScoreRepository(db)
    scores, total = await repo.get_cncf_leaderboard(
        score_date=score_date, page=page, page_size=page_size
    )
    entries = await _build_entries(scores, db)
    for entry in entries:
        entry.rank = scores[entries.index(entry)].rank_cncf or 0
    return LeaderboardResponse(
        date=_resolve_snapshot_date(scores, score_date),
        total_count=total,
        page=page,
        page_size=page_size,
        entries=entries,
    )


@router.get("/rising", response_model=dict)
async def rising_leaderboard(
    score_date: date | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """급상승 리더보드"""
    repo = ScoreRepository(db)
    scores, total = await repo.get_rising_leaderboard(
        score_date=score_date, page=page, page_size=page_size
    )
    proj_repo = ProjectRepository(db)
    entries = []
    for s in scores:
        project = await proj_repo.get_by_id(s.project_id)
        if not project:
            continue
        entries.append(
            RisingEntry(
                rank=s.rising_rank or 0,
                project=ProjectSummary.model_validate(project),
                total_score=s.total_score,
                score_change_30d=0.0,
            )
        )
    return {
        "date": _resolve_snapshot_date(scores, score_date),
        "total_count": total,
        "page": page,
        "page_size": page_size,
        "entries": entries,
    }
