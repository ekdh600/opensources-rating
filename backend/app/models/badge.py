"""뱃지 및 시즌 결과 모델 — §20.8 시즌 뱃지 체계"""

import enum
from datetime import datetime

from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, Index, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import JSONB

from app.core.database import Base


class BadgeType(str, enum.Enum):
    SEASON_CHAMPION = "season_champion"
    SEASON_TOP10 = "season_top10"
    ACCURACY_EXCELLENT = "accuracy_excellent"
    UNDERVALUE_HUNTER = "undervalue_hunter"
    CONTRARIAN_HIT = "contrarian_hit"
    EARLY_SIGNAL = "early_signal"
    STREAK_MASTER = "streak_master"
    FIRST_PREDICTION = "first_prediction"


class Badge(Base):
    """뱃지 정의 테이블"""
    __tablename__ = "badges"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    slug: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    name_ko: Mapped[str] = mapped_column(String(100), nullable=False)
    name_en: Mapped[str] = mapped_column(String(100), nullable=False)
    description_ko: Mapped[str] = mapped_column(String(300), nullable=False)
    description_en: Mapped[str] = mapped_column(String(300), nullable=False)
    icon: Mapped[str] = mapped_column(String(50), default="🏅")
    badge_type: Mapped[str] = mapped_column(String(50), nullable=False)
    rarity: Mapped[str] = mapped_column(String(20), default="common")


class UserBadge(Base):
    """유저에게 지급된 뱃지"""
    __tablename__ = "user_badges"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    badge_id: Mapped[int] = mapped_column(ForeignKey("badges.id", ondelete="CASCADE"))
    season_id: Mapped[int | None] = mapped_column(ForeignKey("seasons.id"))
    awarded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    evidence_json: Mapped[dict | None] = mapped_column(JSONB)

    __table_args__ = (
        Index("ix_user_badges_user", "user_id"),
    )


class SeasonResult(Base):
    """시즌별 유저 성적"""
    __tablename__ = "season_results"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    season_id: Mapped[int] = mapped_column(ForeignKey("seasons.id", ondelete="CASCADE"))

    season_rank: Mapped[int | None] = mapped_column(Integer)

    total_predictions: Mapped[int] = mapped_column(Integer, default=0)
    total_hits: Mapped[int] = mapped_column(Integer, default=0)
    accuracy_rate: Mapped[float] = mapped_column(Float, default=0.0)

    points_start: Mapped[int] = mapped_column(Integer, default=10000)
    points_end: Mapped[int] = mapped_column(Integer, default=10000)
    points_profit: Mapped[int] = mapped_column(Integer, default=0)

    best_streak: Mapped[int] = mapped_column(Integer, default=0)
    season_reputation: Mapped[float] = mapped_column(Float, default=0.0)
    season_foresight: Mapped[float] = mapped_column(Float, default=0.0)

    # 상세 성적
    up_predictions: Mapped[int] = mapped_column(Integer, default=0)
    neutral_predictions: Mapped[int] = mapped_column(Integer, default=0)
    down_predictions: Mapped[int] = mapped_column(Integer, default=0)
    contrarian_hits: Mapped[int] = mapped_column(Integer, default=0)
    early_hits: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("user_id", "season_id", name="uq_season_result_user"),
        Index("ix_season_result_rank", "season_id", "season_rank"),
    )
