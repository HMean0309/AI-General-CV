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
    academic_context=None,
) -> Tuple[int, List[str], dict]:
    """
    Multi-Dimensional Scoring Model — Tính điểm CV đa chiều.

    4 Trụ cột:
    - Technical Skill Score (35%): Kỹ năng kỹ thuật khớp JD
    - Project Relevance Score (30%): Độ phù hợp đồ án
    - Academic & PLO Score (20%): Điểm học tập & PLO liên quan
    - Soft Skill & Cert Score (15%): Chứng chỉ & kỹ năng mềm

    Returns:
        Tuple of (matchScore 0-100, missing keywords list, scoreBreakdown dict)
    """
    if not jd_keywords:
        return 0, [], {
            "technicalSkillScore": 0,
            "projectRelevanceScore": 0,
            "academicPloScore": 0,
            "softSkillCertScore": 0,
        }

    # ── Pillar 1: Technical Skill Score (35%) ──
    tech_score, missing_keywords = _calculate_technical_skill_score(
        student_skills, jd_keywords
    )

    # ── Pillar 2: Project Relevance Score (30%) ──
    project_score = _calculate_project_relevance_score(
        academic_context, jd_keywords
    )

    # ── Pillar 3: Academic & PLO Score (20%) ──
    academic_score = _calculate_academic_plo_score(
        academic_context, jd_keywords
    )

    # ── Pillar 4: Soft Skill & Cert Score (15%) ──
    cert_score = _calculate_soft_skill_cert_score(
        academic_context, jd_keywords
    )

    # ── Weighted Total ──
    match_score = int(
        tech_score * 0.35
        + project_score * 0.30
        + academic_score * 0.20
        + cert_score * 0.15
    )
    match_score = min(100, max(0, match_score))

    score_breakdown = {
        "technicalSkillScore": tech_score,
        "projectRelevanceScore": project_score,
        "academicPloScore": academic_score,
        "softSkillCertScore": cert_score,
    }

    logger.info(
        "matching.multi_dimensional_score",
        match_score=match_score,
        technical=tech_score,
        project=project_score,
        academic=academic_score,
        cert=cert_score,
        missing=len(missing_keywords),
    )

    return match_score, missing_keywords, score_breakdown


def _calculate_technical_skill_score(
    student_skills: List[str],
    jd_keywords: List[str],
) -> Tuple[int, List[str]]:
    """
    Pillar 1: So khớp kỹ năng kỹ thuật sinh viên với từ khóa JD.
    Dùng embedding semantic matching hoặc fallback fuzzy text.
    """
    if not student_skills:
        return 0, jd_keywords

    # Check if embedding model is available
    if not embedding_service.is_model_loaded():
        return _fallback_text_match(student_skills, jd_keywords)

    try:
        student_embeddings = embedding_service.encode_texts(student_skills)
        jd_embeddings = embedding_service.encode_texts(jd_keywords)

        if student_embeddings.size == 0 or jd_embeddings.size == 0:
            return 0, jd_keywords

        matched_count = 0
        missing_keywords = []
        similarity_threshold = 0.55

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

        score = int((matched_count / len(jd_keywords)) * 100)
        return min(100, max(0, score)), missing_keywords

    except Exception as e:
        logger.error("matching.technical_embedding_error", error=str(e))
        return _fallback_text_match(student_skills, jd_keywords)


