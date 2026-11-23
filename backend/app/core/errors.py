"""Format d'erreur unique : {"message": "...", "code": "..."}.

Le frontend lit le champ "message" (voir src/services/httpApi.ts).
"""
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException


class AppError(Exception):
    def __init__(self, status_code: int, message: str, code: str, headers: dict | None = None):
        self.status_code = status_code
        self.message = message
        self.code = code
        self.headers = headers


def _json(status: int, message: str, code: str, headers: dict | None = None, **extra) -> JSONResponse:
    return JSONResponse(status_code=status, content={"message": message, "code": code, **extra}, headers=headers)


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def _app_error(_: Request, exc: AppError):
        return _json(exc.status_code, exc.message, exc.code, exc.headers)

    @app.exception_handler(StarletteHTTPException)
    async def _http_error(_: Request, exc: StarletteHTTPException):
        message = exc.detail if isinstance(exc.detail, str) else "Request failed"
        return _json(exc.status_code, message, "http_error")

    @app.exception_handler(RequestValidationError)
    async def _validation_error(_: Request, exc: RequestValidationError):
        errors = [
            {"field": ".".join(str(p) for p in e["loc"] if p != "body"), "message": e["msg"]}
            for e in exc.errors()
        ]
        first = errors[0] if errors else {"field": "", "message": "Invalid data"}
        message = f"{first['field']}: {first['message']}" if first["field"] else first["message"]
        return _json(422, message, "validation_error", errors=errors)

    @app.exception_handler(Exception)
    async def _unexpected(_: Request, exc: Exception):
        # Jamais de détails techniques renvoyés au client
        return _json(500, "Internal server error", "internal_error")
