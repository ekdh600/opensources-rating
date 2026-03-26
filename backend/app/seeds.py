"""초기 시드 데이터 — 카테고리 + 대표 프로젝트 + 시즌 + 뱃지"""

import asyncio
import math
from datetime import datetime, date, timedelta

from sqlalchemy import delete, select

from app.core.database import async_session_factory, engine, Base
from app.models.category import Category
from app.models.project import Project, FoundationType, CNCFStage, AggregationPolicy
from app.models.project_source import ProjectSource, SourceType
from app.models.daily_metric import ProjectMetricDaily
from app.models.score import ProjectScoreDaily
from app.models.season import Season, SeasonStatus
from app.models.badge import Badge


CATEGORIES = [
    ("kubernetes", "쿠버네티스", "Kubernetes", 1),
    ("container-runtime", "컨테이너 런타임", "Container Runtime", 2),
    ("service-mesh", "서비스 메시", "Service Mesh", 3),
    ("networking-cni", "네트워킹/CNI", "Networking/CNI", 4),
    ("ingress-api-gateway", "인그레스/API 게이트웨이", "Ingress/API Gateway", 5),
    ("observability", "관측성/모니터링", "Observability/Monitoring", 6),
    ("logging", "로깅", "Logging", 7),
    ("security", "보안", "Security", 8),
    ("storage", "스토리지", "Storage", 9),
    ("database", "데이터베이스", "Database", 10),
    ("messaging", "메시징/스트리밍", "Messaging/Streaming", 11),
    ("cicd", "CI/CD", "CI/CD", 12),
    ("gitops", "GitOps", "GitOps", 13),
    ("iac", "IaC", "Infrastructure as Code", 14),
    ("cloud-platform", "클라우드 플랫폼", "Cloud Platform", 15),
    ("ai-ml", "AI/ML", "AI/ML", 16),
    ("dev-tools", "개발 도구", "Developer Tools", 17),
]

HISTORY_DAYS = 30

TREND_PROFILES = {
    "kubernetes": {"trend": 0.55, "volatility": 0.45, "response_hours": 26.0},
    "prometheus": {"trend": 0.82, "volatility": 0.38, "response_hours": 22.0},
    "envoy": {"trend": 0.18, "volatility": 0.52, "response_hours": 30.0},
    "argo-cd": {"trend": 0.96, "volatility": 0.42, "response_hours": 18.0},
    "cilium": {"trend": -0.28, "volatility": 0.58, "response_hours": 40.0},
    "istio": {"trend": -0.62, "volatility": 0.50, "response_hours": 54.0},
    "grafana": {"trend": 0.44, "volatility": 0.36, "response_hours": 20.0},
    "terraform": {"trend": 0.12, "volatility": 0.41, "response_hours": 36.0},
    "docker": {"trend": -0.08, "volatility": 0.44, "response_hours": 42.0},
    "etcd": {"trend": -0.36, "volatility": 0.40, "response_hours": 46.0},
}


def _clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(maximum, value))


def _oscillation(seed: int, day_index: int, speed: float, scale: float) -> float:
    return math.sin((day_index + 1 + seed) * speed) * scale


