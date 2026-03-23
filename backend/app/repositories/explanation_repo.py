from datetime import date

from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.explanation import ProjectExplanationDaily


class ExplanationRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_latest(self, project_id: int) -> ProjectExplanationDaily | None:
        stmt = (
            select(ProjectExplanationDaily)
            .where(ProjectExplanationDaily.project_id == project_id)
            .order_by(desc(ProjectExplanationDaily.score_date))
            .limit(1)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_date(
        self, project_id: int, score_date: date
    ) -> ProjectExplanationDaily | None:
        stmt = select(ProjectExplanationDaily).where(
            ProjectExplanationDaily.project_id == project_id,
            ProjectExplanationDaily.score_date == score_date,
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
