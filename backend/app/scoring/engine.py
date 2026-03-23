"""
스코어링 엔진 — 설계서 §9 기준

total_score = 0.34*attention + 0.38*execution + 0.18*health + 0.10*trust
"""

from dataclasses import dataclass
from datetime import date

from app.core.config import get_settings
from app.models.daily_metric import ProjectMetricDaily
from app.scoring.normalizer import log_scale, min_max_normalize, safe_ratio


@dataclass
class ScoreResult:
    attention: float
    execution: float
    health: float
    trust: float
    total: float


def compute_attention(metric: ProjectMetricDaily, peer_metrics: list[ProjectMetricDaily]) -> float:
    """
    관심도 점수 — 스타 증가, 와처, 추세 가속도 반영
    단기 급증과 장기 성장 균형
    """
    stars_7d = log_scale(metric.stars_delta_7d or 0)
    stars_30d = log_scale(metric.stars_delta_30d or 0)
    watchers = log_scale(metric.watchers_total or 0)

    # 급증 대비 지속 관심 비율 (30일 대비 7일 비율이 너무 높으면 캡 적용)
    if metric.stars_delta_30d and metric.stars_delta_30d > 0:
        burst_ratio = (metric.stars_delta_7d or 0) / metric.stars_delta_30d
        burst_penalty = min(burst_ratio, 0.8)
    else:
        burst_penalty = 0.5

    raw = (stars_7d * 0.35 + stars_30d * 0.40 + watchers * 0.15 + burst_penalty * 0.10) * 100

    peer_raws = []
    for pm in peer_metrics:
        s7 = log_scale(pm.stars_delta_7d or 0)
        s30 = log_scale(pm.stars_delta_30d or 0)
        w = log_scale(pm.watchers_total or 0)
        peer_raws.append((s7 * 0.35 + s30 * 0.40 + w * 0.15 + 0.5 * 0.10) * 100)

    if peer_raws:
        return min_max_normalize(raw, peer_raws + [raw])
    return min(raw, 100.0)


def compute_execution(metric: ProjectMetricDaily, peer_metrics: list[ProjectMetricDaily]) -> float:
    """
    실행력 점수 — 커밋, PR 병합, 이슈 처리, 기여자, 릴리스
    """
    commits = log_scale(metric.commits_30d or 0)
    prs = log_scale(metric.prs_merged_30d or 0)
    issues = log_scale(metric.issues_closed_30d or 0)
    contributors = log_scale(metric.contributors_30d or 0)
    releases = log_scale(metric.release_count_90d or 0)
    velocity = (metric.velocity_percentile or 50.0) / 100.0

    raw = (
        commits * 0.25
        + prs * 0.25
        + issues * 0.15
        + contributors * 0.15
        + releases * 0.10
        + velocity * 0.10
    ) * 100

    peer_raws = []
    for pm in peer_metrics:
        pr = (
            log_scale(pm.commits_30d or 0) * 0.25
            + log_scale(pm.prs_merged_30d or 0) * 0.25
            + log_scale(pm.issues_closed_30d or 0) * 0.15
            + log_scale(pm.contributors_30d or 0) * 0.15
            + log_scale(pm.release_count_90d or 0) * 0.10
            + ((pm.velocity_percentile or 50.0) / 100.0) * 0.10
        ) * 100
        peer_raws.append(pr)

    if peer_raws:
        return min_max_normalize(raw, peer_raws + [raw])
    return min(raw, 100.0)


def compute_health(metric: ProjectMetricDaily) -> float:
    """
    건강도 점수 — 이슈 닫힘률, PR 병합률, 유지보수 응답성, 오래된 이슈 비율
    """
    issue_close = (metric.issue_close_ratio or 0.0) * 100
    pr_merge = (metric.pr_merge_ratio or 0.0) * 100

    # 응답시간: 낮을수록 좋음 (24시간 이하 만점, 720시간 이상 0점)
    resp_hours = metric.maintainer_response_hours_p50 or 720
    response_score = max(0, 100 - (resp_hours / 720) * 100)

    # 오래된 이슈: 낮을수록 좋음
    stale = (1.0 - (metric.stale_issue_ratio or 0.0)) * 100

    return (
        issue_close * 0.30
        + pr_merge * 0.25
        + response_score * 0.30
        + stale * 0.15
    )


def compute_trust(metric: ProjectMetricDaily) -> float:
    """
    신뢰도 점수 — 보안, 의존성 리스크, 라이선스, 릴리스 위생
    """
    security = (metric.security_score_raw or 50.0)
    dep_risk_inverse = 100.0 - (metric.dependency_risk_score_raw or 50.0)

    # 릴리스 위생: 최근 릴리스가 있는지
    has_recent_release = 1.0 if (metric.release_count_90d or 0) > 0 else 0.0
    release_hygiene = has_recent_release * 100

    return (
        security * 0.35
        + dep_risk_inverse * 0.30
        + release_hygiene * 0.35
    )


def compute_total_score(result: ScoreResult) -> float:
    settings = get_settings()
    return (
        settings.weight_attention * result.attention
        + settings.weight_execution * result.execution
        + settings.weight_health * result.health
        + settings.weight_trust * result.trust
    )


def score_project(
    metric: ProjectMetricDaily,
    peer_metrics: list[ProjectMetricDaily] | None = None,
) -> ScoreResult:
    peers = peer_metrics or []
    attention = compute_attention(metric, peers)
    execution = compute_execution(metric, peers)
    health = compute_health(metric)
    trust = compute_trust(metric)

    result = ScoreResult(
        attention=round(attention, 2),
        execution=round(execution, 2),
        health=round(health, 2),
        trust=round(trust, 2),
        total=0.0,
    )
    result.total = round(compute_total_score(result), 2)
    return result
