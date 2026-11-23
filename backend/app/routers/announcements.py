from typing import Literal

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.auth import get_optional_admin, require_admin
from app.models import AdminUser
from app.schemas.announcement import AnnouncementInput, AnnouncementOut, CategoryCode
from app.services import announcement_service as service

router = APIRouter(prefix="/announcements", tags=["Announcements"])


@router.get("", response_model=list[AnnouncementOut])
def list_announcements(
    response: Response,
    status: Literal["published", "draft", "all"] = "published",
    q: str | None = Query(default=None, max_length=100, description="Recherche dans les titres et contenus"),
    category: CategoryCode | None = None,
    limit: int = Query(default=200, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    admin: AdminUser | None = Depends(get_optional_admin),
):
    """Public : annonces publiées. `?status=all` (brouillons inclus) exige un jeton administrateur."""
    items, total = service.list_announcements(
        db, is_admin=admin is not None, status=status, q=q, category=category, limit=limit, offset=offset
    )
    response.headers["X-Total-Count"] = str(total)
    return items


@router.get("/{announcement_id}", response_model=AnnouncementOut)
def get_announcement(
    announcement_id: str, db: Session = Depends(get_db), admin: AdminUser | None = Depends(get_optional_admin)
):
    return service.get_announcement(db, announcement_id, is_admin=admin is not None)


@router.post("", response_model=AnnouncementOut, status_code=201)
def create_announcement(
    data: AnnouncementInput, db: Session = Depends(get_db), admin: AdminUser = Depends(require_admin)
):
    return service.create_announcement(db, data, admin)


@router.put("/{announcement_id}", response_model=AnnouncementOut)
def update_announcement(
    announcement_id: str,
    data: AnnouncementInput,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(require_admin),
):
    return service.update_announcement(db, announcement_id, data)


@router.delete("/{announcement_id}", status_code=204)
def delete_announcement(
    announcement_id: str, db: Session = Depends(get_db), _: AdminUser = Depends(require_admin)
):
    service.delete_announcement(db, announcement_id)
    return Response(status_code=204)
