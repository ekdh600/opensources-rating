"""정규화 함수 모음 — 카테고리별 정규화, 로그 변환, 이상치 캡핑 적용"""

import math
from dataclasses import dataclass


@dataclass
class NormConfig:
    log_transform: bool = True
    cap_percentile: float = 0.95
    min_val: float = 0.0
    max_val: float = 100.0


def log_scale(value: float, base: float = 10.0) -> float:
    if value <= 0:
        return 0.0
    return math.log(value + 1) / math.log(base + 1)


def min_max_normalize(
    value: float, values: list[float], cap_percentile: float = 0.95
) -> float:
    if not values:
        return 0.0
    sorted_vals = sorted(values)
    cap_idx = max(0, int(len(sorted_vals) * cap_percentile) - 1)
    cap_val = sorted_vals[cap_idx]
    min_val = sorted_vals[0]

    if cap_val == min_val:
        return 50.0

    capped = min(value, cap_val)
    return ((capped - min_val) / (cap_val - min_val)) * 100.0


def age_decay_factor(project_age_days: int, half_life: int = 365) -> float:
    """오래된 프로젝트의 스타 급증을 보정하는 감쇠 팩터"""
    if project_age_days <= 0:
        return 1.0
    return 1.0 / (1.0 + (project_age_days / half_life) * 0.1)


def safe_ratio(numerator: float | None, denominator: float | None) -> float:
    if numerator is None or denominator is None or denominator == 0:
        return 0.0
    return min(numerator / denominator, 1.0)