def _build_metric(project_id: int, project_seed: dict, day: date, day_index: int) -> ProjectMetricDaily:
    profile = TREND_PROFILES[project_seed["slug"]]
    trend = profile["trend"]
    volatility = profile["volatility"]
    response_hours = profile["response_hours"]
    seed = sum(ord(char) for char in project_seed["slug"]) % 17
    progress = day_index / max(HISTORY_DAYS - 1, 1)
    momentum = trend * ((progress - 0.5) * 2.1) + _oscillation(seed, day_index, 0.72, volatility * 0.55)
    daily_star_velocity = max(1, int(project_seed["stars"] * (0.00018 + max(trend, -0.2) * 0.00008)))
    stars_total = max(
        100,
        project_seed["stars"] - (HISTORY_DAYS - 1 - day_index) * daily_star_velocity,
    )
    forks_total = max(
        10,
        project_seed["forks"] - (HISTORY_DAYS - 1 - day_index) * max(1, int(daily_star_velocity * 0.28)),
    )
    watchers_total = max(
        5,
        project_seed["watchers"] - (HISTORY_DAYS - 1 - day_index) * max(1, int(daily_star_velocity * 0.05)),
    )

    stars_delta_1d = max(2, int(project_seed["stars"] * (0.00009 + 0.0001 * (momentum + 1.1))))
    stars_delta_7d = max(stars_delta_1d * 6, int(project_seed["stars"] * (0.0012 + 0.001 * (momentum + 1.0))))
    stars_delta_30d = max(stars_delta_7d * 3, int(project_seed["stars"] * (0.004 + 0.003 * (momentum + 1.0))))

    commits_30d = max(12, int(project_seed["commits_30d"] * (1 + momentum * 0.26)))
    prs_merged_30d = max(8, int(project_seed["prs_merged_30d"] * (1 + momentum * 0.24)))
    issues_closed_30d = max(6, int(project_seed["issues_closed_30d"] * (1 + momentum * 0.22)))
    contributors_30d = max(5, int(project_seed["contributors_30d"] * (1 + momentum * 0.20)))
    releases_90d = max(1, int(round(project_seed["releases_90d"] * (1 + trend * 0.15 + progress * 0.08))))

    issue_close_ratio = _clamp(0.66 + trend * 0.09 + _oscillation(seed, day_index, 0.35, 0.05), 0.4, 0.95)
    pr_merge_ratio = _clamp(0.74 + trend * 0.07 + _oscillation(seed, day_index, 0.41, 0.04), 0.45, 0.96)
    maintainer_response = _clamp(response_hours - trend * 10 + _oscillation(seed, day_index, 0.22, 8.0), 8.0, 96.0)
    stale_issue_ratio = _clamp(0.18 - trend * 0.05 + abs(_oscillation(seed, day_index, 0.33, 0.035)), 0.03, 0.42)
    velocity_percentile = _clamp(54 + trend * 26 + _oscillation(seed, day_index, 0.52, 10.0), 20.0, 98.0)
    security_score = _clamp(72 + trend * 8 + _oscillation(seed, day_index, 0.27, 4.0), 55.0, 96.0)
    dependency_risk = _clamp(29 - trend * 6 + abs(_oscillation(seed, day_index, 0.31, 6.0)), 8.0, 48.0)

    return ProjectMetricDaily(
        project_id=project_id,
        metric_date=day,
        source_type="github",
        stars_total=stars_total,
        stars_delta_1d=stars_delta_1d,
        stars_delta_7d=stars_delta_7d,
        stars_delta_30d=stars_delta_30d,
        forks_total=forks_total,
        watchers_total=watchers_total,
        commits_1d=max(1, commits_30d // 18),
        commits_7d=max(5, commits_30d // 4),
        commits_30d=commits_30d,
        prs_opened_30d=max(prs_merged_30d + 4, int(prs_merged_30d * 1.18)),
        prs_merged_30d=prs_merged_30d,
        issues_opened_30d=max(issues_closed_30d + 3, int(issues_closed_30d * 1.12)),
        issues_closed_30d=issues_closed_30d,
        contributors_30d=contributors_30d,
        contributors_90d=max(contributors_30d + 8, int(contributors_30d * 1.45)),
        release_count_90d=releases_90d,
        issue_close_ratio=issue_close_ratio,
        pr_merge_ratio=pr_merge_ratio,
        maintainer_response_hours_p50=maintainer_response,
        stale_issue_ratio=stale_issue_ratio,
        velocity_percentile=velocity_percentile,
        security_score_raw=security_score,
        dependency_risk_score_raw=dependency_risk,
        last_commit_at=datetime.combine(day, datetime.min.time()) + timedelta(hours=10),
        last_release_at=datetime.combine(day, datetime.min.time()) - timedelta(days=max(1, 10 - int(trend * 4))),
    )

SEED_PROJECTS = [
    {
        "slug": "kubernetes",
        "name_ko": "쿠버네티스",
        "name_en": "Kubernetes",
        "desc_ko": "프로덕션 등급 컨테이너 오케스트레이션 시스템",
        "desc_en": "Production-Grade Container Orchestration",
        "repo": "https://github.com/kubernetes/kubernetes",
        "foundation": FoundationType.CNCF,
        "cncf_stage": CNCFStage.GRADUATED,
        "category": "kubernetes",
        "language": "Go",
        "stars": 112000, "forks": 39000, "watchers": 3200,
        "commits_30d": 450, "prs_merged_30d": 320, "issues_closed_30d": 280,
        "contributors_30d": 180, "releases_90d": 8,
    },
    {
        "slug": "prometheus",
        "name_ko": "프로메테우스",
        "name_en": "Prometheus",
        "desc_ko": "시스템 모니터링 및 알림 툴킷",
        "desc_en": "The Prometheus monitoring system and time series database",
        "repo": "https://github.com/prometheus/prometheus",
        "foundation": FoundationType.CNCF,
        "cncf_stage": CNCFStage.GRADUATED,
        "category": "observability",
        "language": "Go",
        "stars": 56000, "forks": 9100, "watchers": 1100,
        "commits_30d": 120, "prs_merged_30d": 85, "issues_closed_30d": 60,
        "contributors_30d": 45, "releases_90d": 3,
    },
    {
        "slug": "envoy",
        "name_ko": "엔보이",
        "name_en": "Envoy",
        "desc_ko": "클라우드 네이티브 고성능 L7 프록시",
        "desc_en": "Cloud-native high-performance edge/middle/service proxy",
        "repo": "https://github.com/envoyproxy/envoy",
        "foundation": FoundationType.CNCF,
        "cncf_stage": CNCFStage.GRADUATED,
        "category": "networking-cni",
        "language": "C++",
        "stars": 25000, "forks": 4900, "watchers": 550,
        "commits_30d": 200, "prs_merged_30d": 150, "issues_closed_30d": 90,
        "contributors_30d": 70, "releases_90d": 4,
    },
    {
        "slug": "argo-cd",
        "name_ko": "Argo CD",
        "name_en": "Argo CD",
        "desc_ko": "쿠버네티스를 위한 선언적 GitOps 지속 배포 도구",
        "desc_en": "Declarative Continuous Deployment for Kubernetes",
        "repo": "https://github.com/argoproj/argo-cd",
        "foundation": FoundationType.CNCF,
        "cncf_stage": CNCFStage.GRADUATED,
        "category": "gitops",
        "language": "Go",
        "stars": 18000, "forks": 5500, "watchers": 280,
        "commits_30d": 90, "prs_merged_30d": 65, "issues_closed_30d": 45,
        "contributors_30d": 35, "releases_90d": 2,
    },
    {
        "slug": "cilium",
        "name_ko": "실리움",
        "name_en": "Cilium",
        "desc_ko": "eBPF 기반 네트워킹, 관측성, 보안",
        "desc_en": "eBPF-based Networking, Observability, Security",
        "repo": "https://github.com/cilium/cilium",
        "foundation": FoundationType.CNCF,
        "cncf_stage": CNCFStage.GRADUATED,
        "category": "networking-cni",
        "language": "Go",
        "stars": 20000, "forks": 2900, "watchers": 350,
        "commits_30d": 150, "prs_merged_30d": 110, "issues_closed_30d": 70,
        "contributors_30d": 55, "releases_90d": 3,
    },
    {
        "slug": "istio",
        "name_ko": "이스티오",
        "name_en": "Istio",
        "desc_ko": "서비스 메시 플랫폼",
        "desc_en": "An open platform to connect, manage, and secure microservices",
        "repo": "https://github.com/istio/istio",
        "foundation": FoundationType.CNCF,
        "cncf_stage": CNCFStage.GRADUATED,
        "category": "service-mesh",
        "language": "Go",
        "stars": 36000, "forks": 7700, "watchers": 950,
        "commits_30d": 100, "prs_merged_30d": 75, "issues_closed_30d": 55,
        "contributors_30d": 40, "releases_90d": 3,
    },
    {
        "slug": "grafana",
        "name_ko": "그라파나",
        "name_en": "Grafana",
        "desc_ko": "오픈 소스 관측성 및 데이터 시각화 플랫폼",
        "desc_en": "The open and composable observability and data visualization platform",
        "repo": "https://github.com/grafana/grafana",
        "foundation": FoundationType.INDEPENDENT,
        "cncf_stage": None,
        "category": "observability",
        "language": "TypeScript",
        "stars": 65000, "forks": 12000, "watchers": 1400,
        "commits_30d": 350, "prs_merged_30d": 280, "issues_closed_30d": 200,
        "contributors_30d": 120, "releases_90d": 6,
    },
    {
        "slug": "terraform",
        "name_ko": "테라폼",
        "name_en": "Terraform",
        "desc_ko": "인프라를 코드로 안전하게 구축, 변경 및 버전 관리",
        "desc_en": "Terraform enables you to safely and predictably create, change, and improve infrastructure",
        "repo": "https://github.com/hashicorp/terraform",
        "foundation": FoundationType.INDEPENDENT,
        "cncf_stage": None,
        "category": "iac",
        "language": "Go",
        "stars": 43000, "forks": 9500, "watchers": 1100,
        "commits_30d": 80, "prs_merged_30d": 50, "issues_closed_30d": 40,
        "contributors_30d": 25, "releases_90d": 2,
    },
    {
        "slug": "docker",
        "name_ko": "도커 (Moby)",
        "name_en": "Docker (Moby)",
        "desc_ko": "컨테이너 생태계를 위한 오픈 프레임워크",
        "desc_en": "The Moby Project - a collaborative project for the container ecosystem",
        "repo": "https://github.com/moby/moby",
        "foundation": FoundationType.INDEPENDENT,
        "cncf_stage": None,
        "category": "container-runtime",
        "language": "Go",
        "stars": 69000, "forks": 18000, "watchers": 2900,
        "commits_30d": 60, "prs_merged_30d": 40, "issues_closed_30d": 30,
        "contributors_30d": 20, "releases_90d": 2,
    },
    {
        "slug": "etcd",
        "name_ko": "etcd",
        "name_en": "etcd",
        "desc_ko": "분산 키-값 저장소",
        "desc_en": "Distributed reliable key-value store",
        "repo": "https://github.com/etcd-io/etcd",
        "foundation": FoundationType.CNCF,
        "cncf_stage": CNCFStage.GRADUATED,
        "category": "database",
        "language": "Go",
        "stars": 48000, "forks": 9800, "watchers": 1200,
        "commits_30d": 50, "prs_merged_30d": 35, "issues_closed_30d": 25,
        "contributors_30d": 18, "releases_90d": 2,
    },
]


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_factory() as session:
        # 카테고리
        existing = (await session.execute(select(Category))).scalars().all()
        if not existing:
            for slug, name_ko, name_en, order in CATEGORIES:
                session.add(Category(slug=slug, name_ko=name_ko, name_en=name_en, sort_order=order))
            await session.flush()

        cat_map = {}
        cats = (await session.execute(select(Category))).scalars().all()
        for c in cats:
            cat_map[c.slug] = c.id

        # 프로젝트
        existing_projects = (await session.execute(select(Project))).scalars().all()
        today = date.today()
        if not existing_projects:
            for p in SEED_PROJECTS:
                project = Project(
                    slug=p["slug"],
                    display_name_ko=p["name_ko"],
                    display_name_en=p["name_en"],
                    short_description_ko=p["desc_ko"],
                    short_description_en=p["desc_en"],
                    primary_repo_url=p["repo"],
                    foundation_type=p["foundation"],
                    cncf_stage=p["cncf_stage"],
                    category_id=cat_map.get(p["category"]),
                    primary_language=p["language"],
                    aggregation_policy=AggregationPolicy.SINGLE_REPO,
                )
                session.add(project)
                await session.flush()

                session.add(ProjectSource(
                    project_id=project.id,
                    source_type=SourceType.GITHUB,
                    external_id=p["repo"].split("github.com/")[1],
                    external_url=p["repo"],
                    is_primary=True,
                ))

        await session.commit()
        projects = (await session.execute(select(Project))).scalars().all()
        project_map = {project.slug: project for project in projects}
        project_by_id = {project.id: project for project in projects}

        metric_rows = (await session.execute(select(ProjectMetricDaily.id))).scalars().all()
        score_rows = (await session.execute(select(ProjectScoreDaily.id))).scalars().all()
        desired_rows = len(SEED_PROJECTS) * HISTORY_DAYS
        if len(metric_rows) != desired_rows or len(score_rows) != desired_rows:
            await session.execute(delete(ProjectScoreDaily))
            await session.execute(delete(ProjectMetricDaily))
            await session.flush()

            from app.scoring.engine import score_project

            scores_by_day: dict[date, list[ProjectScoreDaily]] = {}
            for day_index, day in enumerate(
                [today - timedelta(days=offset) for offset in range(HISTORY_DAYS - 1, -1, -1)]
            ):
                day_metrics: list[ProjectMetricDaily] = []
                for project_seed in SEED_PROJECTS:
                    project = project_map[project_seed["slug"]]
                    metric = _build_metric(project.id, project_seed, day, day_index)
                    day_metrics.append(metric)
                    session.add(metric)

                day_scores: list[ProjectScoreDaily] = []
                for metric in day_metrics:
                    peers = [peer for peer in day_metrics if peer.project_id != metric.project_id]
                    score_result = score_project(metric, peers)
                    score = ProjectScoreDaily(
                        project_id=metric.project_id,
                        score_date=day,
                        attention_score=score_result.attention,
                        execution_score=score_result.execution,
                        health_score=score_result.health,
                        trust_score=score_result.trust,
                        total_score=score_result.total,
                        scoring_version="v1.0",
                    )
                    day_scores.append(score)
                    session.add(score)
                scores_by_day[day] = day_scores

            ordered_days = sorted(scores_by_day.keys())
            previous_by_project: dict[int, ProjectScoreDaily] = {}
            for day in ordered_days:
                day_scores = scores_by_day[day]
                day_scores.sort(key=lambda item: item.total_score, reverse=True)
                for rank, score in enumerate(day_scores, 1):
                    score.rank_global = rank

                cncf_scores = [
                    score for score in day_scores
                    if project_by_id[score.project_id].foundation_type == FoundationType.CNCF
                ]
                for rank, score in enumerate(cncf_scores, 1):
                    score.rank_cncf = rank

                category_groups: dict[int | None, list[ProjectScoreDaily]] = {}
                for score in day_scores:
                    project = project_by_id[score.project_id]
                    category_groups.setdefault(project.category_id, []).append(score)
                for category_scores in category_groups.values():
                    for rank, score in enumerate(category_scores, 1):
                        score.rank_category = rank

                rising_candidates: list[tuple[float, ProjectScoreDaily]] = []
                for score in day_scores:
                    previous = previous_by_project.get(score.project_id)
                    if previous:
                        rising_candidates.append((score.total_score - previous.total_score, score))
                    previous_by_project[score.project_id] = score

                for rank, (_, score) in enumerate(
                    sorted(rising_candidates, key=lambda item: item[0], reverse=True),
                    1,
                ):
                    score.rising_rank = rank

            await session.commit()

        # 시즌 생성 (§20.3)
        existing_seasons = (await session.execute(select(Season))).scalars().all()
        if not existing_seasons:
            season = Season(
                name="시즌 1",
                slug="season-1",
                start_date=today,
                end_date=today + timedelta(days=90),
                status=SeasonStatus.ACTIVE,
                is_current=True,
                initial_points=10000,
            )
            session.add(season)
            await session.flush()

        # 뱃지 시드 (§20.8)
        existing_badges = (await session.execute(select(Badge))).scalars().all()
        if not existing_badges:
            badge_seeds = [
                ("season_champion", "시즌 챔피언", "Season Champion",
                 "시즌 최종 1위를 차지한 예측가", "Top predictor of the season", "🏆", "legendary"),
                ("season_top10", "상위 10 예측가", "Season Top 10",
                 "시즌 최종 TOP 10 진입", "Finished in season top 10", "🥇", "epic"),
                ("accuracy_excellent", "정확도 우수", "Accuracy Master",
                 "적중률 70% 이상 달성", "Achieved 70%+ accuracy", "🎯", "rare"),
                ("undervalue_hunter", "저평가 헌터", "Undervalue Hunter",
                 "저평가된 프로젝트를 다수 적중", "Correctly predicted multiple undervalued projects", "🔍", "epic"),
                ("contrarian_hit", "역발상 적중자", "Contrarian Hit",
                 "대세와 반대 포지션으로 적중 성공", "Successfully went against the majority", "🔄", "rare"),
                ("early_signal", "얼리 시그널", "Early Signal",
                 "주목받기 전 프로젝트를 조기 포착", "Spotted projects before they gained attention", "⚡", "epic"),
                ("streak_master", "연속 적중왕", "Streak Master",
                 "10연속 적중 달성", "Achieved 10 consecutive hits", "🔥", "rare"),
                ("first_prediction", "첫 예측", "First Prediction",
                 "첫 번째 예측 완료", "Made the first prediction", "🌱", "common"),
            ]
            for slug, name_ko, name_en, desc_ko, desc_en, icon, rarity in badge_seeds:
                session.add(Badge(
                    slug=slug, name_ko=name_ko, name_en=name_en,
                    description_ko=desc_ko, description_en=desc_en,
                    icon=icon, badge_type=slug, rarity=rarity,
                ))

        await session.commit()

    print(f"시드 데이터 삽입 완료: 카테고리 {len(CATEGORIES)}개, 프로젝트 {len(SEED_PROJECTS)}개, 시즌 1개, 뱃지 8개")


if __name__ == "__main__":
    asyncio.run(seed())
