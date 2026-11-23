"""Logique métier des annonces (lecture publique, écriture réservée aux admins)."""
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.models import AdminUser, Announcement, Category
from app.schemas.announcement import AnnouncementInput, AnnouncementOut, LocalizedOut


def to_schema(a: Announcement) -> AnnouncementOut:
    return AnnouncementOut(
        id=str(a.id),
        title=LocalizedOut(fr=a.title_fr, en=a.title_en),
        content=LocalizedOut(fr=a.content_fr, en=a.content_en),
        category=a.category.code,
        status=a.status,
        publishedAt=a.published_at,
    )


def _not_found() -> AppError:
    return AppError(404, "Announcement not found", "not_found")


def _category_id(db: Session, code: str) -> int:
    cid = db.scalar(select(Category.id).where(Category.code == code))
    if cid is None:
        raise AppError(422, "Unknown category", "invalid_category")
    return cid


def _escape_like(term: str) -> str:
    return term.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def list_announcements(
    db: Session,
    *,
    is_admin: bool,
    status: str,
    q: str | None,
    category: str | None,
    limit: int,
    offset: int,
) -> tuple[list[AnnouncementOut], int]:
    # Le public ne voit jamais les brouillons ; "all"/"draft" exigent un admin connecté.
    if status != "published" and not is_admin:
        raise AppError(401, "Authentication required", "not_authenticated")

    stmt = select(Announcement).join(Category)
    if status in ("published", "draft"):
        stmt = stmt.where(Announcement.status == status)
    if category:
        stmt = stmt.where(Category.code == category)
    if q and q.strip():
        like = f"%{_escape_like(q.strip())}%"
        stmt = stmt.where(
            or_(
                Announcement.title_fr.ilike(like, escape="\\"),
                Announcement.title_en.ilike(like, escape="\\"),
                Announcement.content_fr.ilike(like, escape="\\"),
                Announcement.content_en.ilike(like, escape="\\"),
            )
        )
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    rows = db.scalars(
        stmt.order_by(Announcement.published_at.desc(), Announcement.id.desc()).limit(limit).offset(offset)
    ).all()
    return [to_schema(a) for a in rows], total


def _get_row(db: Session, announcement_id: str) -> Announcement:
    if not announcement_id.isdigit():
        raise _not_found()
    a = db.get(Announcement, int(announcement_id))
    if a is None:
        raise _not_found()
    return a


def get_announcement(db: Session, announcement_id: str, *, is_admin: bool) -> AnnouncementOut:
    a = _get_row(db, announcement_id)
    if a.status != "published" and not is_admin:
        raise _not_found()  # un brouillon est invisible pour le public
    return to_schema(a)


def _apply(a: Announcement, data: AnnouncementInput, category_id: int) -> None:
    a.title_fr, a.title_en = data.title.fr, data.title.en
    a.content_fr, a.content_en = data.content.fr, data.content.en
    a.category_id = category_id
    a.status = data.status
    a.published_at = data.published_at


def create_announcement(db: Session, data: AnnouncementInput, author: AdminUser) -> AnnouncementOut:
    a = Announcement(created_by=author.id)
    _apply(a, data, _category_id(db, data.category))
    db.add(a)
    db.commit()
    db.refresh(a)
    return to_schema(a)


def update_announcement(db: Session, announcement_id: str, data: AnnouncementInput) -> AnnouncementOut:
    a = _get_row(db, announcement_id)
    _apply(a, data, _category_id(db, data.category))
    db.commit()
    db.refresh(a)
    return to_schema(a)


def delete_announcement(db: Session, announcement_id: str) -> None:
    a = _get_row(db, announcement_id)
    db.delete(a)
    db.commit()
