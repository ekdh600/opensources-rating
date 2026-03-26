from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Literal


class Settings(BaseSettings):
    app_name: str = "OSS Rating"
    debug: bool = False
    version: str = "0.1.0"

    database_url: str = "postgresql+asyncpg://oss_rating:oss_rating_dev@localhost:5432/oss_rating"
    database_echo: bool = False

    redis_url: str = "redis://localhost:6379/0"

    github_token: str = ""
    github_rate_limit_buffer: int = 100

    secret_key: str = "change-me-in-production"
    frontend_base_url: str = "http://localhost:3000"
    email_delivery_mode: Literal["log", "smtp"] = "log"
    email_from_name: str = "OSS Market"
    email_from_address: str = "no-reply@example.com"
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_use_tls: bool = True
    smtp_use_ssl: bool = False

    api_rate_limit: int = 60
    api_rate_limit_window: int = 60

    default_locale: str = "ko"
    supported_locales: list[str] = ["ko", "en"]

    scoring_version: str = "v1.0"

    weight_attention: float = 0.34
    weight_execution: float = 0.38
    weight_health: float = 0.18
    weight_trust: float = 0.10

    # 예측 시장 설정 (§20)
    prediction_initial_points: int = 10000
    prediction_maturity_days: int = 90
    prediction_threshold_up: float = 12.0
    prediction_threshold_down: float = -12.0
    prediction_max_stake_ratio: float = 0.3
    prediction_hit_base_reward: float = 1.5
    prediction_miss_penalty: float = 1.0
    prediction_difficulty_multiplier: float = 0.5
    prediction_newbie_limit_days: int = 7

    # JWT
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
