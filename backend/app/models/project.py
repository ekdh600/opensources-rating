import enum
from datetime import datetime

from sqlalchemy import String, Text, Boolean, DateTime, Enum, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class FoundationType(str, enum.Enum):
    CNCF = "cncf"
    APACHE = "apache"
    LINUX_FOUNDATION = "linux_foundation"
    INDEPENDENT = "independent"
    OTHER = "other"


class CNCFStage(str, enum.Enum):
    SANDBOX = "sandbox"
    INCUBATING = "incubating"
    GRADUATED = "graduated"
    ARCHIVED = "archived"


class AggregationPolicy(str, enum.Enum):
    SINGLE_REPO = "single_repo"
    MULTI_REPO_SUM = "multi_repo_sum"
    MULTI_REPO_PRIMARY_WEIGHTED = "multi_repo_primary_weighted"


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    slug: Mapped[str] = mapped_column(String(200), unique=True, nullable=False, index=True)

    display_name_ko: Mapped[str] = mapped_column(String(300), nullable=False)
    display_name_en: Mapped[str] = mapped_column(String(300), nullable=False)
    short_description_ko: Mapped[str | None] = mapped_column(Text)
    short_description_en: Mapped[str | None] = mapped_column(Text)

    foundation_type: Mapped[FoundationType | None] = mapped_column(
        Enum(FoundationType, name="foundation_type_enum")
    )
    cncf_stage: Mapped[CNCFStage | None] = mapped_column(
        Enum(CNCFStage, name="cncf_stage_enum")
    )

    category_id: Mapped[int | None] = mapped_column(ForeignKey("categories.id"))
    subcategory_id: Mapped[int | None] = mapped_column(ForeignKey("categories.id"))

    primary_repo_url: Mapped[str] = mapped_column(String(500), nullable=False)
    homepage_url: Mapped[str | None] = mapped_column(String(500))
    logo_url: Mapped[str | None] = mapped_column(String(500))

    primary_language: Mapped[str | None] = mapped_column(String(50))
    aggregation_policy: Mapped[AggregationPolicy] = mapped_column(
        Enum(AggregationPolicy, name="aggregation_policy_enum"),
        default=AggregationPolicy.SINGLE_REPO,
    )

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    category: Mapped["Category"] = relationship(
        "Category", foreign_keys=[category_id], lazy="selectin"
    )
    sources: Mapped[list["ProjectSource"]] = relationship(
        "ProjectSource", back_populates="project", lazy="selectin"
    )

    __table_args__ = (
        Index("ix_projects_category", "category_id"),
        Index("ix_projects_foundation", "foundation_type"),
        Index("ix_projects_cncf_stage", "cncf_stage"),
        Index("ix_projects_active", "is_active"),
    )
