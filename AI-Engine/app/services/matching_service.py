"""
Step 2B — Matching Service.

Handles:
- Fuzzy subject name normalization (Vietnamese diacritics removal)
- Student skill extraction from coursework + projects
- JD skill/keyword extraction
- Semantic match score calculation using embeddings
"""

import json
import re
import unicodedata
from pathlib import Path
from typing import List, Tuple

import numpy as np
from rapidfuzz import fuzz, process
import structlog

from app.schemas.request import StudentAcademicContext
from app.services import embedding_service

logger = structlog.get_logger(__name__)

# Load subject-skill mapping
_SKILL_MAP_PATH = Path(__file__).parent.parent / "data" / "subject_skill_map.json"
_skill_map: dict = {}


def _load_skill_map() -> dict:
    """Load and cache the subject-skill mapping."""
    global _skill_map
    if not _skill_map:
        try:
            with open(_SKILL_MAP_PATH, "r", encoding="utf-8") as f:
                _skill_map = json.load(f)
            logger.info("matching.skill_map_loaded", entries=len(_skill_map))
        except FileNotFoundError:
            logger.warning("matching.skill_map_not_found", path=str(_SKILL_MAP_PATH))
            _skill_map = {}
    return _skill_map


def remove_diacritics(text: str) -> str:
    """
    Remove Vietnamese diacritics from text.
    e.g., 'Lập trình hướng đối tượng' -> 'lap trinh huong doi tuong'
    """
    # Normalize to NFD (decomposed form)
    nfkd = unicodedata.normalize("NFKD", text)
    # Remove combining characters (diacritics)
    without_diacritics = "".join(
        c for c in nfkd if not unicodedata.combining(c)
    )
    # Handle special Vietnamese characters
    replacements = {
        "đ": "d", "Đ": "D",
    }
    for old, new in replacements.items():
        without_diacritics = without_diacritics.replace(old, new)

    return without_diacritics.lower().strip()


def normalize_subject_name(subject_name: str) -> str:
    """
    Normalize a subject name for fuzzy matching.
    Removes diacritics, lowercases, and strips extra whitespace.
    """
    normalized = remove_diacritics(subject_name)
    # Remove extra whitespace
    normalized = re.sub(r"\s+", " ", normalized).strip()
    return normalized


def fuzzy_lookup_skills(subject_name: str, threshold: int = 70) -> List[str]:
    """
    Look up skills for a subject using fuzzy string matching.

    Args:
        subject_name: Raw subject name (Vietnamese or English)
        threshold: Minimum fuzzy match score (0-100)

    Returns:
        List of matched skills
    """
    skill_map = _load_skill_map()
    if not skill_map:
        return []

    normalized = normalize_subject_name(subject_name)

    # Direct match first
    if normalized in skill_map:
        return skill_map[normalized]

    # Fuzzy match against all keys
    keys = list(skill_map.keys())
    match = process.extractOne(
        normalized,
        keys,
        scorer=fuzz.token_sort_ratio,
        score_cutoff=threshold,
    )

    if match:
        matched_key, score, _ = match
        logger.debug(
            "matching.fuzzy_match",
            input=subject_name,
            normalized=normalized,
            matched_key=matched_key,
            score=score,
        )
        return skill_map[matched_key]

    return []


def extract_student_skills(academic_context: StudentAcademicContext) -> List[str]:
    """
    Extract all skills from a student's academic context.
    Sources: coursework (via skill map) + project technologies.

    Returns:
        Deduplicated list of skills.
    """
    skills = set()

    # Extract from coursework via fuzzy skill map
    for course in academic_context.coursework:
        matched_skills = fuzzy_lookup_skills(course.subject_name)
        skills.update(matched_skills)

    # Extract from project technologies
    for project in academic_context.projects:
        if project.technologies:
            # Split by common delimiters
            techs = re.split(r"[,;|/]+", project.technologies)
            for tech in techs:
                tech = tech.strip()
                if tech:
                    skills.add(tech)

    return sorted(list(skills))


