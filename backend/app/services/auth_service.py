"""Logique de connexion : vérification du mot de passe, limitation des essais, jeton."""
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.core.rate_limit import login_limiter
from app.core.security import create_access_token, verify_password
from app.models import AdminUser
from app.schemas.auth import AuthUser, LoginResponse


def authenticate(db: Session, email: str, password: str, client_ip: str) -> LoginResponse:
    email = email.strip().lower()
    key = f"{client_ip}|{email}"
    login_limiter.raise_if_blocked(key, "Too many failed attempts. Please try again later.")

    user = db.scalar(select(AdminUser).where(AdminUser.email == email))
    # verify_password dépense le même temps même si l'e-mail n'existe pas
    valid = verify_password(password, user.password_hash if user else None)

    if not valid or user is None or not user.is_active:
        login_limiter.record(key)
        # Message volontairement identique pour tous les cas d'échec
        raise AppError(401, "Invalid credentials", "invalid_credentials")

    login_limiter.reset(key)
    user.last_login_at = datetime.now(timezone.utc)
    db.commit()
    return LoginResponse(token=create_access_token(user.id), user=AuthUser(email=user.email, name=user.full_name))
