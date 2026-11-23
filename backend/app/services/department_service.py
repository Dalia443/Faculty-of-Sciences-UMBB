from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.models import Department
from app.schemas.department import DepartmentOut
from app.schemas.common import Localized


def to_schema(d: Department) -> DepartmentOut:
    return DepartmentOut(
        id=str(d.id),
        slug=d.slug,
        name=Localized(fr=d.name_fr, en=d.name_en),
        description=Localized(fr=d.description_fr, en=d.description_en),
        overview=Localized(fr=d.overview_fr, en=d.overview_en),
    )


def list_departments(db: Session) -> list[DepartmentOut]:
    rows = db.scalars(select(Department).order_by(Department.display_order, Department.id)).all()
    return [to_schema(d) for d in rows]


def get_department(db: Session, department_id: str) -> DepartmentOut:
    if not department_id.isdigit():
        raise AppError(404, "Department not found", "not_found")
    d = db.get(Department, int(department_id))
    if d is None:
        raise AppError(404, "Department not found", "not_found")
    return to_schema(d)
