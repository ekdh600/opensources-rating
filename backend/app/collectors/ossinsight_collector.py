"""OSS Insight 수집기 — 설계서 §7.4"""

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential
import structlog

from app.collectors.base import BaseCollector, CollectionResult

logger = structlog.get_logger()

OSSINSIGHT_API = "https://api.ossinsight.io/v1"


class OSSInsightCollector(BaseCollector):
    source_type = "ossinsight"

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=2, max=30))
    async def _get(self, client: httpx.AsyncClient, url: str) -> dict:
        resp = await client.get(url, timeout=30)
        resp.raise_for_status()
        return resp.json()

    async def collect(self, repo_url: str, **kwargs) -> CollectionResult:
        parts = repo_url.rstrip("/").split("/")
        owner, repo = parts[-2], parts[-1]
        slug = f"{owner}/{repo}".lower()

        try:
            async with httpx.AsyncClient() as client:
                repo_name = f"{owner}/{repo}"

                overview = await self._get(
                    client,
                    f"{OSSINSIGHT_API}/repos/{repo_name}/overview",
                )

                stars_history = await self._get(
                    client,
                    f"{OSSINSIGHT_API}/repos/{repo_name}/stargazers/history",
                )

                data = {
                    "overview": overview.get("data", {}),
                    "stars_history": stars_history.get("data", []),
                }

                return CollectionResult(
                    source_type=self.source_type,
                    project_slug=slug,
                    success=True,
                    data=data,
                )

        except Exception as e:
            logger.error("ossinsight_collect_error", repo=repo_url, error=str(e))
            return CollectionResult(
                source_type=self.source_type,
                project_slug=slug,
                success=False,
                error=str(e),
            )

    async def collect_batch(self, repo_urls: list[str], **kwargs) -> list[CollectionResult]:
        results = []
        for url in repo_urls:
            result = await self.collect(url)
            results.append(result)
        return results
