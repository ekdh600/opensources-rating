"""GitHub API 수집기 — 설계서 §7.1"""

from datetime import datetime, timedelta

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential
import structlog

from app.core.config import get_settings
from app.collectors.base import BaseCollector, CollectionResult

logger = structlog.get_logger()

GITHUB_API = "https://api.github.com"


def _parse_owner_repo(repo_url: str) -> tuple[str, str]:
    parts = repo_url.rstrip("/").split("/")
    return parts[-2], parts[-1]


class GitHubCollector(BaseCollector):
    source_type = "github"

    def __init__(self):
        settings = get_settings()
        self.headers = {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        }
        if settings.github_token:
            self.headers["Authorization"] = f"Bearer {settings.github_token}"

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=2, max=30))
    async def _get(self, client: httpx.AsyncClient, url: str) -> dict:
        resp = await client.get(url, headers=self.headers, timeout=30)
        resp.raise_for_status()
        return resp.json()

    async def collect(self, repo_url: str, **kwargs) -> CollectionResult:
        owner, repo = _parse_owner_repo(repo_url)
        slug = f"{owner}/{repo}".lower()

        try:
            async with httpx.AsyncClient() as client:
                repo_data = await self._get(client, f"{GITHUB_API}/repos/{owner}/{repo}")

                # 최근 커밋 활동
                since_30d = (datetime.utcnow() - timedelta(days=30)).isoformat() + "Z"
                since_7d = (datetime.utcnow() - timedelta(days=7)).isoformat() + "Z"
                since_1d = (datetime.utcnow() - timedelta(days=1)).isoformat() + "Z"

                commits_30d = await self._get(
                    client,
                    f"{GITHUB_API}/repos/{owner}/{repo}/commits?since={since_30d}&per_page=1",
                )

                # 릴리스
                releases = await self._get(
                    client,
                    f"{GITHUB_API}/repos/{owner}/{repo}/releases?per_page=10",
                )

                # PR (최근 30일)
                prs = await self._get(
                    client,
                    f"{GITHUB_API}/repos/{owner}/{repo}/pulls?state=all&sort=updated&direction=desc&per_page=100",
                )

                # 기여자
                contributors = await self._get(
                    client,
                    f"{GITHUB_API}/repos/{owner}/{repo}/contributors?per_page=1&anon=true",
                )

                now = datetime.utcnow()
                releases_90d = [
                    r for r in releases
                    if r.get("published_at") and
                    (now - datetime.fromisoformat(r["published_at"].rstrip("Z"))).days <= 90
                ]
                last_release_at = releases[0]["published_at"] if releases else None

                merged_prs = [p for p in prs if p.get("merged_at")]
                opened_prs = [
                    p for p in prs
                    if p.get("created_at") and
                    (now - datetime.fromisoformat(p["created_at"].rstrip("Z"))).days <= 30
                ]

                data = {
                    "stars_total": repo_data.get("stargazers_count", 0),
                    "forks_total": repo_data.get("forks_count", 0),
                    "watchers_total": repo_data.get("subscribers_count", 0),
                    "open_issues_total": repo_data.get("open_issues_count", 0),
                    "primary_language": repo_data.get("language"),
                    "description": repo_data.get("description"),
                    "homepage": repo_data.get("homepage"),
                    "pushed_at": repo_data.get("pushed_at"),
                    "archived": repo_data.get("archived", False),
                    "disabled": repo_data.get("disabled", False),
                    "license": repo_data.get("license", {}).get("spdx_id") if repo_data.get("license") else None,
                    "release_count_90d": len(releases_90d),
                    "last_release_at": last_release_at,
                    "prs_merged_30d": len(merged_prs),
                    "prs_opened_30d": len(opened_prs),
                }

                return CollectionResult(
                    source_type=self.source_type,
                    project_slug=slug,
                    success=True,
                    data=data,
                )

        except Exception as e:
            logger.error("github_collect_error", repo=repo_url, error=str(e))
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

    async def health_check(self) -> bool:
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"{GITHUB_API}/rate_limit",
                    headers=self.headers,
                    timeout=10,
                )
                data = resp.json()
                remaining = data.get("resources", {}).get("core", {}).get("remaining", 0)
                return remaining > get_settings().github_rate_limit_buffer
        except Exception:
            return False
