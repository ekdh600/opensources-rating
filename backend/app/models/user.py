"""사용자 모델 — 예측 시장 참여를 위한 기본 사용자"""

from datetime import datetime

from sqlalchemy import String, Integer, Float, Boolean, DateTime, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    # 가상 포인트
    points_balance: Mapped[int] = mapped_column(Integer, default=10000)
    points_total_earned: Mapped[int] = mapped_column(Integer, default=0)

    # 레벨 시스템 (§20.7)
    level: Mapped[int] = mapped_column(Integer, default=1)
    experience: Mapped[int] = mapped_column(Integer, default=0)

    # 누적 평판 점수 (§20.9)
    reputation_score: Mapped[float] = mapped_column(Float, default=0.0)
    foresight_score: Mapped[float] = mapped_column(Float, default=0.0)

    # 통계
    total_predictions: Mapped[int] = mapped_column(Integer, default=0)
    total_hits: Mapped[int] = mapped_column(Integer, default=0)
    current_streak: Mapped[int] = mapped_column(Integer, default=0)
    best_streak: Mapped[int] = mapped_column(Integer, default=0)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime)

    __table_args__ = (
        Index("ix_users_reputation", "reputation_score"),
        Index("ix_users_level", "level"),
    )
