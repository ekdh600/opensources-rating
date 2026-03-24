"""add project comments and recommendations

Revision ID: 20260324_0003
Revises: 20260324_0002
Create Date: 2026-03-24 10:45:00
"""

from alembic import op
import sqlalchemy as sa


revision = "20260324_0003"
down_revision = "20260324_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "project_comments",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("project_id", sa.Integer(), sa.ForeignKey("projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("parent_id", sa.Integer(), sa.ForeignKey("project_comments.id", ondelete="CASCADE"), nullable=True),
        sa.Column("content", sa.String(length=2000), nullable=False),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
    )
    op.create_index("ix_project_comments_project_created", "project_comments", ["project_id", "created_at"])
    op.create_index("ix_project_comments_parent_created", "project_comments", ["parent_id", "created_at"])

    op.create_table(
        "comment_recommendations",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("comment_id", sa.Integer(), sa.ForeignKey("project_comments.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.UniqueConstraint("comment_id", "user_id", name="uq_comment_recommendation"),
    )
    op.create_index("ix_comment_recommendations_comment", "comment_recommendations", ["comment_id"])


def downgrade() -> None:
    op.drop_index("ix_comment_recommendations_comment", table_name="comment_recommendations")
    op.drop_table("comment_recommendations")
    op.drop_index("ix_project_comments_parent_created", table_name="project_comments")
    op.drop_index("ix_project_comments_project_created", table_name="project_comments")
    op.drop_table("project_comments")
