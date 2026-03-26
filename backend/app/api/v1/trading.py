from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import delete, desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.project import Project
from app.models.score import ProjectScoreDaily
from app.models.season import Season, SeasonStatus
from app.models.trading import CommentRecommendation, ProjectComment, TradeOrder, UserPosition
from app.models.user import User
from app.schemas.trading import (
    TradingOrderCreate,
    TradingOrderOut,
    TradingOrderResult,
    CommentRecommendationOut,
    ProjectCommentCreate,
    ProjectCommentOut,
    TradingPortfolioOut,
    TradingPositionOut,
    TradingQuoteOut,
)

router = APIRouter(prefix="/trading", tags=["트레이딩 게임"])

TRADE_FEE_RATE = 0.002


async def _get_current_season(db: AsyncSession) -> Season:
    stmt = select(Season).where(Season.is_current.is_(True), Season.status == SeasonStatus.ACTIVE)
    result = await db.execute(stmt)
    season = result.scalar_one_or_none()
    if not season:
        raise HTTPException(status_code=400, detail="현재 활성 시즌이 없습니다")
    return season


async def _get_project_by_slug(db: AsyncSession, slug: str) -> Project:
    stmt = select(Project).where(Project.slug == slug, Project.is_active.is_(True))
    project = (await db.execute(stmt)).scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")
    return project


async def _get_latest_score(db: AsyncSession, project_id: int) -> ProjectScoreDaily:
    stmt = (
        select(ProjectScoreDaily)
        .where(ProjectScoreDaily.project_id == project_id)
        .order_by(desc(ProjectScoreDaily.score_date))
        .limit(1)
    )
    score = (await db.execute(stmt)).scalar_one_or_none()
    if not score:
        raise HTTPException(status_code=400, detail="프로젝트 가격 데이터가 없습니다")
    return score


async def _get_previous_score(db: AsyncSession, project_id: int, latest_date) -> ProjectScoreDaily | None:
    stmt = (
        select(ProjectScoreDaily)
        .where(
            ProjectScoreDaily.project_id == project_id,
            ProjectScoreDaily.score_date < latest_date,
        )
        .order_by(desc(ProjectScoreDaily.score_date))
        .limit(1)
    )
    return (await db.execute(stmt)).scalar_one_or_none()


def _display_name(project: Project) -> str:
    return project.display_name_ko or project.display_name_en


def _fee(points: int) -> int:
    return int(round(points * TRADE_FEE_RATE))


def _build_position_view(position: UserPosition, project: Project, current_price: float) -> TradingPositionOut:
    market_value = int(round(position.quantity * current_price))
    unrealized = market_value - position.invested_points
    return TradingPositionOut(
        project_id=project.id,
        project_slug=project.slug,
        project_name=_display_name(project),
        quantity=position.quantity,
        average_price=round(position.average_price, 3),
        current_price=round(current_price, 3),
        market_value=market_value,
        invested_points=position.invested_points,
        unrealized_pnl_points=unrealized,
        realized_pnl_points=position.realized_pnl_points,
    )


async def _build_comment_view(
    db: AsyncSession,
    *,
    comment: ProjectComment,
    current_user_id: int,
) -> ProjectCommentOut:
    author = await db.get(User, comment.user_id)
    count_stmt = select(func.count(CommentRecommendation.id)).where(CommentRecommendation.comment_id == comment.id)
    recommendation_count = int((await db.execute(count_stmt)).scalar() or 0)
    me_stmt = select(CommentRecommendation.id).where(
        CommentRecommendation.comment_id == comment.id,
        CommentRecommendation.user_id == current_user_id,
    )
    recommended_by_me = (await db.execute(me_stmt)).scalar_one_or_none() is not None
    return ProjectCommentOut(
        id=comment.id,
        project_id=comment.project_id,
        parent_id=comment.parent_id,
        user_id=comment.user_id,
        username=author.username if author else "unknown",
        display_name=author.display_name if author else "Unknown",
        content=comment.content,
        recommendation_count=recommendation_count,
        recommended_by_me=recommended_by_me,
        created_at=comment.created_at,
        updated_at=comment.updated_at,
    )


