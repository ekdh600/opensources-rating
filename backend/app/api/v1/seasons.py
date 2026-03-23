"""시즌 및 랭킹 API — §20.3, §20.8"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.auth import get_current_user, get_optional_user
from app.models.user import User
from app.models.season import Season
from app.models.badge import SeasonResult, Badge, UserBadge
from app.schemas.prediction import (
    SeasonOut, SeasonResultOut, SeasonRankEntry, UserProfile, BadgeOut, UserBadgeOut,
)
from app.prediction.level import get_level_info

router = APIRouter(prefix="/seasons", tags=["시즌"])


@router.get("", response_model=list[SeasonOut])
async def list_seasons(db: AsyncSession = Depends(get_db)):
    """시즌 목록"""
    stmt = select(Season).order_by(desc(Season.start_date))
    result = await db.execute(stmt)
    return [SeasonOut.model_validate(s) for s in result.scalars().all()]


@router.get("/current", response_model=SeasonOut)
async def current_season(db: AsyncSession = Depends(get_db)):
    """현재 시즌 조회"""
    stmt = select(Season).where(Season.is_current.is_(True))
    result = await db.execute(stmt)
    season = result.scalar_one_or_none()
    if not season:
        raise HTTPException(status_code=404, detail="현재 시즌이 없습니다")
    return SeasonOut.model_validate(season)


@router.get("/{season_id}/ranking", response_model=dict)
async def season_ranking(
    season_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """시즌 랭킹"""
    stmt = (
        select(SeasonResult)
        .where(SeasonResult.season_id == season_id)
        .order_by(SeasonResult.season_rank.asc().nullslast())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    results = (await db.execute(stmt)).scalars().all()

    entries = []
    for sr in results:
        user_stmt = select(User).where(User.id == sr.user_id)
        user = (await db.execute(user_stmt)).scalar_one_or_none()
        if not user:
            continue

        level_info = get_level_info(user.experience)
        entries.append(
            SeasonRankEntry(
                rank=sr.season_rank or 0,
                user=UserProfile(
                    id=user.id,
                    username=user.username,
                    display_name=user.display_name,
                    points_balance=user.points_balance,
                    level=level_info.level,
                    experience=user.experience,
                    reputation_score=user.reputation_score,
                    foresight_score=user.foresight_score,
                    total_predictions=user.total_predictions,
                    total_hits=user.total_hits,
                    current_streak=user.current_streak,
                    best_streak=user.best_streak,
                    level_title_ko=level_info.title_ko,
                    level_title_en=level_info.title_en,
                ),
                accuracy_rate=sr.accuracy_rate,
                points_profit=sr.points_profit,
                season_reputation=sr.season_reputation,
            )
        )

    return {"season_id": season_id, "page": page, "page_size": page_size, "entries": entries}


@router.get("/{season_id}/my-result", response_model=SeasonResultOut | None)
async def my_season_result(
    season_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """내 시즌 성적"""
    stmt = select(SeasonResult).where(
        SeasonResult.user_id == user.id,
        SeasonResult.season_id == season_id,
    )
    result = (await db.execute(stmt)).scalar_one_or_none()
    if not result:
        return None
    return SeasonResultOut.model_validate(result)


@router.get("/top-predictors", response_model=list[dict])
async def top_predictors(
    sort_by: str = Query("reputation", pattern="^(reputation|foresight|accuracy)$"),
    limit: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """최고 예측가 — §20.14"""
    order_col = {
        "reputation": User.reputation_score,
        "foresight": User.foresight_score,
        "accuracy": User.total_hits,
    }[sort_by]

    stmt = (
        select(User)
        .where(User.is_active.is_(True), User.total_predictions >= 5)
        .order_by(desc(order_col))
        .limit(limit)
    )
    users = (await db.execute(stmt)).scalars().all()

    result = []
    for rank, u in enumerate(users, 1):
        level_info = get_level_info(u.experience)
        result.append({
            "rank": rank,
            "user": UserProfile(
                id=u.id,
                username=u.username,
                display_name=u.display_name,
                points_balance=u.points_balance,
                level=level_info.level,
                experience=u.experience,
                reputation_score=u.reputation_score,
                foresight_score=u.foresight_score,
                total_predictions=u.total_predictions,
                total_hits=u.total_hits,
                current_streak=u.current_streak,
                best_streak=u.best_streak,
                level_title_ko=level_info.title_ko,
                level_title_en=level_info.title_en,
            ),
            "accuracy_rate": u.total_hits / max(u.total_predictions, 1),
        })
    return result


@router.get("/badges", response_model=list[BadgeOut])
async def list_badges(db: AsyncSession = Depends(get_db)):
    """뱃지 목록"""
    stmt = select(Badge)
    result = await db.execute(stmt)
    return [BadgeOut.model_validate(b) for b in result.scalars().all()]


@router.get("/my-badges", response_model=list[UserBadgeOut])
async def my_badges(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """내 뱃지"""
    stmt = select(UserBadge).where(UserBadge.user_id == user.id).order_by(desc(UserBadge.awarded_at))
    user_badges = (await db.execute(stmt)).scalars().all()

    results = []
    for ub in user_badges:
        badge = (await db.execute(select(Badge).where(Badge.id == ub.badge_id))).scalar_one_or_none()
        if not badge:
            continue
        season_name = None
        if ub.season_id:
            season = (await db.execute(select(Season).where(Season.id == ub.season_id))).scalar_one_or_none()
            season_name = season.name if season else None

        results.append(UserBadgeOut(
            badge=BadgeOut.model_validate(badge),
            season_name=season_name,
            awarded_at=ub.awarded_at,
        ))
    return results