def extract_jd_keywords(jd_text: str) -> List[str]:
    """
    Extract skill keywords from a Job Description text.
    Uses simple heuristics and common tech keyword detection.
    """
    # Common tech keywords to look for
    tech_patterns = [
        r"\b(?:Python|Java|JavaScript|TypeScript|C\+\+|C#|Go|Rust|Ruby|PHP|Swift|Kotlin)\b",
        r"\b(?:React|Angular|Vue|Next\.js|Node\.js|Express|Django|Flask|FastAPI|Spring\s*Boot)\b",
        r"\b(?:SQL|MySQL|PostgreSQL|MongoDB|Redis|Elasticsearch|Firebase)\b",
        r"\b(?:Docker|Kubernetes|AWS|Azure|GCP|CI/CD|Jenkins|Git|GitHub)\b",
        r"\b(?:Machine\s*Learning|Deep\s*Learning|NLP|Computer\s*Vision|AI|TensorFlow|PyTorch)\b",
        r"\b(?:REST\s*API|GraphQL|Microservices|Agile|Scrum|DevOps|TDD)\b",
        r"\b(?:HTML|CSS|Tailwind|Bootstrap|Figma|UI/UX)\b",
        r"\b(?:Linux|Windows\s*Server|Nginx|Apache)\b",
        r"\b(?:Selenium|Jest|Pytest|JUnit|Testing|QA)\b",
        r"\b(?:OOP|Design\s*Patterns|Data\s*Structures|Algorithms)\b",
        r"\b(?:Blockchain|IoT|Cloud\s*Computing|Big\s*Data|Data\s*Science)\b",
        r"\b(?:Flutter|React\s*Native|Android|iOS|Mobile)\b",
        r"\b(?:Hadoop|Spark|Kafka|RabbitMQ|Message\s*Queue)\b",
        r"\b(?:Cybersecurity|Network\s*Security|Encryption|Cryptography)\b",
    ]

    keywords = set()
    for pattern in tech_patterns:
        matches = re.findall(pattern, jd_text, re.IGNORECASE)
        for m in matches:
            keywords.add(m.strip())

    return sorted(list(keywords))


def calculate_match(
    student_skills: List[str],
    jd_keywords: List[str],
) -> Tuple[int, List[str]]:
    """
    Calculate match score between student skills and JD requirements
    using semantic embeddings.

    Returns:
        Tuple of (matchScore 0-100, list of missing keywords)
    """
    if not jd_keywords:
        return 0, []

    if not student_skills:
        return 0, jd_keywords

    # Check if embedding model is available
    if not embedding_service.is_model_loaded():
        # Fallback to simple text matching
        return _fallback_text_match(student_skills, jd_keywords)

    try:
        # Encode both sets of skills
        student_embeddings = embedding_service.encode_texts(student_skills)
        jd_embeddings = embedding_service.encode_texts(jd_keywords)

        if student_embeddings.size == 0 or jd_embeddings.size == 0:
            return 0, jd_keywords

        # For each JD keyword, find the best matching student skill
        matched_count = 0
        missing_keywords = []
        similarity_threshold = 0.55  # Minimum similarity to consider a match

        for i, jd_kw in enumerate(jd_keywords):
            jd_vec = jd_embeddings[i]
            similarities = embedding_service.batch_cosine_similarity(
                jd_vec, student_embeddings
            )
            max_sim = float(np.max(similarities))

            if max_sim >= similarity_threshold:
                matched_count += 1
            else:
                missing_keywords.append(jd_kw)

        match_score = int((matched_count / len(jd_keywords)) * 100)
        match_score = min(100, max(0, match_score))

        logger.info(
            "matching.score_calculated",
            match_score=match_score,
            total_jd_keywords=len(jd_keywords),
            matched=matched_count,
            missing=len(missing_keywords),
        )

        return match_score, missing_keywords

    except Exception as e:
        logger.error("matching.embedding_error", error=str(e))
        return _fallback_text_match(student_skills, jd_keywords)


def _fallback_text_match(
    student_skills: List[str],
    jd_keywords: List[str],
) -> Tuple[int, List[str]]:
    """
    Simple fuzzy text matching fallback when embeddings are unavailable.
    """
    matched_count = 0
    missing_keywords = []
    student_lower = [s.lower() for s in student_skills]

    for kw in jd_keywords:
        kw_lower = kw.lower()
        # Check direct substring match or high fuzzy score
        found = False
        for skill in student_lower:
            if kw_lower in skill or skill in kw_lower:
                found = True
                break
            if fuzz.token_sort_ratio(kw_lower, skill) >= 80:
                found = True
                break

        if found:
            matched_count += 1
        else:
            missing_keywords.append(kw)

    match_score = int((matched_count / len(jd_keywords)) * 100) if jd_keywords else 0
    return min(100, max(0, match_score)), missing_keywords
