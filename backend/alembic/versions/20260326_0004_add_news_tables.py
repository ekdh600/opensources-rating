"""add news tables

Revision ID: 20260326_0004
Revises: 20260324_0003
Create Date: 2026-03-26 11:20:00
"""

from alembic import op
import sqlalchemy as sa


revision = "20260326_0004"
down_revision = "20260324_0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "news_sources",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("slug", sa.String(length=120), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("source_type", sa.String(length=32), nullable=False),
        sa.Column("base_url", sa.String(length=500), nullable=False),
        sa.Column("feed_url", sa.String(length=500), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.UniqueConstraint("slug", name="uq_news_sources_slug"),
    )

    op.create_table(
        "news_articles",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("source_id", sa.Integer(), sa.ForeignKey("news_sources.id", ondelete="CASCADE"), nullable=False),
        sa.Column("source_url", sa.String(length=1000), nullable=False),
        sa.Column("canonical_url", sa.String(length=1000), nullable=False),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("summary_ko", sa.Text(), nullable=False),
        sa.Column("market_impact_ko", sa.Text(), nullable=True),
        sa.Column("published_at", sa.DateTime(), nullable=False),
        sa.Column("collected_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("importance_score", sa.Float(), nullable=False, server_default="0"),
        sa.Column("interest_score", sa.Float(), nullable=False, server_default="0"),
        sa.Column("final_score", sa.Float(), nullable=False, server_default="0"),
        sa.Column("grade", sa.String(length=24), nullable=True),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="processed"),
        sa.Column("raw_meta", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.UniqueConstraint("source_url", name="uq_news_articles_source_url"),
    )
    op.create_index("ix_news_articles_published", "news_articles", ["published_at"])
    op.create_index("ix_news_articles_status_score", "news_articles", ["status", "final_score"])

    op.create_table(
        "news_article_projects",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("article_id", sa.Integer(), sa.ForeignKey("news_articles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("project_id", sa.Integer(), sa.ForeignKey("projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("relation_type", sa.String(length=32), nullable=False, server_default="mentioned"),
        sa.Column("confidence", sa.Float(), nullable=False, server_default="0.5"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.UniqueConstraint("article_id", "project_id", name="uq_news_article_project"),
    )
    op.create_index("ix_news_article_projects_project", "news_article_projects", ["project_id"])


def downgrade() -> None:
    op.drop_index("ix_news_article_projects_project", table_name="news_article_projects")
    op.drop_table("news_article_projects")
    op.drop_index("ix_news_articles_status_score", table_name="news_articles")
    op.drop_index("ix_news_articles_published", table_name="news_articles")
    op.drop_table("news_articles")
    op.drop_table("news_sources")
