from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.database.connection import get_db

router = APIRouter(tags=["Health"])


@router.get("/health")
def health(db: Session = Depends(get_db)) -> dict:
    """Vérifie que l'API tourne ET que PostgreSQL répond."""
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        raise AppError(503, "Database unavailable", "database_unavailable")
    return {"status": "ok", "database": "connected"}
