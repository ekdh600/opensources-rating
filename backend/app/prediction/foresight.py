"""
선구안 점수 — §20.14

foresight_score = 0.40*early_hit + 0.25*contrarian_success
               + 0.20*accuracy + 0.15*rarity
"""

from dataclasses import dataclass
import math


@dataclass
class ForesightBreakdown:
    early_hit_component: float
    contrarian_component: float
    accuracy_component: float
    rarity_component: float
    total: float


def calculate_foresight(
    total_predictions: int,
    total_hits: int,
    early_hits: int,
    contrarian_hits: int,
    total_contrarian: int,
    rare_position_hits: int,
) -> ForesightBreakdown:
    """선구안 점수 계산"""
    # early_hit: 주목받기 전 예측 적중 비율
    early_hit_ratio = early_hits / max(total_hits, 1)
    early_hit_score = min(early_hit_ratio * 150, 100.0)

    # contrarian_success: 대세와 반대 포지션 적중 성공률
    contrarian_accuracy = contrarian_hits / max(total_contrarian, 1)
    contrarian_score = min(contrarian_accuracy * 130, 100.0)

    # accuracy: 전체 적중률
    accuracy = (total_hits / max(total_predictions, 1)) * 100.0

    # rarity: 희소 포지션 적중 (전체 중 10% 미만 비율 포지션 선택 후 적중)
    rarity_ratio = rare_position_hits / max(total_hits, 1)
    rarity_score = min(rarity_ratio * 200, 100.0)

    total = (
        0.40 * early_hit_score
        + 0.25 * contrarian_score
        + 0.20 * accuracy
        + 0.15 * rarity_score
    )

    return ForesightBreakdown(
        early_hit_component=round(early_hit_score, 2),
        contrarian_component=round(contrarian_score, 2),
        accuracy_component=round(accuracy, 2),
        rarity_component=round(rarity_score, 2),
        total=round(total, 2),
    )
