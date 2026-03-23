"""deps.dev 수집기 — 설계서 §7.6, 공급망/보안/라이선스 관련 신뢰도 보조"""

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential
import structlog

from app.collectors.base import BaseCollector, CollectionResult

logger = structlog.get_logger()

DEPSDEV_API = "https://api.deps.dev/v3alpha"


class DepsDevCollector(BaseCollector):
    source_type = "depsdev"

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=2, max=30))
    async def _get(self, client: httpx.AsyncClient, url: str) -> dict:
        resp = await client.get(url, timeout=30)
        resp.raise_for_status()
        return resp.json()

    async def collect(self, repo_url: str, **kwargs) -> CollectionResult:
        parts = repo_url.rstrip("/").split("/")
        owner, repo = parts[-2], parts[-1]
        slug = f"{owner}/{repo}".lower()

        package_system = kwargs.get("package_system", "GO")
        package_name = kwargs.get("package_name", f"github.com/{owner}/{repo}")

        try:
            async with httpx.AsyncClient() as client:
                pkg_url = f"{DEPSDEV_API}/systems/{package_system}/packages/{package_name}"
                pkg_data = await self._get(client, pkg_url)

                data = {
                    "package_info": pkg_data,
                }

                return CollectionResult(
                    source_type=self.source_type,
                    project_slug=slug,
                    success=True,
                    data=data,
                )

        except Exception as e:
            logger.error("depsdev_collect_error", repo=repo_url, error=str(e))
            return CollectionResult(
                source_type=self.source_type,
                project_slug=slug,
                success=False,
                error=str(e),
            )

    async def collect_batch(self, repo_urls: list[str], **kwargs) -> list[CollectionResult]:
        results = []
        for url in repo_urls:
            result = await self.collect(url, **kwargs)
            results.append(result)
        return results