@router.get("/quotes", response_model=list[TradingQuoteOut])
async def list_quotes(
    limit: int = Query(20, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
):
    projects = (await db.execute(select(Project).where(Project.is_active.is_(True)).order_by(Project.id))).scalars().all()
    rows: list[TradingQuoteOut] = []
    for project in projects:
        latest = await _get_latest_score(db, project.id)
        previous = await _get_previous_score(db, project.id, latest.score_date)
        previous_close = previous.total_score if previous else latest.total_score
        change_points = latest.total_score - previous_close
        change_rate = (change_points / previous_close * 100) if previous_close else 0.0
        rows.append(
            TradingQuoteOut(
                project_id=project.id,
                slug=project.slug,
                name=_display_name(project),
                category=project.category.name_ko if project.category else None,
                current_price=round(latest.total_score, 3),
                previous_close=round(previous_close, 3),
                change_points=round(change_points, 3),
                change_rate=round(change_rate, 3),
                rank_global=latest.rank_global,
                score_date=latest.score_date,
            )
        )
        if len(rows) >= limit:
            break
    return rows


@router.get("/portfolio", response_model=TradingPortfolioOut)
async def get_portfolio(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    season = await _get_current_season(db)
    positions = (
        await db.execute(
            select(UserPosition).where(
                UserPosition.user_id == user.id,
                UserPosition.season_id == season.id,
                UserPosition.quantity > 0,
            )
        )
    ).scalars().all()

    result_positions: list[TradingPositionOut] = []
    invested = 0
    market_value = 0
    realized = 0
    for position in positions:
        project = await db.get(Project, position.project_id)
        if not project:
            continue
        latest = await _get_latest_score(db, project.id)
        view = _build_position_view(position, project, latest.total_score)
        invested += view.invested_points
        market_value += view.market_value
        realized += view.realized_pnl_points
        result_positions.append(view)

    unrealized = market_value - invested
    total_equity = user.points_balance + market_value
    return TradingPortfolioOut(
        season_id=season.id,
        cash_points=user.points_balance,
        invested_points=invested,
        market_value=market_value,
        unrealized_pnl_points=unrealized,
        realized_pnl_points=realized,
        total_equity=total_equity,
        positions=sorted(result_positions, key=lambda item: item.market_value, reverse=True),
    )


@router.get("/orders", response_model=list[TradingOrderOut])
async def list_orders(
    limit: int = Query(50, ge=1, le=200),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    orders = (
        await db.execute(
            select(TradeOrder)
            .where(TradeOrder.user_id == user.id)
            .order_by(desc(TradeOrder.created_at))
            .limit(limit)
        )
    ).scalars().all()
    return [TradingOrderOut.model_validate(order) for order in orders]


@router.post("/orders", response_model=TradingOrderResult)
async def create_order(
    body: TradingOrderCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    season = await _get_current_season(db)
    project = await _get_project_by_slug(db, body.project_slug)
    latest = await _get_latest_score(db, project.id)
    price = round(latest.total_score, 3)

    position = (
        await db.execute(
            select(UserPosition).where(
                UserPosition.user_id == user.id,
                UserPosition.project_id == project.id,
                UserPosition.season_id == season.id,
            )
        )
    ).scalar_one_or_none()

    if position is None:
        position = UserPosition(user_id=user.id, project_id=project.id, season_id=season.id)
        db.add(position)
        await db.flush()

    gross_points = int(round(price * body.quantity))
    fee_points = _fee(gross_points)

    if body.side == "buy":
        net_points = gross_points + fee_points
        if user.points_balance < net_points:
            raise HTTPException(status_code=400, detail="포인트 잔고가 부족합니다")

        user.points_balance -= net_points
        new_quantity = position.quantity + body.quantity
        new_invested = position.invested_points + net_points
        position.average_price = (new_invested / new_quantity) if new_quantity else 0.0
        position.quantity = new_quantity
        position.invested_points = new_invested
    else:
        if position.quantity < body.quantity:
            raise HTTPException(status_code=400, detail="보유 수량이 부족합니다")

        net_points = gross_points - fee_points
        user.points_balance += net_points
        average_cost_points = int(round(position.average_price * body.quantity))
        realized = net_points - average_cost_points
        position.realized_pnl_points += realized
        position.quantity -= body.quantity
        position.invested_points = max(0, position.invested_points - average_cost_points)
        if position.quantity == 0:
            position.average_price = 0.0

    order = TradeOrder(
        user_id=user.id,
        project_id=project.id,
        season_id=season.id,
        side=body.side,
        order_type="market",
        status="filled",
        quantity=body.quantity,
        price=price,
        gross_points=gross_points,
        fee_points=fee_points,
        net_points=net_points,
    )
    db.add(order)
    await db.flush()

    position_view = None
    if position.quantity > 0:
        position_view = _build_position_view(position, project, price)

    return TradingOrderResult(
        order=TradingOrderOut.model_validate(order),
        cash_points=user.points_balance,
        position=position_view,
    )


@router.get("/projects/{slug}/comments", response_model=list[ProjectCommentOut])
async def list_project_comments(
    slug: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    project = await _get_project_by_slug(db, slug)
    comments = (
        await db.execute(
            select(ProjectComment)
            .where(ProjectComment.project_id == project.id, ProjectComment.is_deleted.is_(False))
            .order_by(desc(ProjectComment.created_at))
            .limit(100)
        )
    ).scalars().all()
    return [
        await _build_comment_view(db, comment=comment, current_user_id=user.id)
        for comment in comments
    ]


@router.post("/projects/{slug}/comments", response_model=ProjectCommentOut)
async def create_project_comment(
    slug: str,
    body: ProjectCommentCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    project = await _get_project_by_slug(db, slug)
    if body.parent_id is not None:
        parent = await db.get(ProjectComment, body.parent_id)
        if not parent or parent.project_id != project.id or parent.is_deleted:
            raise HTTPException(status_code=404, detail="부모 댓글을 찾을 수 없습니다.")

    comment = ProjectComment(
        user_id=user.id,
        project_id=project.id,
        parent_id=body.parent_id,
        content=body.content.strip(),
    )
    db.add(comment)
    await db.flush()
    return await _build_comment_view(db, comment=comment, current_user_id=user.id)


@router.post("/comments/{comment_id}/recommend", response_model=CommentRecommendationOut)
async def toggle_comment_recommendation(
    comment_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    comment = await db.get(ProjectComment, comment_id)
    if not comment or comment.is_deleted:
        raise HTTPException(status_code=404, detail="댓글을 찾을 수 없습니다.")

    existing = (
        await db.execute(
            select(CommentRecommendation).where(
                CommentRecommendation.comment_id == comment_id,
                CommentRecommendation.user_id == user.id,
            )
        )
    ).scalar_one_or_none()

    if existing:
        await db.execute(
            delete(CommentRecommendation).where(
                CommentRecommendation.comment_id == comment_id,
                CommentRecommendation.user_id == user.id,
            )
        )
        recommended_by_me = False
    else:
        db.add(CommentRecommendation(comment_id=comment_id, user_id=user.id))
        await db.flush()
        recommended_by_me = True

    count_stmt = select(func.count(CommentRecommendation.id)).where(CommentRecommendation.comment_id == comment_id)
    recommendation_count = int((await db.execute(count_stmt)).scalar() or 0)
    return CommentRecommendationOut(
        comment_id=comment_id,
        recommendation_count=recommendation_count,
        recommended_by_me=recommended_by_me,
    )
