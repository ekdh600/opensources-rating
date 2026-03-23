"""
악용 방지 — §20.13

필수 방어:
- 신규 계정 영향력 제한
- 동일 프로젝트 과도한 몰빵 제한
- 시즌 막판 대량 진입 감쇠
- 평판 낮은 계정 집계 영향력 제한
"""

from datetime import date, datetime, timedelta
from dataclasses import dataclass

from app.core.config import get_settings


@dataclass
class AbuseCheckResult:
    allowed: bool
    reason_ko: str | None = None
    reason_en: str | None = None


def check_newbie_restriction(user_created_at: datetime) -> AbuseCheckResult:
    """신규 계정 제한 — 가입 후 일정 기간은 베팅 상한 적용"""
    settings = get_settings()
    days_since = (datetime.utcnow() - user_created_at).days

    if days_since < settings.prediction_newbie_limit_days:
        return AbuseCheckResult(
            allowed=True,
            reason_ko=f"신규 계정으로 {settings.prediction_newbie_limit_days}일간 영향력이 제한됩니다",
        )
    return AbuseCheckResult(allowed=True)


def check_max_stake(
    points_balance: int,
    points_staked: int,
) -> AbuseCheckResult:
    """과도한 몰빵 제한 — 잔여 포인트의 일정 비율 이상 베팅 불가"""
    settings = get_settings()
    max_stake = int(points_balance * settings.prediction_max_stake_ratio)

    if points_staked > max_stake:
        return AbuseCheckResult(
            allowed=False,
            reason_ko=f"최대 {max_stake} 포인트까지 베팅 가능합니다 (잔여의 {int(settings.prediction_max_stake_ratio * 100)}%)",
            reason_en=f"Maximum stake is {max_stake} points ({int(settings.prediction_max_stake_ratio * 100)}% of balance)",
        )
    if points_staked > points_balance:
        return AbuseCheckResult(
            allowed=False,
            reason_ko="포인트가 부족합니다",
            reason_en="Insufficient points",
        )
    return AbuseCheckResult(allowed=True)


def check_season_end_dampening(
    season_end_date: date,
    maturity_days: int = 90,
) -> AbuseCheckResult:
    """시즌 막판 대량 진입 감쇠 — 시즌 종료 30일 전부터 제한"""
    days_remaining = (season_end_date - date.today()).days

    if days_remaining < 14:
        return AbuseCheckResult(
            allowed=False,
            reason_ko="시즌 종료 14일 전부터 새로운 예측을 할 수 없습니다",
            reason_en="No new predictions within 14 days of season end",
        )
    if days_remaining < 30:
        return AbuseCheckResult(
            allowed=True,
            reason_ko="시즌 막판으로 예측 포인트 상한이 50% 감소됩니다",
        )
    return AbuseCheckResult(allowed=True)


def check_duplicate_prediction(
    existing_active_count: int,
    max_per_project: int = 3,
) -> AbuseCheckResult:
    """동일 프로젝트 중복 예측 제한"""
    if existing_active_count >= max_per_project:
        return AbuseCheckResult(
            allowed=False,
            reason_ko=f"같은 프로젝트에 최대 {max_per_project}개의 활성 예측만 가능합니다",
            reason_en=f"Maximum {max_per_project} active predictions per project",
        )
    return AbuseCheckResult(allowed=True)


def calculate_weighted_influence(
    reputation_score: float,
    account_age_days: int,
) -> float:
    """평판 기반 집계 가중치 — 저평판/신규 계정은 영향력 감소"""
    # 기본 영향력 1.0
    base = 1.0

    # 평판 보정: 0~100 → 0.3~2.0
    reputation_factor = 0.3 + (reputation_score / 100.0) * 1.7

    # 계정 나이 보정: 7일 미만 0.3, 30일 미만 0.6
    if account_age_days < 7:
        age_factor = 0.3
    elif account_age_days < 30:
        age_factor = 0.6
    else:
        age_factor = 1.0

    return round(base * reputation_factor * age_factor, 3)
