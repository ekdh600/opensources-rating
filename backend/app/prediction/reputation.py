"""
유저 평판 점수 — §20.9

reputation_score = 0.35*accuracy + 0.20*consistency + 0.20*difficulty
                 + 0.15*early_prediction_bonus + 0.10*volume
"""

from dataclasses import dataclass
import math


@dataclass
class ReputationBreakdown:
    accuracy_component: float
    consistency_component: float
    difficulty_component: float
    early_bonus_component: float
    volume_component: float
    total: float


def calculate_reputation(
    total_predictions: int,
    total_hits: int,
    recent_accuracy: float,
    avg_difficulty_of_hits: float,
    early_hits: int,
    contrarian_hits: int,
) -> ReputationBreakdown:
    """유저 평판 점수 계산"""
    # accuracy: 적중률 (0~100)
    accuracy = (total_hits / max(total_predictions, 1)) * 100.0

    # consistency: 최근 성과 안정성 — 전체 적중률과 최근 적중률 차이가 작을수록 높음
    overall_acc = accuracy / 100.0
    gap = abs(overall_acc - recent_accuracy)
    consistency = max(0, 100.0 - gap * 200)

    # difficulty: 고난도 적중 — 역행 포지션 성공 비율
    difficulty_score = min(avg_difficulty_of_hits * 25, 100.0)

    # early_prediction_bonus: 주목 전 예측 성공 비율
    early_ratio = early_hits / max(total_hits, 1)
    early_bonus = min(early_ratio * 200, 100.0)

    # volume: 충분한 표본 — 로그 스케일
    volume = min(math.log(max(total_predictions, 1) + 1) / math.log(200) * 100, 100.0)

    total = (
        0.35 * accuracy
        + 0.20 * consistency
        + 0.20 * difficulty_score
        + 0.15 * early_bonus
        + 0.10 * volume
    )

    return ReputationBreakdown(
        accuracy_component=round(accuracy, 2),
        consistency_component=round(consistency, 2),
        difficulty_component=round(difficulty_score, 2),
        early_bonus_component=round(early_bonus, 2),
        volume_component=round(volume, 2),
        total=round(total, 2),
    )
