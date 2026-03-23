from datetime import date, datetime

from sqlalchemy import (
    Date, DateTime, Float, Integer, Boolean, String, ForeignKey, Index, UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ProjectScoreDaily(Base):
    __tablename__ = "project_scores_daily"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    score_date: Mapped[date] = mapped_column(Date, nullable=False)

    attention_score: Mapped[float] = mapped_column(Float, default=0.0)
    execution_score: Mapped[float] = mapped_column(Float, default=0.0)
    health_score: Mapped[float] = mapped_column(Float, default=0.0)
    trust_score: Mapped[float] = mapped_column(Float, default=0.0)
    total_score: Mapped[float] = mapped_column(Float, default=0.0)

    rank_global: Mapped[int | None] = mapped_column(Integer)
    rank_cncf: Mapped[int | None] = mapped_column(Integer)
    rank_category: Mapped[int | None] = mapped_column(Integer)
    rising_rank: Mapped[int | None] = mapped_column(Integer)

    anomaly_flag: Mapped[bool] = mapped_column(Boolean, default=False)
    scoring_version: Mapped[str] = mapped_column(String(20), default="v1.0")

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("project_id", "score_date", name="uq_score_project_date"),
        Index("ix_score_date_global", "score_date", "rank_global"),
        Index("ix_score_date_cncf", "score_date", "rank_cncf"),
        Index("ix_score_date_category", "score_date", "rank_category"),
        Index("ix_score_date_rising", "score_date", "rising_rank"),
        Index("ix_score_project_date", "project_id", "score_date"),
    )
