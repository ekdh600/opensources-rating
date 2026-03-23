from datetime import date, datetime

from sqlalchemy import (
    Date, DateTime, Float, Integer, String, ForeignKey, Index, UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ProjectMetricDaily(Base):
    __tablename__ = "project_metrics_daily"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    metric_date: Mapped[date] = mapped_column(Date, nullable=False)
    source_type: Mapped[str] = mapped_column(String(30), nullable=False, default="github")

    # Star / Fork / Watcher
    stars_total: Mapped[int | None] = mapped_column(Integer)
    stars_delta_1d: Mapped[int | None] = mapped_column(Integer)
    stars_delta_7d: Mapped[int | None] = mapped_column(Integer)
    stars_delta_30d: Mapped[int | None] = mapped_column(Integer)
    forks_total: Mapped[int | None] = mapped_column(Integer)
    watchers_total: Mapped[int | None] = mapped_column(Integer)

    # Activity
    commits_1d: Mapped[int | None] = mapped_column(Integer)
    commits_7d: Mapped[int | None] = mapped_column(Integer)
    commits_30d: Mapped[int | None] = mapped_column(Integer)

    # PR
    prs_opened_30d: Mapped[int | None] = mapped_column(Integer)
    prs_merged_30d: Mapped[int | None] = mapped_column(Integer)

    # Issues
    issues_opened_30d: Mapped[int | None] = mapped_column(Integer)
    issues_closed_30d: Mapped[int | None] = mapped_column(Integer)

    # Contributors
    contributors_30d: Mapped[int | None] = mapped_column(Integer)
    contributors_90d: Mapped[int | None] = mapped_column(Integer)

    # Release
    release_count_90d: Mapped[int | None] = mapped_column(Integer)
    last_release_at: Mapped[datetime | None] = mapped_column(DateTime)
    last_commit_at: Mapped[datetime | None] = mapped_column(DateTime)

    # Ratios
    issue_close_ratio: Mapped[float | None] = mapped_column(Float)
    pr_merge_ratio: Mapped[float | None] = mapped_column(Float)
    maintainer_response_hours_p50: Mapped[float | None] = mapped_column(Float)
    stale_issue_ratio: Mapped[float | None] = mapped_column(Float)

    # External scores
    velocity_percentile: Mapped[float | None] = mapped_column(Float)
    security_score_raw: Mapped[float | None] = mapped_column(Float)
    dependency_risk_score_raw: Mapped[float | None] = mapped_column(Float)

    raw_payload_ref: Mapped[str | None] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("project_id", "metric_date", "source_type", name="uq_metric_project_date_source"),
        Index("ix_metric_project_date", "project_id", "metric_date"),
        Index("ix_metric_date_source", "metric_date", "source_type"),
    )
