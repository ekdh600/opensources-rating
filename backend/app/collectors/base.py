"""수집기 기본 인터페이스"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any

import structlog

logger = structlog.get_logger()


@dataclass
class CollectionResult:
    source_type: str
    project_slug: str
    success: bool
    data: dict[str, Any] = field(default_factory=dict)
    error: str | None = None
    collected_at: datetime = field(default_factory=datetime.utcnow)


class BaseCollector(ABC):
    source_type: str = "unknown"

    @abstractmethod
    async def collect(self, repo_url: str, **kwargs) -> CollectionResult:
        """단일 저장소 데이터 수집"""
        ...

    @abstractmethod
    async def collect_batch(self, repo_urls: list[str], **kwargs) -> list[CollectionResult]:
        """배치 수집"""
        ...

    async def health_check(self) -> bool:
        return True
