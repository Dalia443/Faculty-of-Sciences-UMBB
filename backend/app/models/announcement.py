"""Table announcements : actualités et annonces (un seul module, comme dans le frontend)."""
from datetime import date, datetime

from sqlalchemy import CheckConstraint, Date, DateTime, ForeignKey, Index, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Announcement(Base):
    __tablename__ = "announcements"
    __table_args__ = (
        CheckConstraint("status IN ('draft', 'published')", name="ck_announcements_status"),
        Index("ix_announcements_status_published_at", "status", "published_at"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    title_fr: Mapped[str] = mapped_column(String(200))
    title_en: Mapped[str] = mapped_column(String(200))
    content_fr: Mapped[str] = mapped_column(Text)
    content_en: Mapped[str] = mapped_column(Text)
    # RESTRICT : on ne peut pas supprimer une catégorie encore utilisée
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id", ondelete="RESTRICT"), index=True)
    status: Mapped[str] = mapped_column(String(20), default="draft", server_default="draft")
    published_at: Mapped[date] = mapped_column(Date)
    # SET NULL : si un compte admin est supprimé, l'annonce est conservée
    created_by: Mapped[int | None] = mapped_column(
        ForeignKey("admin_users.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    category = relationship("Category", back_populates="announcements", lazy="joined")
    author = relationship("AdminUser", back_populates="announcements")
