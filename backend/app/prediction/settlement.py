"""
만기 정산 엔진 — §20.11

정산식:
  score_change_pct = (final - base) / base * 100
  >= threshold_up  → 상승
  <= threshold_down → 하락
  그 외            → 보합

포인트 정산:
  적중 → 기본 보상 + 난이도 보너스
  오답 → 베팅 포인트 차감
"""

from dataclasses import dataclass

from app.core.config import get_settings


@dataclass
class SettlementResult:
    is_hit: bool
    actual_outcome: str  # "up" | "neutral" | "down"
    score_change_pct: float
    points_earned: int
    difficulty_bonus: float


def determine_outcome(base_score: float, final_score: float) -> tuple[str, float]:
    """최종 점수 변화율에 따른 결과 판정"""
    settings = get_settings()

    if base_score == 0:
        return "neutral", 0.0

    change_pct = (final_score - base_score) / base_score * 100.0

    if change_pct >= settings.prediction_threshold_up:
        return "up", change_pct
    elif change_pct <= settings.prediction_threshold_down:
        return "down", change_pct
    else:
        return "neutral", change_pct


def calculate_difficulty(
    position: str,
    up_ratio: float,
    neutral_ratio: float,
    down_ratio: float,
) -> float:
    """포지션의 난이도 산출 — 소수파일수록 난이도 높음"""
    position_ratio = {
        "up": up_ratio,
        "neutral": neutral_ratio,
        "down": down_ratio,
    }.get(position, 0.33)

    if position_ratio <= 0:
        return 3.0
    if position_ratio >= 1.0:
        return 0.1

    # 역수 기반 난이도: 참여자 비율이 낮을수록 높음
    return min(1.0 / max(position_ratio, 0.05), 5.0)


def settle_prediction(
    position: str,
    points_staked: int,
    base_score: float,
    final_score: float,
    up_ratio: float = 0.33,
    neutral_ratio: float = 0.34,
    down_ratio: float = 0.33,
) -> SettlementResult:
    """단일 예측 정산"""
    settings = get_settings()

    actual_outcome, change_pct = determine_outcome(base_score, final_score)
    is_hit = (position == actual_outcome)

    difficulty = calculate_difficulty(position, up_ratio, neutral_ratio, down_ratio)

    if is_hit:
        base_reward = int(points_staked * settings.prediction_hit_base_reward)
        diff_bonus = difficulty * settings.prediction_difficulty_multiplier
        bonus_points = int(points_staked * diff_bonus)
        points_earned = base_reward + bonus_points
    else:
        points_earned = -int(points_staked * settings.prediction_miss_penalty)

    return SettlementResult(
        is_hit=is_hit,
        actual_outcome=actual_outcome,
        score_change_pct=round(change_pct, 2),
        points_earned=points_earned,
        difficulty_bonus=round(difficulty, 2),
    )
