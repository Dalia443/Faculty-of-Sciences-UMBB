"""Schémas partagés. Les formes JSON reproduisent exactement celles du frontend (src/types)."""
from typing import Annotated

from pydantic import BaseModel, ConfigDict, StringConstraints


def text(min_length: int = 1, max_length: int = 200):
    """Texte nettoyé (espaces retirés) avec longueur contrôlée."""
    return Annotated[str, StringConstraints(strip_whitespace=True, min_length=min_length, max_length=max_length)]


class Localized(BaseModel):
    """Objet bilingue {fr, en}."""
    fr: str
    en: str


class ApiModel(BaseModel):
    # populate_by_name : accepte "published_at" ou "publishedAt" en entrée
    model_config = ConfigDict(populate_by_name=True)
