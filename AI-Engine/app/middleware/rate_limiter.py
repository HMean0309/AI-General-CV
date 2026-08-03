"""
Rate limiting middleware using slowapi.
Limits requests per student_id to prevent abuse.
"""

import json

from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from fastapi import Request, Response
from starlette.responses import JSONResponse
import structlog

from app.config import get_settings

logger = structlog.get_logger(__name__)


def _get_student_id_key(request: Request) -> str:
    """
    Extract student_id from the request body to use as rate limit key.
    Falls back to client IP if body can't be parsed.
    """
    # We need to access the cached body since the stream can only be read once
    if hasattr(request.state, "body"):
        try:
            body = json.loads(request.state.body)
            student_id = body.get("academic_context", {}).get("student_id", "")
            if student_id:
                return student_id
        except (json.JSONDecodeError, AttributeError):
            pass

    return get_remote_address(request)


# Initialize the limiter with the student_id key function
limiter = Limiter(key_func=_get_student_id_key)


def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> Response:
    """Custom handler for rate limit exceeded errors."""
    logger.warning(
        "rate_limit.exceeded",
        path=request.url.path,
        detail=str(exc.detail),
    )
    return JSONResponse(
        status_code=429,
        content={
            "detail": "Quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút.",
            "error": "rate_limit_exceeded",
        },
    )
