from datetime import date
from pydantic import BaseModel


class ExplanationOut(BaseModel):
    project_id: int
    score_date: date
    summary_ko: str | None = None
    summary_en: str | None = None
    top_positive_factors: list[dict] | None = None
    top_negative_factors: list[dict] | None = None
    momentum_summary_ko: str | None = None
    anomaly_summary_ko: str | None = None

    model_config = {"from_attributes": True}
