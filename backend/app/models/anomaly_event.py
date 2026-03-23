import enum
from datetime import datetime

from sqlalchemy import String, DateTime, Enum, ForeignKey, Text, Index
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class AnomalySeverity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class AnomalyEvent(Base):
    __tablename__ = "anomaly_events"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))

    anomaly_type: Mapped[str] = mapped_column(String(50), nullable=False)
    severity: Mapped[AnomalySeverity] = mapped_column(
        Enum(AnomalySeverity, name="anomaly_severity_enum"),
        default=AnomalySeverity.LOW,
    )
    detected_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    evidence_json: Mapped[dict | None] = mapped_column(JSONB)
    user_visible_summary_ko: Mapped[str | None] = mapped_column(Text)
    is_dismissed: Mapped[bool] = mapped_column(default=False)

    __table_args__ = (
        Index("ix_anomaly_project_date", "project_id", "detected_at"),
    )
