from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import (
    create_access_token,
    generate_raw_token,
    get_current_user,
    hash_password,
    hash_token,
    verify_password,
)
from app.core.database import get_db
from app.core.notifications import send_auth_email
from app.models.user import AuthToken, PasswordHistory, User
from app.prediction.level import get_level_info
from app.schemas.auth import (
    AuthActionResponse,
    EmailOnlyRequest,
    ForgotIdRequest,
    PasswordResetConfirm,
    PasswordResetRequest,
    TokenResponse,
    UserLogin,
    UserProfile,
    UserRegister,
    VerifyEmailConfirm,
)

router = APIRouter(prefix="/auth", tags=["auth"])

VERIFY_EMAIL_PURPOSE = "verify_email"
RESET_PASSWORD_PURPOSE = "reset_password"


def _normalize_email(email: str) -> str:
    return email.strip().lower()


async def _create_auth_token(
    db: AsyncSession,
    *,
    user_id: int,
    purpose: str,
    expires_in_hours: int,
) -> str:
    raw_token = generate_raw_token()
    db.add(
        AuthToken(
            user_id=user_id,
            purpose=purpose,
            token_hash=hash_token(raw_token),
            expires_at=datetime.utcnow() + timedelta(hours=expires_in_hours),
        )
    )
    await db.flush()
    return raw_token


