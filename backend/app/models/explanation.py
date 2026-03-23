from datetime import date, datetime

from sqlalchemy import Date, DateTime, Text, ForeignKey, Index, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import JSONB

from app.core.database import Base


class ProjectExplanationDaily(Base):
    __tablename__ = "project_explanations_daily"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    score_date: Mapped[date] = mapped_column(Date, nullable=False)

    summary_ko: Mapped[str | None] = mapped_column(Text)
    summary_en: Mapped[str | None] = mapped_column(Text)

    top_positive_factors_json: Mapped[dict | None] = mapped_column(JSONB)
    top_negative_factors_json: Mapped[dict | None] = mapped_column(JSONB)

    momentum_summary_ko: Mapped[str | None] = mapped_column(Text)
    anomaly_summary_ko: Mapped[str | None] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("project_id", "score_date", name="uq_explanation_project_date"),
        Index("ix_explanation_project_date", "project_id", "score_date"),
    )
