"""Dépendances FastAPI : qui est connecté ? est-ce un administrateur ?"""
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.core.security import decode_access_token
from app.database.connection import get_db
from app.models import AdminUser

# auto_error=False : on renvoie nous-mêmes une erreur au format {"message","code"}
_bearer = HTTPBearer(auto_error=False)

_ALLOWED_ROLES = {"admin", "editor"}


def _user_from_credentials(creds: HTTPAuthorizationCredentials | None, db: Session) -> AdminUser | None:
    if creds is None or creds.scheme.lower() != "bearer":
        return None
    user_id = decode_access_token(creds.credentials)
    if user_id is None:
        return None
    user = db.get(AdminUser, user_id)
    if user is None or not user.is_active or user.role not in _ALLOWED_ROLES:
        return None
    return user


def get_optional_admin(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer), db: Session = Depends(get_db)
) -> AdminUser | None:
    """Renvoie l'admin si un jeton valide est fourni, sinon None (routes publiques)."""
    return _user_from_credentials(creds, db)


def require_admin(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer), db: Session = Depends(get_db)
) -> AdminUser:
    """Exige un jeton valide : sinon 401."""
    user = _user_from_credentials(creds, db)
    if user is None:
        raise AppError(
            401, "Authentication required", "not_authenticated", headers={"WWW-Authenticate": "Bearer"}
        )
    return user