async def _find_active_token(db: AsyncSession, *, purpose: str, token: str) -> AuthToken | None:
    stmt = select(AuthToken).where(
        AuthToken.purpose == purpose,
        AuthToken.token_hash == hash_token(token),
        AuthToken.consumed_at.is_(None),
        AuthToken.expires_at > datetime.utcnow(),
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def _store_password_history(db: AsyncSession, *, user_id: int, password_hash: str) -> None:
    db.add(PasswordHistory(user_id=user_id, password_hash=password_hash))
    await db.flush()


async def _validate_new_password(db: AsyncSession, *, user: User, new_password: str) -> None:
    if verify_password(new_password, user.password_hash):
        raise HTTPException(status_code=400, detail="이전에 사용한 비밀번호는 다시 사용할 수 없습니다.")

    result = await db.execute(select(PasswordHistory).where(PasswordHistory.user_id == user.id))
    histories = result.scalars().all()
    for history in histories:
        if verify_password(new_password, history.password_hash):
            raise HTTPException(status_code=400, detail="이전에 사용한 비밀번호는 다시 사용할 수 없습니다.")


@router.post("/register", response_model=AuthActionResponse)
async def register(body: UserRegister, db: AsyncSession = Depends(get_db)):
    normalized_email = _normalize_email(body.email)
    existing = await db.execute(
        select(User).where(or_(User.username == body.username, User.email == normalized_email))
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="이미 사용 중인 아이디 또는 이메일입니다.")

    password_hash = hash_password(body.password)
    user = User(
        username=body.username,
        email=normalized_email,
        display_name=body.display_name,
        password_hash=password_hash,
        email_verified=False,
    )
    db.add(user)
    await db.flush()
    await _store_password_history(db, user_id=user.id, password_hash=password_hash)

    raw_token = await _create_auth_token(
        db,
        user_id=user.id,
        purpose=VERIFY_EMAIL_PURPOSE,
        expires_in_hours=24,
    )
    send_auth_email(
        normalized_email,
        "OSS Market 이메일 인증",
        f"안녕하세요 {body.display_name}님,\n\n아래 인증 토큰을 입력해 이메일 인증을 완료해 주세요.\n\n인증 토큰: {raw_token}\n\n토큰은 24시간 동안 유효합니다.",
    )
    return AuthActionResponse(message="회원가입이 완료되었습니다. 이메일 인증 토큰을 확인해 주세요.")


@router.post("/verify-email/request", response_model=AuthActionResponse)
async def request_email_verification(body: EmailOnlyRequest, db: AsyncSession = Depends(get_db)):
    normalized_email = _normalize_email(body.email)
    result = await db.execute(select(User).where(User.email == normalized_email))
    user = result.scalar_one_or_none()

    if user and not user.email_verified:
        raw_token = await _create_auth_token(
            db,
            user_id=user.id,
            purpose=VERIFY_EMAIL_PURPOSE,
            expires_in_hours=24,
        )
        send_auth_email(
            normalized_email,
            "OSS Market 이메일 인증 재요청",
            f"안녕하세요 {user.display_name}님,\n\n아래 인증 토큰을 입력해 이메일 인증을 완료해 주세요.\n\n인증 토큰: {raw_token}\n\n토큰은 24시간 동안 유효합니다.",
        )

    return AuthActionResponse(message="이메일이 존재하면 인증 토큰을 발송했습니다.")


@router.post("/verify-email/confirm", response_model=AuthActionResponse)
async def confirm_email_verification(body: VerifyEmailConfirm, db: AsyncSession = Depends(get_db)):
    token_row = await _find_active_token(db, purpose=VERIFY_EMAIL_PURPOSE, token=body.token)
    if not token_row:
        raise HTTPException(status_code=400, detail="유효하지 않거나 만료된 인증 토큰입니다.")

    result = await db.execute(select(User).where(User.id == token_row.user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    user.email_verified = True
    user.email_verified_at = datetime.utcnow()
    token_row.consumed_at = datetime.utcnow()
    return AuthActionResponse(message="이메일 인증이 완료되었습니다. 이제 로그인할 수 있습니다.")


@router.post("/login", response_model=TokenResponse)
async def login(body: UserLogin, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.username == body.username)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="아이디 또는 비밀번호가 올바르지 않습니다.")
    if not user.email_verified:
        raise HTTPException(status_code=403, detail="이메일 인증을 완료한 뒤 로그인할 수 있습니다.")

    user.last_login_at = datetime.utcnow()
    token = create_access_token(user.id)
    return TokenResponse(access_token=token)


@router.post("/recover-id", response_model=AuthActionResponse)
async def recover_id(body: ForgotIdRequest, db: AsyncSession = Depends(get_db)):
    normalized_email = _normalize_email(body.email)
    result = await db.execute(select(User).where(User.email == normalized_email))
    user = result.scalar_one_or_none()

    if user:
        send_auth_email(
            normalized_email,
            "OSS Market 아이디 찾기",
            f"안녕하세요 {user.display_name}님,\n\n등록된 아이디는 아래와 같습니다.\n\n아이디: {user.username}",
        )

    return AuthActionResponse(message="이메일이 존재하면 아이디 안내 메일을 발송했습니다.")


@router.post("/password-reset/request", response_model=AuthActionResponse)
async def request_password_reset(body: PasswordResetRequest, db: AsyncSession = Depends(get_db)):
    normalized_email = _normalize_email(body.email)
    stmt = select(User).where(User.email == normalized_email)
    if body.username:
        stmt = stmt.where(User.username == body.username)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if user:
        raw_token = await _create_auth_token(
            db,
            user_id=user.id,
            purpose=RESET_PASSWORD_PURPOSE,
            expires_in_hours=1,
        )
        send_auth_email(
            normalized_email,
            "OSS Market 비밀번호 재설정",
            f"안녕하세요 {user.display_name}님,\n\n아래 재설정 토큰을 입력하고 새 비밀번호를 설정해 주세요.\n\n재설정 토큰: {raw_token}\n\n토큰은 1시간 동안 유효합니다.",
        )

    return AuthActionResponse(message="계정이 존재하면 비밀번호 재설정 메일을 발송했습니다.")


@router.post("/password-reset/confirm", response_model=AuthActionResponse)
async def confirm_password_reset(body: PasswordResetConfirm, db: AsyncSession = Depends(get_db)):
    token_row = await _find_active_token(db, purpose=RESET_PASSWORD_PURPOSE, token=body.token)
    if not token_row:
        raise HTTPException(status_code=400, detail="유효하지 않거나 만료된 재설정 토큰입니다.")

    result = await db.execute(select(User).where(User.id == token_row.user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    await _validate_new_password(db, user=user, new_password=body.new_password)
    new_hash = hash_password(body.new_password)
    user.password_hash = new_hash
    token_row.consumed_at = datetime.utcnow()
    await _store_password_history(db, user_id=user.id, password_hash=new_hash)
    return AuthActionResponse(message="비밀번호가 변경되었습니다. 새 비밀번호로 로그인해 주세요.")


@router.get("/me", response_model=UserProfile)
async def get_me(user: User = Depends(get_current_user)):
    level_info = get_level_info(user.experience)
    return UserProfile(
        id=user.id,
        username=user.username,
        email=user.email,
        display_name=user.display_name,
        email_verified=user.email_verified,
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
        created_at=user.created_at,
    )
