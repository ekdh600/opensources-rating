"""
설명 가능한 랭킹 텍스트 자동 생성 — 설계서 §12

상위 기여 요인 3개, 하위 제한 요인 2개, 추세 요약 1개, 이상치 설명 1개
"""

from dataclasses import dataclass

from app.models.daily_metric import ProjectMetricDaily
from app.scoring.engine import ScoreResult


@dataclass
class ExplanationResult:
    summary_ko: str
    summary_en: str
    top_positive_factors: list[dict]
    top_negative_factors: list[dict]
    momentum_summary_ko: str
    anomaly_summary_ko: str | None


FACTOR_LABELS_KO = {
    "stars_growth": "스타 증가율",
    "watchers": "와처 수",
    "commits": "커밋 활동",
    "prs_merged": "PR 병합",
    "issues_closed": "이슈 처리",
    "contributors": "기여자 수",
    "releases": "릴리스 빈도",
    "issue_close_ratio": "이슈 닫힘률",
    "pr_merge_ratio": "PR 병합률",
    "response_time": "유지보수 응답 속도",
    "stale_issues": "오래된 이슈 비율",
    "security": "보안 점수",
    "dependency_risk": "의존성 리스크",
    "release_hygiene": "릴리스 최신성",
}

FACTOR_LABELS_EN = {
    "stars_growth": "Star Growth",
    "watchers": "Watchers",
    "commits": "Commit Activity",
    "prs_merged": "PRs Merged",
    "issues_closed": "Issues Closed",
    "contributors": "Contributors",
    "releases": "Release Frequency",
    "issue_close_ratio": "Issue Close Ratio",
    "pr_merge_ratio": "PR Merge Ratio",
    "response_time": "Maintainer Response Time",
    "stale_issues": "Stale Issue Ratio",
    "security": "Security Score",
    "dependency_risk": "Dependency Risk",
    "release_hygiene": "Release Freshness",
}


def _evaluate_factors(metric: ProjectMetricDaily) -> list[tuple[str, float, bool]]:
    """각 지표별 (factor_key, normalized_score, is_positive) 튜플 리스트 생성"""
    factors = []

    stars_7d = metric.stars_delta_7d or 0
    stars_30d = metric.stars_delta_30d or 0
    star_score = min((stars_30d / 100.0) * 100, 100) if stars_30d else 0
    factors.append(("stars_growth", star_score, star_score > 40))

    watchers = metric.watchers_total or 0
    watcher_score = min((watchers / 500.0) * 100, 100)
    factors.append(("watchers", watcher_score, watcher_score > 30))

    commits = metric.commits_30d or 0
    commit_score = min((commits / 100.0) * 100, 100)
    factors.append(("commits", commit_score, commit_score > 30))

    prs = metric.prs_merged_30d or 0
    pr_score = min((prs / 50.0) * 100, 100)
    factors.append(("prs_merged", pr_score, pr_score > 30))

    issues = metric.issues_closed_30d or 0
    issue_score = min((issues / 50.0) * 100, 100)
    factors.append(("issues_closed", issue_score, issue_score > 30))

    contribs = metric.contributors_30d or 0
    contrib_score = min((contribs / 30.0) * 100, 100)
    factors.append(("contributors", contrib_score, contrib_score > 30))

    releases = metric.release_count_90d or 0
    release_score = min((releases / 5.0) * 100, 100)
    factors.append(("releases", release_score, release_score > 30))

    close_ratio = (metric.issue_close_ratio or 0) * 100
    factors.append(("issue_close_ratio", close_ratio, close_ratio > 50))

    merge_ratio = (metric.pr_merge_ratio or 0) * 100
    factors.append(("pr_merge_ratio", merge_ratio, merge_ratio > 50))

    resp_hours = metric.maintainer_response_hours_p50 or 720
    resp_score = max(0, 100 - (resp_hours / 720) * 100)
    factors.append(("response_time", resp_score, resp_score > 40))

    stale = (metric.stale_issue_ratio or 0)
    stale_score = (1.0 - stale) * 100
    factors.append(("stale_issues", stale_score, stale_score > 60))

    sec = metric.security_score_raw or 50
    factors.append(("security", sec, sec > 60))

    dep = 100 - (metric.dependency_risk_score_raw or 50)
    factors.append(("dependency_risk", dep, dep > 50))

    has_rel = 100 if releases > 0 else 0
    factors.append(("release_hygiene", has_rel, has_rel > 50))

    return factors


def generate_explanation(
    metric: ProjectMetricDaily,
    scores: ScoreResult,
    anomaly_summaries: list[str] | None = None,
) -> ExplanationResult:
    factors = _evaluate_factors(metric)

    positives = sorted(
        [(k, v) for k, v, is_pos in factors if is_pos],
        key=lambda x: x[1],
        reverse=True,
    )[:3]
    negatives = sorted(
        [(k, v) for k, v, is_pos in factors if not is_pos],
        key=lambda x: x[1],
    )[:2]

    pos_list = [
        {"factor": k, "label_ko": FACTOR_LABELS_KO[k], "label_en": FACTOR_LABELS_EN[k], "score": round(v, 1)}
        for k, v in positives
    ]
    neg_list = [
        {"factor": k, "label_ko": FACTOR_LABELS_KO[k], "label_en": FACTOR_LABELS_EN[k], "score": round(v, 1)}
        for k, v in negatives
    ]

    pos_desc_ko = ", ".join(f["label_ko"] for f in pos_list)
    neg_desc_ko = ", ".join(f["label_ko"] for f in neg_list)

    summary_ko = f"종합 점수 {scores.total}점입니다."
    if pos_desc_ko:
        summary_ko += f" {pos_desc_ko}이(가) 강점입니다."
    if neg_desc_ko:
        summary_ko += f" {neg_desc_ko}은(는) 개선이 필요합니다."

    pos_desc_en = ", ".join(f["label_en"] for f in pos_list)
    neg_desc_en = ", ".join(f["label_en"] for f in neg_list)
    summary_en = f"Total score is {scores.total}."
    if pos_desc_en:
        summary_en += f" Strengths: {pos_desc_en}."
    if neg_desc_en:
        summary_en += f" Areas for improvement: {neg_desc_en}."

    stars_delta = metric.stars_delta_30d or 0
    if stars_delta > 100:
        momentum_ko = "최근 30일간 높은 관심도 상승 추세를 보이고 있습니다."
    elif stars_delta > 10:
        momentum_ko = "최근 30일간 안정적인 관심도를 유지하고 있습니다."
    else:
        momentum_ko = "최근 30일간 관심도 변화가 적은 상태입니다."

    anomaly_ko = None
    if anomaly_summaries:
        anomaly_ko = " / ".join(anomaly_summaries)

    return ExplanationResult(
        summary_ko=summary_ko,
        summary_en=summary_en,
        top_positive_factors=pos_list,
        top_negative_factors=neg_list,
        momentum_summary_ko=momentum_ko,
        anomaly_summary_ko=anomaly_ko,
    )
