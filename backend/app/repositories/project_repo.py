from datetime import date

from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.project import Project
from app.models.category import Category


class ProjectRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_slug(self, slug: str) -> Project | None:
        stmt = select(Project).where(Project.slug == slug, Project.is_active.is_(True))
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_id(self, project_id: int) -> Project | None:
        stmt = select(Project).where(Project.id == project_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_projects(
        self,
        *,
        category_slug: str | None = None,
        foundation_type: str | None = None,
        cncf_stage: str | None = None,
        language: str | None = None,
        is_active: bool = True,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[Project], int]:
        stmt = select(Project).where(Project.is_active == is_active)

        if category_slug:
            stmt = stmt.join(Category, Project.category_id == Category.id).where(
                Category.slug == category_slug
            )
        if foundation_type:
            stmt = stmt.where(Project.foundation_type == foundation_type)
        if cncf_stage:
            stmt = stmt.where(Project.cncf_stage == cncf_stage)
        if language:
            stmt = stmt.where(Project.primary_language == language)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = (await self.session.execute(count_stmt)).scalar_one()

        stmt = stmt.offset((page - 1) * page_size).limit(page_size)
        result = await self.session.execute(stmt)
        return list(result.scalars().all()), total

    async def search(self, query: str, limit: int = 20) -> list[Project]:
        pattern = f"%{query}%"
        stmt = (
            select(Project)
            .where(
                Project.is_active.is_(True),
                or_(
                    Project.display_name_ko.ilike(pattern),
                    Project.display_name_en.ilike(pattern),
                    Project.slug.ilike(pattern),
                ),
            )
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
