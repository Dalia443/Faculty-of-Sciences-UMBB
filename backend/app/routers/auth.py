from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.auth import LoginRequest, LoginResponse
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=LoginResponse)
def login(data: LoginRequest, request: Request, db: Session = Depends(get_db)):
    """Connexion administrateur. Renvoie un jeton JWT (à envoyer en `Authorization: Bearer <jeton>`)."""
    client_ip = request.client.host if request.client else "unknown"
    return auth_service.authenticate(db, str(data.email), data.password, client_ip)
