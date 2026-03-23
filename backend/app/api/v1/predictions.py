"""예측 시장 API — §20.5, §20.6, §20.10"""

from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.project import Project
from app.models.season import Season, SeasonStatus
from app.models.prediction import Prediction, PredictionProduct, PredictionStatus, Position
from app.models.score import ProjectScoreDaily
from app.schemas.prediction import PredictionCreate, PredictionOut, ProductOut
from app.prediction.anti_abuse import (
    check_max_stake, check_season_end_dampening,
    check_duplicate_prediction, calculate_weighted_influence,
)

router = APIRouter(prefix="/predictions", tags=["예측 시장"])


async def _get_current_season(db: AsyncSession) -> Season:
    stmt = select(Season).where(Season.is_current.is_(True), Season.status == SeasonStatus.ACTIVE)
    result = await db.execute(stmt)
    season = result.scalar_one_or_none()
    if not season:
        raise HTTPException(status_code=400, detail="현재 활성 시즌이 없습니다")
    return season


async def _get_or_create_product(
    db: AsyncSession, project_id: int, season: Season, base_score: float
) -> PredictionProduct:
    stmt = select(PredictionProduct).where(
        PredictionProduct.project_id == project_id,
        PredictionProduct.season_id == season.id,
    )
    product = (await db.execute(stmt)).scalar_one_or_none()

    if not product:
        product = PredictionProduct(
            project_id=project_id,
            season_id=season.id,
            product_name=f"90일 예측",
            maturity_days=90,
            base_score=base_score,
            base_date=date.today(),
            maturity_date=date.today() + timedelta(days=90),
        )
        db.add(product)
        await db.flush()

    return product


@router.post("", response_model=PredictionOut)
async def create_prediction(
    body: PredictionCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """새 예측 생성"""
    season = await _get_current_season(db)

    # 프로젝트 조회
    proj_stmt = select(Project).where(Project.slug == body.project_slug, Project.is_active.is_(True))
    project = (await db.execute(proj_stmt)).scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")

    # 최신 점수
    score_stmt = (
        select(ProjectScoreDaily)
        .where(ProjectScoreDaily.project_id == project.id)
        .order_by(desc(ProjectScoreDaily.score_date))
        .limit(1)
    )
    score = (await db.execute(score_stmt)).scalar_one_or_none()
    if not score:
        raise HTTPException(status_code=400, detail="이 프로젝트의 점수가 아직 없습니다")

    # 악용 방지 체크
    stake_check = check_max_stake(user.points_balance, body.points_staked)
    if not stake_check.allowed:
        raise HTTPException(status_code=400, detail=stake_check.reason_ko)

    season_check = check_season_end_dampening(season.end_date)
    if not season_check.allowed:
        raise HTTPException(status_code=400, detail=season_check.reason_ko)

    # 중복 체크
    active_count_stmt = select(func.count()).where(
        Prediction.user_id == user.id,
        Prediction.project_id == project.id,
        Prediction.season_id == season.id,
        Prediction.status == PredictionStatus.ACTIVE,
    )
    active_count = (await db.execute(active_count_stmt)).scalar_one()
    dup_check = check_duplicate_prediction(active_count)
    if not dup_check.allowed:
        raise HTTPException(status_code=400, detail=dup_check.reason_ko)

    # 예측 생성
    prediction = Prediction(
        user_id=user.id,
        project_id=project.id,
        season_id=season.id,
        position=Position(body.position),
        points_staked=body.points_staked,
        reason=body.reason,
        base_score=score.total_score,
        base_date=score.score_date,
        maturity_date=score.score_date + timedelta(days=90),
        maturity_days=90,
    )
    db.add(prediction)

    # 포인트 차감
    user.points_balance -= body.points_staked
    user.total_predictions += 1

    # 상품 집계 업데이트
    product = await _get_or_create_product(db, project.id, season, score.total_score)
    product.total_predictions += 1
    if body.position == "up":
        product.up_count += 1
    elif body.position == "neutral":
        product.neutral_count += 1
    else:
        product.down_count += 1

    total = product.total_predictions
    product.up_ratio = product.up_count / total if total > 0 else 0
    product.neutral_ratio = product.neutral_count / total if total > 0 else 0
    product.down_ratio = product.down_count / total if total > 0 else 0

    await db.flush()
    return PredictionOut.model_validate(prediction)


@router.get("/my", response_model=list[PredictionOut])
async def my_predictions(
    status_filter: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """내 예측 목록"""
    stmt = select(Prediction).where(Prediction.user_id == user.id)
    if status_filter:
        stmt = stmt.where(Prediction.status == status_filter)
    stmt = stmt.order_by(desc(Prediction.created_at)).offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(stmt)
    return [PredictionOut.model_validate(p) for p in result.scalars().all()]


@router.get("/products", response_model=list[ProductOut])
async def list_products(
    season_id: int | None = None,
    db: AsyncSession = Depends(get_db),
):
    """예측 상품 목록 (커뮤니티 기대치 포함)"""
    stmt = select(PredictionProduct)
    if season_id:
        stmt = stmt.where(PredictionProduct.season_id == season_id)
    else:
        season = await _get_current_season(db)
        stmt = stmt.where(PredictionProduct.season_id == season.id)

    stmt = stmt.order_by(desc(PredictionProduct.total_predictions))
    result = await db.execute(stmt)
    return [ProductOut.model_validate(p) for p in result.scalars().all()]


@router.get("/products/{project_slug}", response_model=ProductOut | None)
async def get_product(
    project_slug: str,
    db: AsyncSession = Depends(get_db),
):
    """특정 프로젝트의 예측 상품 조회"""
    season = await _get_current_season(db)

    proj_stmt = select(Project).where(Project.slug == project_slug)
    project = (await db.execute(proj_stmt)).scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")

    stmt = select(PredictionProduct).where(
        PredictionProduct.project_id == project.id,
        PredictionProduct.season_id == season.id,
    )
    product = (await db.execute(stmt)).scalar_one_or_none()
    if not product:
        return None
    return ProductOut.model_validate(product)