def _calculate_project_relevance_score(
    academic_context,
    jd_keywords: List[str],
) -> int:
    """
    Pillar 2: Đánh giá mức độ phù hợp đồ án so với JD.
    Kiểm tra tech stack + từ khóa mô tả dự án khớp với từ khóa JD.
    """
    if not academic_context or not academic_context.projects:
        return 0

    if not jd_keywords:
        return 0

    jd_lower = {kw.lower() for kw in jd_keywords}
    project_scores = []

    for project in academic_context.projects:
        matched = 0
        total_checks = len(jd_lower)

        if total_checks == 0:
            continue

        # Check technologies
        tech_text = (project.technologies or "").lower()
        desc_text = (project.description or "").lower()
        name_text = (project.name or "").lower()
        combined_text = f"{tech_text} {desc_text} {name_text}"

        for kw in jd_lower:
            kw_l = kw.lower()
            if kw_l in combined_text:
                matched += 1
            elif any(
                fuzz.token_sort_ratio(kw_l, word) >= 75
                for word in combined_text.split()
                if len(word) > 2
            ):
                matched += 1

        project_score = (matched / total_checks) * 100 if total_checks > 0 else 0
        project_scores.append(project_score)

    if not project_scores:
        return 0

    # Lấy điểm trung bình 2 đồ án tốt nhất (hoặc ít hơn nếu chỉ có 1)
    project_scores.sort(reverse=True)
    top_scores = project_scores[:2]
    avg_score = sum(top_scores) / len(top_scores)

    return min(100, max(0, int(avg_score)))


def _calculate_academic_plo_score(
    academic_context,
    jd_keywords: List[str],
) -> int:
    """
    Pillar 3: Tính điểm học tập các môn liên quan & PLO.
    Lọc môn học có kỹ năng liên quan đến JD, tính điểm trung bình.
    """
    if not academic_context or not academic_context.coursework:
        return 0

    jd_lower = {kw.lower() for kw in jd_keywords}
    relevant_scores = []

    for course in academic_context.coursework:
        # Lấy skills tương ứng cho môn học qua skill map
        course_skills = fuzzy_lookup_skills(course.subject_name)
        course_skills_lower = {s.lower() for s in course_skills}

        # Kiểm tra skill map có overlap với JD keywords không
        is_relevant = bool(course_skills_lower & jd_lower)

        if not is_relevant:
            # Fallback: kiểm tra tên môn học có chứa từ khóa JD
            course_name_lower = course.subject_name.lower()
            is_relevant = any(
                kw.lower() in course_name_lower
                for kw in jd_keywords
            )

        if is_relevant:
            # Quy đổi điểm thang 10 → thang 100
            relevant_scores.append(min(100, course.score * 10))

    if not relevant_scores:
        # Không tìm thấy môn liên quan → dùng GPA tổng thể * 10 làm baseline
        all_scores = [c.score for c in academic_context.coursework]
        if all_scores:
            avg_gpa = sum(all_scores) / len(all_scores)
            return min(100, max(0, int(avg_gpa * 10 * 0.6)))  # Phạt 40% vì không specific
        return 0

    avg = sum(relevant_scores) / len(relevant_scores)
    return min(100, max(0, int(avg)))


def _calculate_soft_skill_cert_score(
    academic_context,
    jd_keywords: List[str],
) -> int:
    """
    Pillar 4: Đánh giá chứng chỉ & kỹ năng mềm phù hợp JD.
    """
    if not academic_context:
        return 0

    score = 0
    certs = academic_context.certificates or []

    if not certs:
        return 30  # Baseline: có nền tảng nhưng chưa có chứng chỉ cụ thể

    jd_lower = {kw.lower() for kw in jd_keywords}
    jd_text = " ".join(jd_keywords).lower()

    relevant_cert_count = 0
    for cert in certs:
        cert_text = f"{cert.name} {cert.issuer}".lower()
        # Kiểm tra chứng chỉ có liên quan đến IT/JD không
        it_keywords = {
            "aws", "azure", "google", "cisco", "microsoft", "oracle",
            "comptia", "linux", "python", "java", "node", "react",
            "docker", "kubernetes", "scrum", "agile", "pmp", "itil",
            "ielts", "toeic", "toefl", "jlpt", "topik",
        }
        is_it_cert = any(kw in cert_text for kw in it_keywords)
        is_jd_relevant = any(kw in cert_text for kw in jd_lower)

        if is_jd_relevant:
            relevant_cert_count += 2  # Trực tiếp liên quan JD: trọng số x2
        elif is_it_cert:
            relevant_cert_count += 1  # IT cert chung

    # Tính điểm: mỗi cert liên quan cộng 20 điểm, tối đa 100
    score = min(100, 30 + relevant_cert_count * 20)

    return max(0, score)


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

