"""Point d'entrée de l'API : `uvicorn app.main:app --reload`."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.errors import register_error_handlers
from app.routers import announcements, auth, contact, departments, health

settings = get_settings()

app = FastAPI(
    title="Faculty of Sciences UMBB — API",
    version="1.0.0",
    description="API REST du portail de la Faculté des Sciences, Université M'Hamed Bougara de Boumerdès.",
    docs_url="/docs" if settings.docs_enabled else None,
    redoc_url=None,
    openapi_url="/openapi.json" if settings.docs_enabled else None,
)

# CORS : seules les origines listées dans CORS_ORIGINS (le frontend Vite) peuvent appeler l'API
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
    expose_headers=["X-Total-Count"],
)

register_error_handlers(app)

for router in (health.router, auth.router, departments.router, announcements.router, contact.router):
    app.include_router(router, prefix="/api")
