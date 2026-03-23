from datetime import date, timedelta

from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.score import ProjectScoreDaily
from app.models.project import Project


class ScoreRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_latest_score(self, project_id: int) -> ProjectScoreDaily | None:
        stmt = (
            select(ProjectScoreDaily)
            .where(ProjectScoreDaily.project_id == project_id)
            .order_by(desc(ProjectScoreDaily.score_date))
            .limit(1)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_score_trend(
        self, project_id: int, days: int = 30
    ) -> list[ProjectScoreDaily]:
        since = date.today() - timedelta(days=days)
        stmt = (
            select(ProjectScoreDaily)
            .where(
                ProjectScoreDaily.project_id == project_id,
                ProjectScoreDaily.score_date >= since,
            )
            .order_by(ProjectScoreDaily.score_date)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_global_leaderboard(
        self,
        score_date: date | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[ProjectScoreDaily], int]:
        if score_date is None:
            sub = select(func.max(ProjectScoreDaily.score_date)).scalar_subquery()
            score_date_val = sub
        else:
            score_date_val = score_date

        stmt = (
            select(ProjectScoreDaily)
            .where(ProjectScoreDaily.score_date == score_date_val)
            .order_by(ProjectScoreDaily.rank_global.asc().nullslast())
        )
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = (await self.session.execute(count_stmt)).scalar_one()

        stmt = stmt.offset((page - 1) * page_size).limit(page_size)
        result = await self.session.execute(stmt)
        return list(result.scalars().all()), total

    async def get_cncf_leaderboard(
        self,
        score_date: date | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[ProjectScoreDaily], int]:
        if score_date is None:
            sub = select(func.max(ProjectScoreDaily.score_date)).scalar_subquery()
            score_date_val = sub
        else:
            score_date_val = score_date

        stmt = (
            select(ProjectScoreDaily)
            .join(Project, ProjectScoreDaily.project_id == Project.id)
            .where(
                ProjectScoreDaily.score_date == score_date_val,
                Project.foundation_type == "cncf",
            )
            .order_by(ProjectScoreDaily.rank_cncf.asc().nullslast())
        )
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = (await self.session.execute(count_stmt)).scalar_one()

        stmt = stmt.offset((page - 1) * page_size).limit(page_size)
        result = await self.session.execute(stmt)
        return list(result.scalars().all()), total

    async def get_rising_leaderboard(
        self,
        score_date: date | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[ProjectScoreDaily], int]:
        if score_date is None:
            sub = select(func.max(ProjectScoreDaily.score_date)).scalar_subquery()
            score_date_val = sub
        else:
            score_date_val = score_date

        stmt = (
            select(ProjectScoreDaily)
            .where(
                ProjectScoreDaily.score_date == score_date_val,
                ProjectScoreDaily.rising_rank.isnot(None),
            )
            .order_by(ProjectScoreDaily.rising_rank.asc())
        )
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = (await self.session.execute(count_stmt)).scalar_one()

        stmt = stmt.offset((page - 1) * page_size).limit(page_size)
        result = await self.session.execute(stmt)
        return list(result.scalars().all()), total
