from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.auth import hash_password, verify_password, create_access_token, get_current_user
from app.models.user import User
from app.schemas.prediction import UserRegister, UserLogin, TokenResponse, UserProfile
from app.prediction.level import get_level_info

router = APIRouter(prefix="/auth", tags=["인증"])


@router.post("/register", response_model=TokenResponse)
async def register(body: UserRegister, db: AsyncSession = Depends(get_db)):
    """회원가입"""
    existing = await db.execute(
        select(User).where((User.username == body.username) | (User.email == body.email))
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="이미 사용 중인 사용자명 또는 이메일입니다")

    user = User(
        username=body.username,
        email=body.email,
        display_name=body.display_name,
        password_hash=hash_password(body.password),
    )
    db.add(user)
    await db.flush()

    token = create_access_token(user.id)
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
async def login(body: UserLogin, db: AsyncSession = Depends(get_db)):
    """로그인"""
    stmt = select(User).where(User.username == body.username)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="사용자명 또는 비밀번호가 잘못되었습니다")

    from datetime import datetime
    user.last_login_at = datetime.utcnow()

    token = create_access_token(user.id)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserProfile)
async def get_me(user: User = Depends(get_current_user)):
    """내 프로필 조회"""
    level_info = get_level_info(user.experience)
    return UserProfile(
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
    )
