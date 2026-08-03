"""
Authentication middleware.
Validates the X-Internal-Token header for service-to-service auth.
"""

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
import structlog

from app.config import get_settings

logger = structlog.get_logger(__name__)


class InternalTokenAuthMiddleware(BaseHTTPMiddleware):
    """
    Middleware to validate internal service-to-service authentication.
    Checks the X-Internal-Token header against the configured INTERNAL_TOKEN.

    Returns JSONResponse directly (not HTTPException) because
    BaseHTTPMiddleware does not properly propagate HTTPException
    through the Starlette middleware stack.

    Skips auth for:
    - Health check endpoint (/health)
    - OpenAPI docs (/docs, /openapi.json, /redoc)
    """

    # Paths that don't require authentication
    SKIP_AUTH_PATHS = {"/health", "/docs", "/openapi.json", "/redoc"}

    async def dispatch(self, request: Request, call_next):
        # Skip auth for health/docs endpoints
        if request.url.path in self.SKIP_AUTH_PATHS:
            return await call_next(request)

        settings = get_settings()
        token = request.headers.get("X-Internal-Token")

        if not token:
            logger.warning(
                "auth.missing_token",
                path=request.url.path,
                client_ip=request.client.host if request.client else "unknown",
            )
            return JSONResponse(
                status_code=401,
                content={"detail": "Missing X-Internal-Token header"},
            )

        if token != settings.internal_token:
            logger.warning(
                "auth.invalid_token",
                path=request.url.path,
                client_ip=request.client.host if request.client else "unknown",
            )
            return JSONResponse(
                status_code=401,
                content={"detail": "Invalid X-Internal-Token"},
            )

        return await call_next(request)
