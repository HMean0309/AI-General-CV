"""
Response schemas for the CV generation endpoint.
All models use camelCase serialization for Frontend compatibility.
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional


class BaseCamelModel(BaseModel):
    """Base model that serializes field names to camelCase."""
    model_config = ConfigDict(
        populate_by_name=True,
        serialize_by_alias=True,
    )


class PersonalInfo(BaseCamelModel):
    """Contact and identity information for the CV header."""
    fullName: str
    title: str
    email: str
    phone: str
    github: Optional[str] = None
    linkedin: Optional[str] = None


class RelevantCoursework(BaseCamelModel):
    """A single relevant coursework entry selected for the CV."""
    subjectName: str
    score: float


class ProjectOutput(BaseCamelModel):
    """An optimized project entry with AI-generated highlights."""
    id: Optional[str] = None
    name: str
    role: Optional[str] = None
    technologies: Optional[str] = None
    description: Optional[str] = None
    gitUrl: Optional[str] = None
    demoUrl: Optional[str] = None
    highlights: List[str] = Field(
        default=[],
        description="Highlights câu thành tựu ngắn gọn với Action Verbs",
    )


class CertificateOutput(BaseCamelModel):
    """A certificate entry for the CV."""
    name: str
    issuer: Optional[str] = None
    year: Optional[str] = None


class Education(BaseCamelModel):
    """Education section of the CV."""
    school: str
    major: str
    duration: str
    gpa: str


class Skills(BaseCamelModel):
    """Technical and soft skills section."""
    technical: List[str]
    soft: List[str]


class CvData(BaseCamelModel):
    """Complete structured CV data for rendering."""
    personalInfo: PersonalInfo
    summary: str = Field(..., description="Tối đa 2-3 câu (dưới 45 từ)")
    skills: Skills
    relevantCoursework: List[RelevantCoursework] = []
    projects: List[ProjectOutput] = []
    certificates: List[CertificateOutput] = []
    education: Education


class ResponseMeta(BaseCamelModel):
    """Metadata about the generation request."""
    requestId: str
    provider: str  # "groq" | "gemini" | "mock"
    latencyMs: int
    isFallback: bool


class ScoreBreakdown(BaseCamelModel):
    """
    Multi-Dimensional Scoring Model — 4 Trụ cột đánh giá.
    Mỗi trụ cột là điểm 0–100, trọng số được áp dụng khi tính matchScore tổng.
    """
    technicalSkillScore: int = Field(0, ge=0, le=100, description="Trọng số 35% — Kỹ năng kỹ thuật khớp JD")
    projectRelevanceScore: int = Field(0, ge=0, le=100, description="Trọng số 30% — Độ phù hợp Đồ án/Dự án")
    academicPloScore: int = Field(0, ge=0, le=100, description="Trọng số 20% — Điểm học tập & PLO liên quan")
    softSkillCertScore: int = Field(0, ge=0, le=100, description="Trọng số 15% — Chứng chỉ & Kỹ năng mềm")


class GenerateCvResponse(BaseCamelModel):
    """
    Top-level response for the CV generation endpoint.
    Contains match analysis, structured CV data, and metadata.
    """
    matchScore: int = Field(..., ge=0, le=100)
    missingKeywords: List[str]
    cvData: CvData
    scoreBreakdown: Optional[ScoreBreakdown] = None
    warnings: List[str] = []
    meta: ResponseMeta

