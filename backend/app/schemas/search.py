from pydantic import BaseModel

from app.schemas.project import ProjectSummary


class SearchResult(BaseModel):
    total: int
    results: list[ProjectSummary]
