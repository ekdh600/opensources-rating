"""이상치 탐지 — 설계서 §11"""

from dataclasses import dataclass
from datetime import datetime

from app.models.daily_metric import ProjectMetricDaily


@dataclass
class AnomalyDetection:
    detected: bool
    anomaly_type: str | None = None
    severity: str = "low"
    evidence: dict | None = None
    summary_ko: str | None = None


def detect_star_spike(
    current: ProjectMetricDaily,
    previous: ProjectMetricDaily | None,
) -> AnomalyDetection:
    """비정상적인 스타 급증 탐지"""
    if not previous or not current.stars_delta_7d or not previous.stars_delta_7d:
        return AnomalyDetection(detected=False)

    if previous.stars_delta_7d == 0:
        ratio = float(current.stars_delta_7d)
    else:
        ratio = current.stars_delta_7d / max(previous.stars_delta_7d, 1)

    if ratio > 10:
        has_release = (current.release_count_90d or 0) > (previous.release_count_90d or 0)
        if not has_release:
            return AnomalyDetection(
                detected=True,
                anomaly_type="star_spike_no_release",
                severity="high",
                evidence={
                    "current_stars_7d": current.stars_delta_7d,
                    "previous_stars_7d": previous.stars_delta_7d,
                    "ratio": round(ratio, 1),
                },
                summary_ko=f"최근 7일 스타 증가({current.stars_delta_7d})가 이전 대비 {ratio:.0f}배 급증했으나 새 릴리스가 없습니다.",
            )
    return AnomalyDetection(detected=False)


def detect_contributor_drop(
    current: ProjectMetricDaily,
    previous: ProjectMetricDaily | None,
) -> AnomalyDetection:
    """기여자 급감 탐지"""
    if not previous:
        return AnomalyDetection(detected=False)

    prev_c = previous.contributors_30d or 0
    curr_c = current.contributors_30d or 0

    if prev_c > 5 and curr_c < prev_c * 0.3:
        return AnomalyDetection(
            detected=True,
            anomaly_type="contributor_drop",
            severity="medium",
            evidence={
                "current_contributors": curr_c,
                "previous_contributors": prev_c,
            },
            summary_ko=f"최근 30일 기여자 수가 {prev_c}명에서 {curr_c}명으로 급감했습니다.",
        )
    return AnomalyDetection(detected=False)


def detect_inactivity(current: ProjectMetricDaily) -> AnomalyDetection:
    """갑작스런 비활동 탐지"""
    if current.last_commit_at:
        days_since = (datetime.utcnow() - current.last_commit_at).days
        if days_since > 90:
            return AnomalyDetection(
                detected=True,
                anomaly_type="prolonged_inactivity",
                severity="medium",
                evidence={"days_since_last_commit": days_since},
                summary_ko=f"마지막 커밋 이후 {days_since}일이 경과하여 비활동 상태입니다.",
            )
    return AnomalyDetection(detected=False)


def run_anomaly_checks(
    current: ProjectMetricDaily,
    previous: ProjectMetricDaily | None = None,
) -> list[AnomalyDetection]:
    """전체 이상치 탐지 파이프라인 실행"""
    detections = [
        detect_star_spike(current, previous),
        detect_contributor_drop(current, previous),
        detect_inactivity(current),
    ]
    return [d for d in detections if d.detected]
