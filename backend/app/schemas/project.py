from datetime import datetime
from pydantic import BaseModel


class CategoryOut(BaseModel):
    id: int
    slug: str
    name_ko: str
    name_en: str
    parent_id: int | None = None
    sort_order: int = 0

    model_config = {"from_attributes": True}


class ProjectSourceOut(BaseModel):
    id: int
    source_type: str
    external_id: str | None = None
    external_url: str | None = None
    is_primary: bool

    model_config = {"from_attributes": True}


class ProjectSummary(BaseModel):
    id: int
    slug: str
    display_name_ko: str
    display_name_en: str
    short_description_ko: str | None = None
    foundation_type: str | None = None
    cncf_stage: str | None = None
    category: CategoryOut | None = None
    primary_language: str | None = None
    logo_url: str | None = None
    is_active: bool

    model_config = {"from_attributes": True}


class ProjectDetail(ProjectSummary):
    short_description_en: str | None = None
    primary_repo_url: str
    homepage_url: str | None = None
    aggregation_policy: str
    sources: list[ProjectSourceOut] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
