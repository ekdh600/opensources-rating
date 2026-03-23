"""예측 모델 — §20.5 예측 상품 구조, §20.6 게임 구조"""

import enum
from datetime import date, datetime

from sqlalchemy import (
    String, Integer, Float, Text, Date, DateTime, Enum, Boolean,
    ForeignKey, Index, UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Position(str, enum.Enum):
    UP = "up"
    NEUTRAL = "neutral"
    DOWN = "down"


class PredictionStatus(str, enum.Enum):
    ACTIVE = "active"
    SETTLED_HIT = "settled_hit"
    SETTLED_MISS = "settled_miss"
    CANCELLED = "cancelled"


class Prediction(Base):
    """개별 유저의 프로젝트 예측"""
    __tablename__ = "predictions"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    season_id: Mapped[int] = mapped_column(ForeignKey("seasons.id", ondelete="CASCADE"))

    position: Mapped[Position] = mapped_column(
        Enum(Position, name="position_enum"), nullable=False
    )
    points_staked: Mapped[int] = mapped_column(Integer, nullable=False)
    reason: Mapped[str | None] = mapped_column(Text)

    # 기준 시점 점수
    base_score: Mapped[float] = mapped_column(Float, nullable=False)
    base_date: Mapped[date] = mapped_column(Date, nullable=False)

    # 만기
    maturity_date: Mapped[date] = mapped_column(Date, nullable=False)
    maturity_days: Mapped[int] = mapped_column(Integer, default=90)

    # 정산 결과
    status: Mapped[PredictionStatus] = mapped_column(
        Enum(PredictionStatus, name="prediction_status_enum"),
        default=PredictionStatus.ACTIVE,
    )
    final_score: Mapped[float | None] = mapped_column(Float)
    score_change_pct: Mapped[float | None] = mapped_column(Float)
    actual_outcome: Mapped[str | None] = mapped_column(String(10))
    points_earned: Mapped[int | None] = mapped_column(Integer)
    difficulty_bonus: Mapped[float | None] = mapped_column(Float)

    settled_at: Mapped[datetime | None] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("ix_pred_user_season", "user_id", "season_id"),
        Index("ix_pred_project_season", "project_id", "season_id"),
        Index("ix_pred_maturity", "maturity_date", "status"),
        Index("ix_pred_status", "status"),
    )


class PredictionProduct(Base):
    """예측 상품 정의 — 프로젝트별 시즌 내 상품"""
    __tablename__ = "prediction_products"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    season_id: Mapped[int] = mapped_column(ForeignKey("seasons.id", ondelete="CASCADE"))

    product_name: Mapped[str] = mapped_column(String(200), nullable=False)
    maturity_days: Mapped[int] = mapped_column(Integer, default=90)

    base_score: Mapped[float] = mapped_column(Float, nullable=False)
    base_date: Mapped[date] = mapped_column(Date, nullable=False)
    maturity_date: Mapped[date] = mapped_column(Date, nullable=False)

    # 집계 (§20.10)
    total_predictions: Mapped[int] = mapped_column(Integer, default=0)
    up_count: Mapped[int] = mapped_column(Integer, default=0)
    neutral_count: Mapped[int] = mapped_column(Integer, default=0)
    down_count: Mapped[int] = mapped_column(Integer, default=0)

    up_ratio: Mapped[float] = mapped_column(Float, default=0.0)
    neutral_ratio: Mapped[float] = mapped_column(Float, default=0.0)
    down_ratio: Mapped[float] = mapped_column(Float, default=0.0)

    # 평판 가중 기대치 (§20.10)
    weighted_up_ratio: Mapped[float] = mapped_column(Float, default=0.0)
    weighted_neutral_ratio: Mapped[float] = mapped_column(Float, default=0.0)
    weighted_down_ratio: Mapped[float] = mapped_column(Float, default=0.0)
    community_expected_score: Mapped[float | None] = mapped_column(Float)

    is_settled: Mapped[bool] = mapped_column(Boolean, default=False)
    final_score: Mapped[float | None] = mapped_column(Float)
    final_outcome: Mapped[str | None] = mapped_column(String(10))

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("project_id", "season_id", "maturity_days", name="uq_product_project_season"),
        Index("ix_product_season", "season_id"),
    )
