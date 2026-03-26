from datetime import datetime

from pydantic import BaseModel, Field


class UserRegister(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: str
    display_name: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=8)


class UserLogin(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AuthActionResponse(BaseModel):
    message: str


class EmailOnlyRequest(BaseModel):
    email: str


class VerifyEmailConfirm(BaseModel):
    token: str


class TokenOnlyRequest(BaseModel):
    token: str


class ForgotIdRequest(BaseModel):
    email: str


class PasswordResetRequest(BaseModel):
    email: str
    username: str | None = None


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(min_length=8)


class UserProfile(BaseModel):
    id: int
    username: str
    email: str
    display_name: str
    email_verified: bool
    points_balance: int
    level: int
    experience: int
    reputation_score: float
    foresight_score: float
    total_predictions: int
    total_hits: int
    current_streak: int
    best_streak: int
    level_title_ko: str = ""
    level_title_en: str = ""
    created_at: datetime | None = None

    model_config = {"from_attributes": True}
