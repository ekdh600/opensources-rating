from celery import Celery
from celery.schedules import crontab

from app.core.config import get_settings

settings = get_settings()

celery_app = Celery(
    "oss_rating",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["app.jobs.tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Seoul",
    enable_utc=True,
    beat_schedule={
        "collect-github-midnight": {
            "task": "app.jobs.tasks.collect_github_all",
            "schedule": crontab(minute=0, hour=0),
        },
        "collect-github-daytime": {
            "task": "app.jobs.tasks.collect_github_all",
            "schedule": crontab(minute=30, hour="6,12,18"),
        },
        "collect-ossinsight-midnight": {
            "task": "app.jobs.tasks.collect_ossinsight_all",
            "schedule": crontab(minute=0, hour=0),
        },
        "collect-ossinsight-daytime": {
            "task": "app.jobs.tasks.collect_ossinsight_all",
            "schedule": crontab(minute=30, hour="6,12,18"),
        },
        "compute-scores-midnight": {
            "task": "app.jobs.tasks.compute_all_scores",
            "schedule": crontab(minute=30, hour=0),
        },
        "compute-scores-daytime": {
            "task": "app.jobs.tasks.compute_all_scores",
            "schedule": crontab(minute=0, hour="7,13,19"),
        },
        "publish-market-snapshot-midnight": {
            "task": "app.jobs.tasks.publish_market_snapshot",
            "schedule": crontab(minute=40, hour=0),
        },
        "publish-market-snapshot-daytime": {
            "task": "app.jobs.tasks.publish_market_snapshot",
            "schedule": crontab(minute=10, hour="7,13,19"),
        },
        "refresh-market-news-and-explanations-twice": {
            "task": "app.jobs.tasks.refresh_market_news_and_explanations",
            "schedule": crontab(minute=20, hour="1,19"),
        },
    },
)
