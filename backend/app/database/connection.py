"""Connexion à PostgreSQL et fourniture d'une session par requête."""
from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings

engine = create_engine(
    get_settings().database_url,
    pool_pre_ping=True,  # vérifie que la connexion est vivante avant de l'utiliser
    connect_args={"client_encoding": "utf8"},  # accents français garantis
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)


def get_db() -> Iterator[Session]:
    """Dépendance FastAPI : ouvre une session et la ferme toujours à la fin."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
