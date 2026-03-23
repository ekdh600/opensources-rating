"""시즌 모델 — §20.3 시즌 구조"""

import enum
from datetime import date, datetime

from sqlalchemy import String, Date, DateTime, Enum, Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class SeasonStatus(str, enum.Enum):
    UPCOMING = "upcoming"
    ACTIVE = "active"
    SETTLING = "settling"
    COMPLETED = "completed"


class Season(Base):
    __tablename__ = "seasons"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    slug: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)

    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)

    status: Mapped[SeasonStatus] = mapped_column(
        Enum(SeasonStatus, name="season_status_enum"),
        default=SeasonStatus.UPCOMING,
    )

    initial_points: Mapped[int] = mapped_column(Integer, default=10000)
    is_current: Mapped[bool] = mapped_column(Boolean, default=False)

    settlement_threshold_up: Mapped[float] = mapped_column(default=12.0)
    settlement_threshold_down: Mapped[float] = mapped_column(default=-12.0)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
