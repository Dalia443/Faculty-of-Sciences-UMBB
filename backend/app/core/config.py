"""Configuration de l'application, lue depuis le fichier .env.

Aucun secret n'est écrit dans le code : tout vient des variables d'environnement.
"""
from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import URL

_FORBIDDEN_SECRETS = {
    "GENEREZ_UNE_CLE_ALEATOIRE_D_AU_MOINS_32_CARACTERES",
    "changeme",
    "secret",
}


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Base de données (on garde les morceaux séparés pour gérer les caractères
    # spéciaux du mot de passe sans erreur d'encodage d'URL)
    db_host: str = "localhost"
    db_port: int = 5432
    db_name: str = "faculty_portal"
    db_user: str = "postgres"
    db_password: str

    # JWT
    secret_key: str
    access_token_expire_minutes: int = 60
    jwt_algorithm: str = "HS256"

    # Application
    environment: str = "development"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    @field_validator("secret_key")
    @classmethod
    def _check_secret(cls, value: str) -> str:
        if len(value) < 32 or value in _FORBIDDEN_SECRETS:
            raise ValueError(
                "SECRET_KEY invalide : générez une clé aléatoire d'au moins 32 caractères "
                "(voir .env.example)."
            )
        return value

    @property
    def database_url(self) -> URL:
        return URL.create(
            "postgresql+psycopg2",
            username=self.db_user,
            password=self.db_password,
            host=self.db_host,
            port=self.db_port,
            database=self.db_name,
        )

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def docs_enabled(self) -> bool:
        return self.environment.lower() != "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
