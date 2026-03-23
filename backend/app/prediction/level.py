"""
레벨 시스템 — §20.7

레벨은 예측 품질과 경험량을 모두 반영.
LV.1 비기너 → LV.99 선구자
"""

from dataclasses import dataclass

LEVEL_TABLE = [
    (1, "비기너", "Beginner", 0),
    (5, "관찰자", "Observer", 500),
    (10, "탐색자", "Explorer", 1500),
    (20, "분석가", "Analyst", 5000),
    (35, "트렌드 헌터", "Trend Hunter", 15000),
    (50, "시그널 리더", "Signal Reader", 35000),
    (70, "인사이트 메이커", "Insight Maker", 70000),
    (85, "얼리 디텍터", "Early Detector", 120000),
    (99, "선구자", "Visionary", 200000),
]


@dataclass
class LevelInfo:
    level: int
    title_ko: str
    title_en: str
    exp_required: int
    next_level_exp: int | None


def get_level_info(experience: int) -> LevelInfo:
    """현재 경험치에 해당하는 레벨 정보 반환"""
    current = LEVEL_TABLE[0]
    next_entry = LEVEL_TABLE[1] if len(LEVEL_TABLE) > 1 else None

    for i, entry in enumerate(LEVEL_TABLE):
        if experience >= entry[3]:
            current = entry
            next_entry = LEVEL_TABLE[i + 1] if i + 1 < len(LEVEL_TABLE) else None
        else:
            break

    return LevelInfo(
        level=current[0],
        title_ko=current[1],
        title_en=current[2],
        exp_required=current[3],
        next_level_exp=next_entry[3] if next_entry else None,
    )


def calculate_exp_gain(
    is_hit: bool,
    difficulty: float,
    streak: int,
) -> int:
    """예측 결과에 따른 경험치 획득량 계산"""
    if is_hit:
        base = 100
        diff_bonus = int(difficulty * 50)
        streak_bonus = min(streak * 10, 100)
        return base + diff_bonus + streak_bonus
    else:
        return 20  # 오답도 소량 경험치
