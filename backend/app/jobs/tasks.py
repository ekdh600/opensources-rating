"""비동기 배치 작업 정의"""

import asyncio
from datetime import date, datetime
import uuid

import structlog

from app.jobs.celery_app import celery_app

logger = structlog.get_logger()


def _run_async(coro):
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@celery_app.task(name="app.jobs.tasks.collect_github_all")
def collect_github_all():
    """전체 프로젝트 GitHub 데이터 수집"""
    _run_async(_collect_github_all())


async def _collect_github_all():
    from app.core.database import async_session_factory
    from app.collectors.github_collector import GitHubCollector
    from app.models.project import Project
    from app.models.ingestion_log import IngestionLog
    from sqlalchemy import select

    run_id = str(uuid.uuid4())
    collector = GitHubCollector()

    async with async_session_factory() as session:
        log = IngestionLog(
            source_type="github",
            run_id=run_id,
            started_at=datetime.utcnow(),
            status="running",
        )
        session.add(log)
        await session.flush()

        stmt = select(Project).where(Project.is_active.is_(True))
        result = await session.execute(stmt)
        projects = result.scalars().all()

        success_count = 0
        fail_count = 0

        for project in projects:
            collection = await collector.collect(project.primary_repo_url)
            if collection.success:
                success_count += 1
            else:
                fail_count += 1

        log.ended_at = datetime.utcnow()
        log.status = "completed"
        log.total_items = len(projects)
        log.success_items = success_count
        log.failed_items = fail_count
        await session.commit()

    logger.info("github_collection_done", run_id=run_id, success=success_count, failed=fail_count)


@celery_app.task(name="app.jobs.tasks.collect_ossinsight_all")
def collect_ossinsight_all():
    """전체 프로젝트 OSS Insight 데이터 수집"""
    _run_async(_collect_ossinsight_all())


async def _collect_ossinsight_all():
    from app.core.database import async_session_factory
    from app.collectors.ossinsight_collector import OSSInsightCollector
    from app.models.project import Project
    from sqlalchemy import select

    collector = OSSInsightCollector()

    async with async_session_factory() as session:
        stmt = select(Project).where(Project.is_active.is_(True))
        result = await session.execute(stmt)
        projects = result.scalars().all()

        for project in projects:
            await collector.collect(project.primary_repo_url)
        await session.commit()


@celery_app.task(name="app.jobs.tasks.compute_all_scores")
def compute_all_scores():
    """전체 프로젝트 점수 계산"""
    _run_async(_compute_all_scores())


async def _compute_all_scores():
    from app.core.database import async_session_factory
    from app.models.project import Project
    from app.models.daily_metric import ProjectMetricDaily
    from app.models.score import ProjectScoreDaily
    from app.scoring.engine import score_project
    from sqlalchemy import select, desc, func

    today = date.today()

    async with async_session_factory() as session:
        stmt = select(Project).where(Project.is_active.is_(True))
        result = await session.execute(stmt)
        projects = result.scalars().all()

        all_scores = []

        for project in projects:
            metric_stmt = (
                select(ProjectMetricDaily)
                .where(ProjectMetricDaily.project_id == project.id)
                .order_by(desc(ProjectMetricDaily.metric_date))
                .limit(1)
            )
            metric_result = await session.execute(metric_stmt)
            metric = metric_result.scalar_one_or_none()

            if not metric:
                continue

            score_result = score_project(metric)
            score_record = ProjectScoreDaily(
                project_id=project.id,
                score_date=today,
                attention_score=score_result.attention,
                execution_score=score_result.execution,
                health_score=score_result.health,
                trust_score=score_result.trust,
                total_score=score_result.total,
                scoring_version="v1.0",
            )
            session.add(score_record)
            all_scores.append((project, score_record))

        await session.flush()

        # 글로벌 랭킹
        all_scores.sort(key=lambda x: x[1].total_score, reverse=True)
        for rank, (proj, score) in enumerate(all_scores, 1):
            score.rank_global = rank

        await session.commit()


@celery_app.task(name="app.jobs.tasks.generate_all_explanations")
def generate_all_explanations():
    """전체 프로젝트 설명 생성"""
    _run_async(_generate_all_explanations())


@celery_app.task(name="app.jobs.tasks.publish_market_snapshot")
def publish_market_snapshot():
    """현재 계산된 종목/인덱스 스냅샷 publish 단계"""
    logger.info(
        "market_snapshot_publish_requested",
        published_at=datetime.utcnow().isoformat(),
        note="placeholder task until snapshot publish pipeline is implemented",
    )


@celery_app.task(name="app.jobs.tasks.refresh_market_news_and_explanations")
def refresh_market_news_and_explanations():
    """시장 뉴스/해설 갱신 배치"""
    _run_async(_refresh_market_news_and_explanations())


async def _refresh_market_news_and_explanations():
    # 현재는 explanation 생성만 운영 태스크로 존재하고, 뉴스는 seed 기반 구조다.
    # 추후 KRSS 연동이 들어오면 이 자리에서 뉴스 수집/정제/매핑을 함께 수행한다.
    await _generate_all_explanations()
    logger.info(
        "market_news_refresh_done",
        refreshed_at=datetime.utcnow().isoformat(),
        note="news ingestion is not yet automated; explanation refresh completed",
    )


async def _generate_all_explanations():
    from app.core.database import async_session_factory
    from app.models.project import Project
    from app.models.daily_metric import ProjectMetricDaily
    from app.models.score import ProjectScoreDaily
    from app.models.explanation import ProjectExplanationDaily
    from app.scoring.engine import score_project, ScoreResult
    from app.explainer.generator import generate_explanation
    from sqlalchemy import select, desc

    today = date.today()

    async with async_session_factory() as session:
        stmt = select(Project).where(Project.is_active.is_(True))
        result = await session.execute(stmt)
        projects = result.scalars().all()

        for project in projects:
            metric_stmt = (
                select(ProjectMetricDaily)
                .where(ProjectMetricDaily.project_id == project.id)
                .order_by(desc(ProjectMetricDaily.metric_date))
                .limit(1)
            )
            metric = (await session.execute(metric_stmt)).scalar_one_or_none()
            if not metric:
                continue

            score_stmt = (
                select(ProjectScoreDaily)
                .where(
                    ProjectScoreDaily.project_id == project.id,
                    ProjectScoreDaily.score_date == today,
                )
            )
            score = (await session.execute(score_stmt)).scalar_one_or_none()
            if not score:
                continue

            sr = ScoreResult(
                attention=score.attention_score,
                execution=score.execution_score,
                health=score.health_score,
                trust=score.trust_score,
                total=score.total_score,
            )

            expl = generate_explanation(metric, sr)

            record = ProjectExplanationDaily(
                project_id=project.id,
                score_date=today,
                summary_ko=expl.summary_ko,
                summary_en=expl.summary_en,
                top_positive_factors_json=expl.top_positive_factors,
                top_negative_factors_json=expl.top_negative_factors,
                momentum_summary_ko=expl.momentum_summary_ko,
                anomaly_summary_ko=expl.anomaly_summary_ko,
            )
            session.add(record)

        await session.commit()
