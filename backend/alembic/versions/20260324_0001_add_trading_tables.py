"""add trading tables

Revision ID: 20260324_0001
Revises: 
Create Date: 2026-03-24 08:10:00
"""

from alembic import op
import sqlalchemy as sa


revision = "20260324_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "trade_orders",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("project_id", sa.Integer(), sa.ForeignKey("projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("season_id", sa.Integer(), sa.ForeignKey("seasons.id", ondelete="CASCADE"), nullable=False),
        sa.Column("side", sa.String(length=10), nullable=False),
        sa.Column("order_type", sa.String(length=20), nullable=False, server_default="market"),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="filled"),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("price", sa.Float(), nullable=False),
        sa.Column("gross_points", sa.Integer(), nullable=False),
        sa.Column("fee_points", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("net_points", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
    )
    op.create_index("ix_trade_orders_user_created", "trade_orders", ["user_id", "created_at"])
    op.create_index("ix_trade_orders_project_created", "trade_orders", ["project_id", "created_at"])
    op.create_index("ix_trade_orders_season_created", "trade_orders", ["season_id", "created_at"])

    op.create_table(
        "user_positions",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("project_id", sa.Integer(), sa.ForeignKey("projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("season_id", sa.Integer(), sa.ForeignKey("seasons.id", ondelete="CASCADE"), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("average_price", sa.Float(), nullable=False, server_default="0"),
        sa.Column("invested_points", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("realized_pnl_points", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.UniqueConstraint("user_id", "project_id", "season_id", name="uq_user_position_season_project"),
    )
    op.create_index("ix_user_positions_user", "user_positions", ["user_id", "season_id"])


def downgrade() -> None:
    op.drop_index("ix_user_positions_user", table_name="user_positions")
    op.drop_table("user_positions")

    op.drop_index("ix_trade_orders_season_created", table_name="trade_orders")
    op.drop_index("ix_trade_orders_project_created", table_name="trade_orders")
    op.drop_index("ix_trade_orders_user_created", table_name="trade_orders")
    op.drop_table("trade_orders")
