"""add auth verification and recovery tables

Revision ID: 20260324_0002
Revises: 20260324_0001
Create Date: 2026-03-24 10:05:00
"""

from alembic import op
import sqlalchemy as sa


revision = "20260324_0002"
down_revision = "20260324_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("email_verified", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column("users", sa.Column("email_verified_at", sa.DateTime(), nullable=True))
    op.alter_column("users", "email_verified", server_default=None)

    op.create_table(
        "auth_tokens",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("purpose", sa.String(length=50), nullable=False),
        sa.Column("token_hash", sa.String(length=255), nullable=False),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("consumed_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
    )
    op.create_index("ix_auth_tokens_user_id", "auth_tokens", ["user_id"])
    op.create_index("ix_auth_tokens_purpose", "auth_tokens", ["purpose"])
    op.create_index("ix_auth_tokens_expires_at", "auth_tokens", ["expires_at"])
    op.create_unique_constraint("uq_auth_tokens_token_hash", "auth_tokens", ["token_hash"])

    op.create_table(
        "password_history",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
    )
    op.create_index("ix_password_history_user_id", "password_history", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_password_history_user_id", table_name="password_history")
    op.drop_table("password_history")

    op.drop_constraint("uq_auth_tokens_token_hash", "auth_tokens", type_="unique")
    op.drop_index("ix_auth_tokens_expires_at", table_name="auth_tokens")
    op.drop_index("ix_auth_tokens_purpose", table_name="auth_tokens")
    op.drop_index("ix_auth_tokens_user_id", table_name="auth_tokens")
    op.drop_table("auth_tokens")

    op.drop_column("users", "email_verified_at")
    op.drop_column("users", "email_verified")
