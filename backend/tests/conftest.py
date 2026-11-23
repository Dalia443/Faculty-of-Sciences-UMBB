"""Configuration des tests.

IMPORTANT : les tests utilisent une base SÉPARÉE (par défaut "faculty_portal_test").
Ils ne touchent jamais à votre base réelle. Elle est créée automatiquement si besoin.
"""
import os

# Doit être fait AVANT l'import de l'application : on redirige vers la base de test
TEST_DB_NAME = os.environ.get("TEST_DB_NAME", "faculty_portal_test")
os.environ["DB_NAME"] = TEST_DB_NAME

import pytest  # noqa: E402
from alembic import command  # noqa: E402
from alembic.config import Config  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import create_engine, text  # noqa: E402

from app.core.config import get_settings  # noqa: E402
from app.core.rate_limit import contact_limiter, login_limiter  # noqa: E402
from app.core.security import hash_password  # noqa: E402
from app.database.connection import SessionLocal, engine  # noqa: E402
from app.main import app  # noqa: E402
from app.models import AdminUser  # noqa: E402

ADMIN_EMAIL = "admin@umbb-test.com"
ADMIN_PASSWORD = "TestPassword123"


def _ensure_test_database() -> None:
    settings = get_settings()
    assert settings.db_name != "faculty_portal", "Les tests ne doivent jamais utiliser la base réelle !"
    admin_engine = create_engine(
        settings.database_url.set(database="postgres"), isolation_level="AUTOCOMMIT",
        connect_args={"client_encoding": "utf8"},
    )
    with admin_engine.connect() as conn:
        exists = conn.scalar(text("SELECT 1 FROM pg_database WHERE datname = :n"), {"n": settings.db_name})
        if not exists:
            conn.execute(text(f'CREATE DATABASE "{settings.db_name}" ENCODING \'UTF8\' TEMPLATE template0'))
    admin_engine.dispose()


@pytest.fixture(scope="session", autouse=True)
def _database():
    _ensure_test_database()
    cfg = Config("alembic.ini")
    command.downgrade(cfg, "base")  # repart d'un schéma propre
    command.upgrade(cfg, "head")  # crée les tables + données initiales
    yield
    engine.dispose()


@pytest.fixture(autouse=True)
def _clean_state():
    with engine.begin() as conn:
        conn.execute(text("TRUNCATE announcements, contact_messages, admin_users RESTART IDENTITY CASCADE"))
    login_limiter.clear_all()
    contact_limiter.clear_all()
    yield


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def admin_headers(client):
    with SessionLocal() as db:
        db.add(AdminUser(email=ADMIN_EMAIL, full_name="Test Admin", password_hash=hash_password(ADMIN_PASSWORD)))
        db.commit()
    res = client.post("/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert res.status_code == 200
    return {"Authorization": f"Bearer {res.json()['token']}"}


def announcement_payload(**overrides):
    payload = {
        "title": {"fr": "Titre FR", "en": "Title EN"},
        "content": {"fr": "Contenu en français avec accents : é è à.", "en": "English content."},
        "category": "academic",
        "status": "published",
        "publishedAt": "2026-11-20",
    }
    payload.update(overrides)
    return payload
