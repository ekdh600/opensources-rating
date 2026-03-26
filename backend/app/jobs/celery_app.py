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
        "collect-github-hourly": {
            "task": "app.jobs.tasks.collect_github_all",
            "schedule": crontab(minute=0),
        },
        "collect-ossinsight-3h": {
            "task": "app.jobs.tasks.collect_ossinsight_all",
            "schedule": crontab(minute=0, hour="*/3"),
        },
        "compute-scores-daily": {
            "task": "app.jobs.tasks.compute_all_scores",
            "schedule": crontab(minute=30, hour=2),
        },
        "generate-explanations-daily": {
            "task": "app.jobs.tasks.generate_all_explanations",
            "schedule": crontab(minute=0, hour=3),
        },
    },
)
