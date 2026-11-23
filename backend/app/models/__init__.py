"""Importer tous les modèles ici garantit qu'Alembic et SQLAlchemy les connaissent."""
from app.models.admin_user import AdminUser
from app.models.announcement import Announcement
from app.models.category import Category
from app.models.contact_message import ContactMessage
from app.models.department import Department

__all__ = ["AdminUser", "Announcement", "Category", "ContactMessage", "Department"]
