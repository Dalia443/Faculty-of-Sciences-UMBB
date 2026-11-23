"""Schéma initial : 5 tables + données initiales (catégories et 6 départements).

Revision ID: 0001
Revises:
"""
from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "admin_users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(150), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("role", sa.String(20), nullable=False, server_default="admin"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("role IN ('admin', 'editor')", name="ck_admin_users_role"),
    )
    op.create_index("ix_admin_users_email", "admin_users", ["email"], unique=True)

    op.create_table(
        "categories",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("code", sa.String(50), nullable=False),
        sa.Column("name_fr", sa.String(100), nullable=False),
        sa.Column("name_en", sa.String(100), nullable=False),
    )
    op.create_index("ix_categories_code", "categories", ["code"], unique=True)

    op.create_table(
        "departments",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("slug", sa.String(80), nullable=False),
        sa.Column("name_fr", sa.String(150), nullable=False),
        sa.Column("name_en", sa.String(150), nullable=False),
        sa.Column("description_fr", sa.Text(), nullable=False),
        sa.Column("description_en", sa.Text(), nullable=False),
        sa.Column("overview_fr", sa.Text(), nullable=False),
        sa.Column("overview_en", sa.Text(), nullable=False),
        sa.Column("display_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_departments_slug", "departments", ["slug"], unique=True)

    op.create_table(
        "announcements",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title_fr", sa.String(200), nullable=False),
        sa.Column("title_en", sa.String(200), nullable=False),
        sa.Column("content_fr", sa.Text(), nullable=False),
        sa.Column("content_en", sa.Text(), nullable=False),
        sa.Column("category_id", sa.Integer(), sa.ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="draft"),
        sa.Column("published_at", sa.Date(), nullable=False),
        sa.Column("created_by", sa.Integer(), sa.ForeignKey("admin_users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint("status IN ('draft', 'published')", name="ck_announcements_status"),
    )
    op.create_index("ix_announcements_category_id", "announcements", ["category_id"])
    op.create_index("ix_announcements_status_published_at", "announcements", ["status", "published_at"])

    op.create_table(
        "contact_messages",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(150), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("subject", sa.String(200), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="new"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint("status IN ('new', 'read', 'archived')", name="ck_contact_messages_status"),
    )
    op.create_index("ix_contact_messages_created_at", "contact_messages", ["created_at"])

    # ---------- Données initiales ----------
    categories = sa.table(
        "categories",
        sa.column("code", sa.String), sa.column("name_fr", sa.String), sa.column("name_en", sa.String),
    )
    op.bulk_insert(categories, [
        {"code": "academic", "name_fr": "Pédagogie", "name_en": "Academic"},
        {"code": "exams", "name_fr": "Examens", "name_en": "Exams"},
        {"code": "events", "name_fr": "Événements", "name_en": "Events"},
        {"code": "research", "name_fr": "Recherche", "name_en": "Research"},
        {"code": "administrative", "name_fr": "Administratif", "name_en": "Administrative"},
    ])

    departments = sa.table(
        "departments",
        sa.column("slug", sa.String), sa.column("name_fr", sa.String), sa.column("name_en", sa.String),
        sa.column("description_fr", sa.Text), sa.column("description_en", sa.Text),
        sa.column("overview_fr", sa.Text), sa.column("overview_en", sa.Text),
        sa.column("display_order", sa.Integer),
    )
    op.bulk_insert(departments, [
        {
            "slug": "mathematics", "display_order": 1,
            "name_fr": "Mathématiques", "name_en": "Mathematics",
            "description_fr": "Algèbre, analyse, probabilités et statistiques.",
            "description_en": "Algebra, analysis, probability and statistics.",
            "overview_fr": "Le département de Mathématiques se consacre à l’enseignement et à la recherche en mathématiques fondamentales et appliquées.",
            "overview_en": "The Mathematics department is dedicated to teaching and research in pure and applied mathematics.",
        },
        {
            "slug": "physics", "display_order": 2,
            "name_fr": "Physique", "name_en": "Physics",
            "description_fr": "Physique fondamentale et appliquée.",
            "description_en": "Fundamental and applied physics.",
            "overview_fr": "Le département de Physique couvre l’enseignement et la recherche en physique fondamentale et appliquée.",
            "overview_en": "The Physics department covers teaching and research in fundamental and applied physics.",
        },
        {
            "slug": "chemistry", "display_order": 3,
            "name_fr": "Chimie", "name_en": "Chemistry",
            "description_fr": "Chimie générale, organique et des matériaux.",
            "description_en": "General, organic and materials chemistry.",
            "overview_fr": "Le département de Chimie propose des enseignements et des activités de recherche dans les différents domaines de la chimie.",
            "overview_en": "The Chemistry department offers teaching and research activities across the different fields of chemistry.",
        },
        {
            "slug": "computer-science", "display_order": 4,
            "name_fr": "Informatique", "name_en": "Computer Science",
            "description_fr": "Programmation, systèmes d’information et données.",
            "description_en": "Programming, information systems and data.",
            "overview_fr": "Le département d’Informatique forme aux fondements et aux applications des sciences informatiques.",
            "overview_en": "The Computer Science department trains students in the foundations and applications of computing.",
        },
        {
            "slug": "biology", "display_order": 5,
            "name_fr": "Biologie", "name_en": "Biology",
            "description_fr": "Sciences du vivant et de l’environnement.",
            "description_en": "Life and environmental sciences.",
            "overview_fr": "Le département de Biologie s’intéresse aux sciences du vivant et à l’environnement.",
            "overview_en": "The Biology department focuses on life sciences and the environment.",
        },
        {
            "slug": "foreign-languages", "display_order": 6,
            "name_fr": "Langues étrangères", "name_en": "Foreign Languages",
            "description_fr": "Langues, communication et traduction.",
            "description_en": "Languages, communication and translation.",
            "overview_fr": "Le département de Langues étrangères assure l’enseignement des langues et de la communication.",
            "overview_en": "The Foreign Languages department provides language and communication teaching.",
        },
    ])


def downgrade() -> None:
    op.drop_table("contact_messages")
    op.drop_table("announcements")
    op.drop_table("departments")
    op.drop_table("categories")
    op.drop_table("admin_users")
