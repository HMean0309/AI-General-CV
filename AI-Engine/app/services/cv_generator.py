"""
CV Generator — Orchestrator Service.

Runs the complete 5-step pipeline:
1. Preprocessing & Sanitization
2. Semantic Matching & Skill Mapping
3. Prompt Generation with Content Budget
4. LLM Call with Failover
5. Output Validation & Response Building
"""

import time
import uuid

import structlog

from app.schemas.request import GenerateCvRequest
from app.schemas.response import (
    GenerateCvResponse,
    CvData,
    ResponseMeta,
    ScoreBreakdown,
)
from app.services import (
    preprocessing,
    matching_service,
    prompt_builder,
    llm_router,
)

logger = structlog.get_logger(__name__)


async def generate_cv(request: GenerateCvRequest) -> GenerateCvResponse:
    """
    Main orchestrator for CV generation.

    Runs the complete pipeline and returns a structured response.

    Args:
        request: The validated generation request.

    Returns:
        GenerateCvResponse with CV data, match score, and metadata.

    Raises:
        HTTPException: For validation errors (400, 422).
    """
    start_time = time.time()
    request_id = str(uuid.uuid4())
    context = request.academic_context
    all_warnings = []

    logger.info(
        "cv_generator.pipeline_start",
        request_id=request_id,
        student_id=context.student_id,
    )

    # ──────────────────────────────────────────────────────
    # STEP 1: Preprocessing & Sanitization
    # ──────────────────────────────────────────────────────
    sanitized_jd, preprocess_warnings = preprocessing.validate_request(request)
    all_warnings.extend(preprocess_warnings)

    # ──────────────────────────────────────────────────────
    # STEP 2: Semantic Matching & Skill Mapping
    # ──────────────────────────────────────────────────────
    is_entry_level = (
        not context.coursework and not context.projects
    )

    if is_entry_level:
        # Edge Case #2: Empty coursework & projects
        logger.info(
            "cv_generator.entry_level_mode",
            request_id=request_id,
            student_id=context.student_id,
        )
        match_score = 0
        missing_keywords = []
        student_skills = []
        score_breakdown = ScoreBreakdown()
    else:
        # Extract skills and calculate match
        student_skills = matching_service.extract_student_skills(context)
        jd_keywords = matching_service.extract_jd_keywords(sanitized_jd)
        match_score, missing_keywords, breakdown_dict = matching_service.calculate_match(
            student_skills, jd_keywords, academic_context=context
        )
        score_breakdown = ScoreBreakdown(**breakdown_dict)

    # ──────────────────────────────────────────────────────
    # STEP 3: Prompt Generation
    # ──────────────────────────────────────────────────────
    system_prompt = prompt_builder.SYSTEM_PROMPT

    if is_entry_level:
        user_prompt = prompt_builder.build_entry_level_prompt(
            request, sanitized_jd
        )
    else:
        user_prompt = prompt_builder.build_user_prompt(
            request,
            sanitized_jd,
            match_score,
            missing_keywords,
            student_skills,
        )

    # ──────────────────────────────────────────────────────
    # STEP 4: LLM Call with Failover
    # ──────────────────────────────────────────────────────
    cv_data_dict, provider, is_fallback, llm_warnings = await llm_router.route_llm_call(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        request_id=request_id,
        full_name=context.full_name,
        major=context.major,
        gpa=context.gpa,
        projects=context.projects,
        certificates=context.certificates,
    )
    all_warnings.extend(llm_warnings)

    # ──────────────────────────────────────────────────────
    # STEP 5: Output Validation & Response Building
    # ──────────────────────────────────────────────────────
    try:
        cv_data = CvData.model_validate(cv_data_dict)
    except Exception as e:
        logger.warning(
            "cv_generator.validation_failed",
            request_id=request_id,
            error=str(e),
            provider=provider,
        )
        # If validation fails, generate mock data
        all_warnings.append(
            f"Dữ liệu từ {provider} không hợp lệ, sử dụng dữ liệu mẫu."
        )
        mock_data = llm_router.generate_mock_data(
            context.full_name,
            context.major,
            context.gpa,
            projects=context.projects,
            certificates=context.certificates,
        )
        cv_data = CvData.model_validate(mock_data)
        provider = "mock"
        is_fallback = True

    # Calculate latency
    latency_ms = int((time.time() - start_time) * 1000)

    # Build final response
    response = GenerateCvResponse(
        matchScore=match_score,
        missingKeywords=missing_keywords,
        cvData=cv_data,
        scoreBreakdown=score_breakdown,
        warnings=all_warnings,
        meta=ResponseMeta(
            requestId=request_id,
            provider=provider,
            latencyMs=latency_ms,
            isFallback=is_fallback,
        ),
    )

    logger.info(
        "cv_generator.pipeline_complete",
        request_id=request_id,
        student_id=context.student_id,
        provider=provider,
        is_fallback=is_fallback,
        match_score=match_score,
        latency_ms=latency_ms,
    )

    return response
