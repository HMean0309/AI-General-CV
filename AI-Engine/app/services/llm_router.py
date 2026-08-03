"""
Step 4 — LLM Router with Failover Chain.

Provider priority: Groq → Gemini → Mock Data.

Handles:
- Async Groq calls with instructor for structured output
- Gemini fallback
- Mock data as last resort
- Auto-retry on schema validation failures
- Timeout management
"""

import asyncio
import json
import time
from typing import Optional, Tuple

import structlog

from app.config import get_settings
from app.schemas.response import (
    CvData,
    PersonalInfo,
    Education,
    Skills,
    ProjectOutput,
    ResponseMeta,
)

logger = structlog.get_logger(__name__)


async def call_groq(
    system_prompt: str,
    user_prompt: str,
    request_id: str,
) -> Tuple[Optional[dict], Optional[str]]:
    """
    Call Groq LLM with instructor for structured output.

    Returns:
        Tuple of (parsed_dict or None, error_message or None)
    """
    settings = get_settings()

    if not settings.groq_api_key:
        logger.warning("llm_router.groq_no_api_key")
        return None, "Groq API key not configured"

    try:
        from groq import AsyncGroq

        client = AsyncGroq(api_key=settings.groq_api_key)

        # Try with instructor for structured output
        try:
            import instructor
            client = instructor.from_groq(
                AsyncGroq(api_key=settings.groq_api_key),
                mode=instructor.Mode.JSON,
            )

            response = await asyncio.wait_for(
                client.chat.completions.create(
                    model=settings.groq_model,
                    response_model=CvData,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    temperature=0.3,
                    max_retries=settings.llm_max_retries,
                ),
                timeout=settings.llm_timeout,
            )

            result = response.model_dump(by_alias=True)
            logger.info("llm_router.groq_success", request_id=request_id)
            return result, None

        except ImportError:
            logger.warning("llm_router.instructor_not_available")
            # Fallback: use raw Groq without instructor
            response = await asyncio.wait_for(
                client.chat.completions.create(
                    model=settings.groq_model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    temperature=0.3,
                    response_format={"type": "json_object"},
                ),
                timeout=settings.llm_timeout,
            )

            content = response.choices[0].message.content
            result = json.loads(content)
            logger.info("llm_router.groq_raw_success", request_id=request_id)
            return result, None

    except asyncio.TimeoutError:
        logger.warning(
            "llm_router.groq_timeout",
            request_id=request_id,
            timeout=settings.llm_timeout,
        )
        return None, f"Groq timeout after {settings.llm_timeout}s"

    except Exception as e:
        error_msg = str(e)
        logger.warning(
            "llm_router.groq_error",
            request_id=request_id,
            error=error_msg,
        )
        return None, f"Groq error: {error_msg}"


async def call_gemini(
    system_prompt: str,
    user_prompt: str,
    request_id: str,
) -> Tuple[Optional[dict], Optional[str]]:
    """
    Call Google Gemini as fallback LLM.

    Returns:
        Tuple of (parsed_dict or None, error_message or None)
    """
    settings = get_settings()

    if not settings.gemini_api_key:
        logger.warning("llm_router.gemini_no_api_key")
        return None, "Gemini API key not configured"

    try:
        import google.generativeai as genai

        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel(
            model_name=settings.gemini_model,
            system_instruction=system_prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.3,
            ),
        )

        response = await asyncio.wait_for(
            asyncio.to_thread(
                model.generate_content,
                user_prompt,
            ),
            timeout=settings.llm_timeout,
        )

        content = response.text
        result = json.loads(content)
        logger.info("llm_router.gemini_success", request_id=request_id)
        return result, None

    except asyncio.TimeoutError:
        logger.warning(
            "llm_router.gemini_timeout",
            request_id=request_id,
            timeout=settings.llm_timeout,
        )
        return None, f"Gemini timeout after {settings.llm_timeout}s"

    except Exception as e:
        error_msg = str(e)
        logger.warning(
            "llm_router.gemini_error",
            request_id=request_id,
            error=error_msg,
        )
        return None, f"Gemini error: {error_msg}"


def generate_mock_data(full_name: str, major: str, gpa: str) -> dict:
    """
    Generate mock CV data as the last resort fallback.
    Used when all LLM providers are unavailable.
    """
    logger.info("llm_router.using_mock_data", full_name=full_name)

    # Create a reasonable mock based on available info
    first_name = full_name.split()[-1] if full_name else "Student"
    email_name = full_name.lower().replace(" ", ".") if full_name else "student"

    mock_cv = CvData(
        personalInfo=PersonalInfo(
            fullName=full_name,
            title=f"{major} Graduate",
            email=f"{email_name}@email.com",
            phone="0xxx-xxx-xxx",
            github=f"github.com/{email_name}",
            linkedin=None,
        ),
        summary=(
            f"Motivated {major} student with a GPA of {gpa}, "
            f"seeking opportunities to apply academic knowledge in a professional setting. "
            f"Eager to learn and contribute to team success."
        ),
        skills=Skills(
            technical=["Node.js", "Express.js", "SQL Server", "Clean Architecture", "Docker", "Git", "REST API"],
            soft=["Teamwork", "Problem Solving", "Continuous Learning"],
        ),
        relevantCoursework=[],
        projects=[
            ProjectOutput(
                name="Hệ thống Backend E-Commerce Microservices",
                role="Lead Backend Developer",
                technologies="Node.js, Express.js, SQL Server, Docker, Git",
                description="Xây dựng hệ thống RESTful API cho thương mại điện tử",
                highlights=[
                    "Designed and implemented RESTful API using Node.js, Express.js and SQL Server",
                    "Architected system using Clean Architecture and SOLID principles",
                    "Optimized database queries and indexing for SQL Server reducing latency by 35%",
                    "Containerized services with Docker and set up automated CI/CD pipeline"
                ]
            )
        ],
        certificates=[],
        education=Education(
            school="Trường Đại học Tây Đô",
            major=major,
            duration="2022 - 2026",
            gpa=gpa,
        ),
    )

    return mock_cv.model_dump(by_alias=True)


async def route_llm_call(
    system_prompt: str,
    user_prompt: str,
    request_id: str,
    full_name: str,
    major: str,
    gpa: str,
) -> Tuple[dict, str, bool, list]:
    """
    Main LLM routing function with failover chain.

    Tries providers in order: Groq → Gemini → Mock.

    Returns:
        Tuple of (cv_data_dict, provider_name, is_fallback, warnings)
    """
    warnings = []

    # --- Try Groq first ---
    logger.info("llm_router.trying_groq", request_id=request_id)
    result, error = await call_groq(system_prompt, user_prompt, request_id)
    if result is not None:
        return result, "groq", False, warnings

    warnings.append(f"Groq không khả dụng: {error}")

    # --- Fallback to Gemini ---
    logger.info("llm_router.trying_gemini", request_id=request_id)
    result, error = await call_gemini(system_prompt, user_prompt, request_id)
    if result is not None:
        return result, "gemini", False, warnings

    warnings.append(f"Gemini không khả dụng: {error}")

    # --- Last resort: Mock Data ---
    logger.warning(
        "llm_router.all_providers_failed",
        request_id=request_id,
    )
    warnings.append("Hệ thống AI tạm thời gián đoạn, đây là dữ liệu mẫu.")
    mock_data = generate_mock_data(full_name, major, gpa)
    return mock_data, "mock", True, warnings
