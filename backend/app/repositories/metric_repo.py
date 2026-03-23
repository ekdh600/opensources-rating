from datetime import date

from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.daily_metric import ProjectMetricDaily


class MetricRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_latest_metric(self, project_id: int) -> ProjectMetricDaily | None:
        stmt = (
            select(ProjectMetricDaily)
            .where(ProjectMetricDaily.project_id == project_id)
            .order_by(desc(ProjectMetricDaily.metric_date))
            .limit(1)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_metrics_range(
        self, project_id: int, start_date: date, end_date: date
    ) -> list[ProjectMetricDaily]:
        stmt = (
            select(ProjectMetricDaily)
            .where(
                ProjectMetricDaily.project_id == project_id,
                ProjectMetricDaily.metric_date >= start_date,
                ProjectMetricDaily.metric_date <= end_date,
            )
            .order_by(ProjectMetricDaily.metric_date)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def upsert_metric(self, metric: ProjectMetricDaily) -> ProjectMetricDaily:
        self.session.add(metric)
        await self.session.flush()
        return metric
