"""
Request schemas for the CV generation endpoint.
Matches the API contract defined in the system specification.
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class CourseworkInput(BaseModel):
    """A single coursework/subject entry with score."""
    subject_name: str = Field(..., description="Tên môn học tiếng Việt/Anh")
    score: float = Field(..., ge=0.0, le=10.0, description="Điểm số thang 10")


class ProjectInput(BaseModel):
    """A single project entry from the student's portfolio."""
    id: str
    name: str
    role: str
    technologies: str
    description: str = Field(..., description="Mô tả thô từ sinh viên")
    git_url: Optional[str] = None
    demo_url: Optional[str] = None


class CertificateInput(BaseModel):
    """A certificate or certification entry."""
    name: str
    issuer: str
    year: str


class StudentAcademicContext(BaseModel):
    """
    Complete academic profile of a student.
    Sent from the C# .NET Backend after querying the DB.
    """
    student_id: str = Field(..., description="Mã sinh viên cho rate limit & cache")
    full_name: str
    major: str
    gpa: str
    coursework: List[CourseworkInput] = []
    projects: List[ProjectInput] = []
    certificates: Optional[List[CertificateInput]] = []


class GenerateCvRequest(BaseModel):
    """
    Top-level request body for POST /api/v1/generate-cv.
    Contains the raw JD text and the student's academic context.
    """
    job_description: str = Field(..., min_length=30, description="Raw text JD")
    job_title: Optional[str] = Field(None, description="Vị trí ứng tuyển mong muốn")
    academic_context: StudentAcademicContext
