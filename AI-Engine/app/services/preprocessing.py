"""
Step 1 — Preprocessing & Sanitization.

Handles:
- Word count validation (JD >= 30 words)
- Required fields check (full_name, major)
- Prompt injection sanitization
- JD truncation for overly long inputs
"""

import re
from typing import Tuple, List

from fastapi import HTTPException
import structlog

from app.schemas.request import GenerateCvRequest

logger = structlog.get_logger(__name__)

# Patterns that indicate prompt injection attempts
INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?previous\s+instructions",
    r"ignore\s+(all\s+)?above\s+instructions",
    r"disregard\s+(all\s+)?previous",
    r"forget\s+(all\s+)?previous",
    r"system\s*:",
    r"###\s*",
    r"<\s*system\s*>",
    r"<\s*/\s*system\s*>",
    r"\bprompt\s*:",
    r"\binstruction\s*:",
    r"you\s+are\s+now\s+a",
    r"act\s+as\s+a",
    r"pretend\s+you\s+are",
    r"new\s+instructions?\s*:",
    r"override\s+(all\s+)?instructions",
]

# Compiled regex for efficiency
_injection_regex = re.compile(
    "|".join(INJECTION_PATTERNS),
    re.IGNORECASE,
)

# Regex to extract Requirements/Responsibilities sections from long JDs
_section_regex = re.compile(
    r"((?:requirements?|responsibilities|qualifications?|skills?\s*(?:required|needed)|"
    r"yêu\s*cầu|trách\s*nhiệm|kỹ\s*năng|năng\s*lực).*?)(?=\n\n|\n(?:[A-Z]|[^\s])|\Z)",
    re.IGNORECASE | re.DOTALL,
)


def count_words(text: str) -> int:
    """Count actual words in text, ignoring extra whitespace."""
    return len(text.split())


def sanitize_jd(jd_text: str) -> Tuple[str, List[str]]:
    """
    Remove prompt injection patterns from JD text.

    Returns:
        Tuple of (sanitized_text, list_of_warnings)
    """
    warnings = []
    sanitized = jd_text

    # Find and remove injection patterns
    matches = _injection_regex.findall(sanitized)
    if matches:
        logger.warning(
            "preprocessing.injection_detected",
            patterns_found=len(matches),
            patterns=matches[:5],  # Log first 5 for debugging
        )
        sanitized = _injection_regex.sub("[FILTERED]", sanitized)
        warnings.append(
            f"Phát hiện {len(matches)} mẫu nội dung đáng ngờ trong JD đã được lọc."
        )

    return sanitized, warnings


def truncate_jd(jd_text: str, max_words: int = 2000) -> Tuple[str, bool]:
    """
    Truncate JD if it exceeds max_words.
    Tries to extract Requirements/Responsibilities sections first.

    Returns:
        Tuple of (truncated_text, was_truncated)
    """
    word_count = count_words(jd_text)
    if word_count <= max_words:
        return jd_text, False

    logger.info(
        "preprocessing.jd_truncation",
        original_words=word_count,
        max_words=max_words,
    )

    # Try to extract key sections
    sections = _section_regex.findall(jd_text)
    if sections:
        extracted = "\n\n".join(sections)
        if count_words(extracted) >= 30:  # Make sure we have enough content
            return extracted.strip(), True

    # Fallback: just take the first max_words words
    words = jd_text.split()
    truncated = " ".join(words[:max_words])
    return truncated, True


def validate_request(request: GenerateCvRequest) -> Tuple[str, List[str]]:
    """
    Full preprocessing pipeline for a generation request.

    Steps:
    1. Check word count (>= 30)
    2. Check required fields (full_name, major)
    3. Sanitize JD for prompt injection
    4. Truncate if too long

    Returns:
        Tuple of (processed_jd, list_of_warnings)

    Raises:
        HTTPException 400: JD too short
        HTTPException 422: Missing required fields
    """
    warnings = []
    jd = request.job_description
    ctx = request.academic_context

    # Step 1: Word count check
    word_count = count_words(jd)
    if word_count < 30:
        logger.warning(
            "preprocessing.jd_too_short",
            word_count=word_count,
            student_id=ctx.student_id,
        )
        raise HTTPException(
            status_code=400,
            detail=f"Job description quá ngắn ({word_count} từ). Yêu cầu tối thiểu 30 từ.",
        )

    # Step 2: Required fields check
    if not ctx.full_name or not ctx.full_name.strip():
        raise HTTPException(
            status_code=422,
            detail="Thiếu trường bắt buộc: full_name",
        )
    if not ctx.major or not ctx.major.strip():
        raise HTTPException(
            status_code=422,
            detail="Thiếu trường bắt buộc: major",
        )

    # Step 3: Sanitize prompt injection
    jd, injection_warnings = sanitize_jd(jd)
    warnings.extend(injection_warnings)

    # Step 4: Truncate if too long
    jd, was_truncated = truncate_jd(jd)
    if was_truncated:
        warnings.append("JD quá dài, đã được rút gọn tự động.")

    logger.info(
        "preprocessing.complete",
        student_id=ctx.student_id,
        jd_words=count_words(jd),
        warnings_count=len(warnings),
    )

    return jd, warnings
