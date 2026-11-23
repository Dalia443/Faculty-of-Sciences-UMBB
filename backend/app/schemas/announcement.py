from datetime import date
from typing import Literal

from pydantic import Field, field_validator

from app.schemas.common import ApiModel, text

CategoryCode = Literal["academic", "exams", "events", "research", "administrative"]
Status = Literal["draft", "published"]


class LocalizedTitle(ApiModel):
    fr: text(1, 200)
    en: text(1, 200)


class LocalizedContent(ApiModel):
    fr: text(1, 20000)
    en: text(1, 20000)


class AnnouncementInput(ApiModel):
    """Corps des requêtes POST et PUT (identique à AnnouncementInput du frontend)."""
    title: LocalizedTitle
    content: LocalizedContent
    category: CategoryCode
    status: Status
    published_at: date = Field(alias="publishedAt")

    @field_validator("published_at")
    @classmethod
    def _reasonable_date(cls, value: date) -> date:
        if value.year < 2000 or value.year > 2100:
            raise ValueError("Date hors de la plage autorisée (2000–2100).")
        return value


class LocalizedOut(ApiModel):
    fr: str
    en: str


class AnnouncementOut(ApiModel):
    id: str
    title: LocalizedOut
    content: LocalizedOut
    category: str
    status: str
    published_at: date = Field(alias="publishedAt", serialization_alias="publishedAt")
