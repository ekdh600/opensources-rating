from datetime import date, datetime

from pydantic import BaseModel, Field


class TradingOrderCreate(BaseModel):
    project_slug: str
    side: str = Field(pattern="^(buy|sell)$")
    quantity: int = Field(gt=0, le=100000)


class TradingQuoteOut(BaseModel):
    project_id: int
    slug: str
    name: str
    category: str | None = None
    current_price: float
    previous_close: float
    change_points: float
    change_rate: float
    rank_global: int | None = None
    score_date: date


class TradingOrderOut(BaseModel):
    id: int
    project_id: int
    season_id: int
    side: str
    order_type: str
    status: str
    quantity: int
    price: float
    gross_points: int
    fee_points: int
    net_points: int
    created_at: datetime

    model_config = {"from_attributes": True}


class TradingPositionOut(BaseModel):
    project_id: int
    project_slug: str
    project_name: str
    quantity: int
    average_price: float
    current_price: float
    market_value: int
    invested_points: int
    unrealized_pnl_points: int
    realized_pnl_points: int


class TradingPortfolioOut(BaseModel):
    season_id: int
    cash_points: int
    invested_points: int
    market_value: int
    unrealized_pnl_points: int
    realized_pnl_points: int
    total_equity: int
    positions: list[TradingPositionOut]


class TradingOrderResult(BaseModel):
    order: TradingOrderOut
    cash_points: int
    position: TradingPositionOut | None = None


class ProjectCommentCreate(BaseModel):
    content: str = Field(min_length=1, max_length=2000)
    parent_id: int | None = None


class ProjectCommentOut(BaseModel):
    id: int
    project_id: int
    parent_id: int | None
    user_id: int
    username: str
    display_name: str
    content: str
    recommendation_count: int
    recommended_by_me: bool = False
    created_at: datetime
    updated_at: datetime


class CommentRecommendationOut(BaseModel):
    comment_id: int
    recommendation_count: int
    recommended_by_me: bool
