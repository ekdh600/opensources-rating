import enum
from datetime import datetime

from sqlalchemy import String, Boolean, DateTime, Enum, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class SourceType(str, enum.Enum):
    GITHUB = "github"
    DEVSTATS = "devstats"
    OSSINSIGHT = "ossinsight"
    STARHISTORY = "starhistory"
    DEPSDEV = "depsdev"
    LIBRARIESIO = "librariesio"
    VELOCITY = "velocity"


class ProjectSource(Base):
    __tablename__ = "project_sources"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))

    source_type: Mapped[SourceType] = mapped_column(
        Enum(SourceType, name="source_type_enum"), nullable=False
    )
    external_id: Mapped[str | None] = mapped_column(String(300))
    external_name: Mapped[str | None] = mapped_column(String(300))
    external_url: Mapped[str | None] = mapped_column(String(500))
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False)
    sync_enabled: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    project: Mapped["Project"] = relationship("Project", back_populates="sources")

    __table_args__ = (
        Index("ix_psource_project_type", "project_id", "source_type"),
    )
