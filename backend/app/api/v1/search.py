from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.project_repo import ProjectRepository
from app.schemas.project import ProjectSummary
from app.schemas.search import SearchResult

router = APIRouter(prefix="/search", tags=["검색"])


@router.get("", response_model=SearchResult)
async def search_projects(
    q: str = Query(..., min_length=1, description="검색어"),
    limit: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """프로젝트 검색"""
    repo = ProjectRepository(db)
    results = await repo.search(q, limit=limit)
    return SearchResult(
        total=len(results),
        results=[ProjectSummary.model_validate(p) for p in results],
    )
