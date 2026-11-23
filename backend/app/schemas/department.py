from app.schemas.common import ApiModel, Localized


class DepartmentOut(ApiModel):
    id: str
    slug: str
    name: Localized
    description: Localized
    overview: Localized
