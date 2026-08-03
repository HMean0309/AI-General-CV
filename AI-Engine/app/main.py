"""
FastAPI AI Engine — Main Application.

Stand-alone microservice for AI-powered CV generation.
Receives student academic data + JD from the C# .NET Backend,
runs a 5-step pipeline, and returns an optimized 1-page CV.
"""

import json
import uuid
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import get_settings
from app.middleware.auth import InternalTokenAuthMiddleware
from app.middleware.rate_limiter import limiter, rate_limit_exceeded_handler
from app.schemas.request import GenerateCvRequest
from app.schemas.response import GenerateCvResponse
from app.services import cv_generator

# Configure structured logging
structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.dev.ConsoleRenderer(),
    ],
    wrapper_class=structlog.make_filtering_bound_logger(
        structlog.get_config().get("min_level", 0)
    ),
)

logger = structlog.get_logger(__name__)


# ──────────────────────────────────────────────────────
# Lifespan: Startup & Shutdown
# ──────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup/shutdown tasks."""
    settings = get_settings()

    # Startup: Load embedding model
    logger.info(
        "app.startup",
        embedding_model=settings.embedding_model_name,
    )
    try:
        from app.services.embedding_service import load_model
        load_model(settings.embedding_model_name)
        logger.info("app.embedding_model_ready")
    except Exception as e:
        logger.warning(
            "app.embedding_model_failed",
            error=str(e),
            note="Service will use fallback text matching",
        )

    yield  # Application runs here

    # Shutdown
    logger.info("app.shutdown")


# ──────────────────────────────────────────────────────
# FastAPI App
# ──────────────────────────────────────────────────────
app = FastAPI(
    title="AIGeneralCV — AI Engine",
    description=(
        "FastAPI microservice for AI-powered CV generation. "
        "Analyzes student academic profiles against Job Descriptions "
        "and generates optimized, ATS-friendly 1-page CVs."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# --- Middleware Stack (order matters: outermost first) ---

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth middleware
app.add_middleware(InternalTokenAuthMiddleware)

# Rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)


# ──────────────────────────────────────────────────────
# Request Body Caching Middleware
# ──────────────────────────────────────────────────────
@app.middleware("http")
async def cache_request_body(request: Request, call_next):
    """
    Cache the request body so it can be read multiple times.
    Required for rate limiter to extract student_id from body.
    Also attaches a unique request_id to the request state.
    """
    # Generate request ID
    request.state.request_id = str(uuid.uuid4())

    # Cache body for rate limiter
    if request.method in ("POST", "PUT", "PATCH"):
        body = await request.body()
        request.state.body = body

        # Create a new receive function that returns the cached body
        async def receive():
            return {"type": "http.request", "body": body}

        request._receive = receive

    response = await call_next(request)
    return response


# ──────────────────────────────────────────────────────
# Routes
# ──────────────────────────────────────────────────────
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    from app.services.embedding_service import is_model_loaded
    settings = get_settings()

    return {
        "status": "healthy",
        "version": "1.0.0",
        "embedding_model_loaded": is_model_loaded(),
        "groq_configured": bool(settings.groq_api_key),
        "gemini_configured": bool(settings.gemini_api_key),
    }


@app.post(
    "/api/v1/generate-cv",
    response_model=GenerateCvResponse,
    summary="Generate Optimized CV",
    description=(
        "Accepts a student's academic context and a Job Description, "
        "then generates an optimized 1-page CV using AI."
    ),
)
@limiter.limit("5/minute")
async def generate_cv_endpoint(
    request: Request,
    payload: GenerateCvRequest,
) -> GenerateCvResponse:
    """
    Main CV generation endpoint.

    Pipeline:
    1. Preprocess & sanitize JD
    2. Semantic matching & skill mapping
    3. Build LLM prompt with content budgets
    4. Call LLM (Groq → Gemini → Mock failover)
    5. Validate output & return response
    """
    try:
        response = await cv_generator.generate_cv(payload)
        return response
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            "endpoint.unexpected_error",
            error=str(e),
            student_id=payload.academic_context.student_id,
        )
        # Return mock data on unexpected errors
        from app.services.llm_router import generate_mock_data
        mock_data = generate_mock_data(
            payload.academic_context.full_name,
            payload.academic_context.major,
            payload.academic_context.gpa,
        )
        from app.schemas.response import CvData, ResponseMeta
        return GenerateCvResponse(
            matchScore=0,
            missingKeywords=[],
            cvData=CvData.model_validate(mock_data),
            warnings=[
                "Đã xảy ra lỗi không mong muốn, đây là dữ liệu mẫu.",
                str(e),
            ],
            meta=ResponseMeta(
                requestId=getattr(request.state, "request_id", "unknown"),
                provider="mock",
                latencyMs=0,
                isFallback=True,
            ),
        )
