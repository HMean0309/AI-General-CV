using System.Text.Json.Serialization;

namespace TayDoApi.DTOs
{
    // ==========================================
    // REQUEST DTOs (C# -> FastAPI)
    // ==========================================
    public class AiEngineCvRequestDto
    {
        [JsonPropertyName("job_description")]
        public string JobDescription { get; set; } = string.Empty;

        [JsonPropertyName("job_title")]
        public string? JobTitle { get; set; }

        [JsonPropertyName("academic_context")]
        public StudentAcademicContextDto AcademicContext { get; set; } = new();
    }

    public class StudentAcademicContextDto
    {
        [JsonPropertyName("student_id")]
        public string StudentId { get; set; } = string.Empty;

        [JsonPropertyName("full_name")]
        public string FullName { get; set; } = string.Empty;

        [JsonPropertyName("major")]
        public string Major { get; set; } = string.Empty;

        [JsonPropertyName("gpa")]
        public string Gpa { get; set; } = string.Empty;

        [JsonPropertyName("coursework")]
        public List<CourseworkInputDto> Coursework { get; set; } = new();

        [JsonPropertyName("projects")]
        public List<ProjectInputDto> Projects { get; set; } = new();

        [JsonPropertyName("certificates")]
        public List<CertificateInputDto>? Certificates { get; set; } = new();
    }

    public class CourseworkInputDto
    {
        [JsonPropertyName("subject_name")]
        public string SubjectName { get; set; } = string.Empty;

        [JsonPropertyName("score")]
        public float Score { get; set; }
    }

    public class ProjectInputDto
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("role")]
        public string Role { get; set; } = string.Empty;

        [JsonPropertyName("technologies")]
        public string Technologies { get; set; } = string.Empty;

        [JsonPropertyName("description")]
        public string Description { get; set; } = string.Empty;

        [JsonPropertyName("git_url")]
        public string? GitUrl { get; set; }

        [JsonPropertyName("demo_url")]
        public string? DemoUrl { get; set; }
    }

    public class CertificateInputDto
    {
        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("issuer")]
        public string Issuer { get; set; } = string.Empty;

        [JsonPropertyName("year")]
        public string Year { get; set; } = string.Empty;
    }

    // ==========================================
    // RESPONSE DTOs (FastAPI -> C# -> Frontend)
    // ==========================================
    public class ScoreBreakdownDto
    {
        [JsonPropertyName("technicalSkillScore")]
        public int TechnicalSkillScore { get; set; }

        [JsonPropertyName("projectRelevanceScore")]
        public int ProjectRelevanceScore { get; set; }

        [JsonPropertyName("academicPloScore")]
        public int AcademicPloScore { get; set; }

        [JsonPropertyName("softSkillCertScore")]
        public int SoftSkillCertScore { get; set; }
    }

    public class AiEngineCvResponseDto
    {
        [JsonPropertyName("matchScore")]
        public int MatchScore { get; set; }

        [JsonPropertyName("missingKeywords")]
        public List<string> MissingKeywords { get; set; } = new();

        [JsonPropertyName("cvData")]
        public CvDataDto CvData { get; set; } = new();

        [JsonPropertyName("scoreBreakdown")]
        public ScoreBreakdownDto? ScoreBreakdown { get; set; }

        [JsonPropertyName("warnings")]
        public List<string> Warnings { get; set; } = new();

        [JsonPropertyName("meta")]
        public ResponseMetaDto Meta { get; set; } = new();
    }

    public class CvDataDto
    {
        [JsonPropertyName("personalInfo")]
        public PersonalInfoDto PersonalInfo { get; set; } = new();

        [JsonPropertyName("summary")]
        public string Summary { get; set; } = string.Empty;

        [JsonPropertyName("skills")]
        public SkillsDto Skills { get; set; } = new();

        [JsonPropertyName("relevantCoursework")]
        public List<RelevantCourseworkDto> RelevantCoursework { get; set; } = new();

        [JsonPropertyName("projects")]
        public List<ProjectOutputDto> Projects { get; set; } = new();

        [JsonPropertyName("certificates")]
        public List<CertificateOutputDto> Certificates { get; set; } = new();

        [JsonPropertyName("education")]
        public EducationDto Education { get; set; } = new();
    }

    public class PersonalInfoDto
    {
        [JsonPropertyName("fullName")]
        public string FullName { get; set; } = string.Empty;

        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;

        [JsonPropertyName("email")]
        public string Email { get; set; } = string.Empty;

        [JsonPropertyName("phone")]
        public string Phone { get; set; } = string.Empty;

        [JsonPropertyName("github")]
        public string? Github { get; set; }

        [JsonPropertyName("linkedin")]
        public string? Linkedin { get; set; }
    }

    public class SkillsDto
    {
        [JsonPropertyName("technical")]
        public List<string> Technical { get; set; } = new();

        [JsonPropertyName("soft")]
        public List<string> Soft { get; set; } = new();
    }

    public class RelevantCourseworkDto
    {
        [JsonPropertyName("subjectName")]
        public string SubjectName { get; set; } = string.Empty;

        [JsonPropertyName("score")]
        public float Score { get; set; }
    }

    public class ProjectOutputDto
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("role")]
        public string Role { get; set; } = string.Empty;

        [JsonPropertyName("technologies")]
        public string Technologies { get; set; } = string.Empty;

        [JsonPropertyName("description")]
        public string Description { get; set; } = string.Empty;

        [JsonPropertyName("gitUrl")]
        public string? GitUrl { get; set; }

        [JsonPropertyName("demoUrl")]
        public string? DemoUrl { get; set; }

        [JsonPropertyName("highlights")]
        public List<string> Highlights { get; set; } = new();
    }

    public class CertificateOutputDto
    {
        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("issuer")]
        public string Issuer { get; set; } = string.Empty;

        [JsonPropertyName("year")]
        public string Year { get; set; } = string.Empty;
    }

    public class EducationDto
    {
        [JsonPropertyName("school")]
        public string School { get; set; } = string.Empty;

        [JsonPropertyName("major")]
        public string Major { get; set; } = string.Empty;

        [JsonPropertyName("duration")]
        public string Duration { get; set; } = string.Empty;

        [JsonPropertyName("gpa")]
        public string Gpa { get; set; } = string.Empty;
    }

    public class ResponseMetaDto
    {
        [JsonPropertyName("requestId")]
        public string RequestId { get; set; } = string.Empty;

        [JsonPropertyName("provider")]
        public string Provider { get; set; } = string.Empty;

        [JsonPropertyName("latencyMs")]
        public int LatencyMs { get; set; }

        [JsonPropertyName("isFallback")]
        public bool IsFallback { get; set; }
    }

    public class GenerateCvClientRequestDto
    {
        public string JobDescription { get; set; } = string.Empty;
        public string? TargetRole { get; set; }
        public Guid? StudentId { get; set; }
    }

    /// <summary>
    /// Response DTO cho endpoint extract-jd-text từ AI-Engine.
    /// </summary>
    public class ExtractJdTextResponseDto
    {
        [JsonPropertyName("success")]
        public bool Success { get; set; }

        [JsonPropertyName("filename")]
        public string Filename { get; set; } = string.Empty;

        [JsonPropertyName("text")]
        public string Text { get; set; } = string.Empty;

        [JsonPropertyName("textLength")]
        public int TextLength { get; set; }
    }

    public class SaveCvRequestDto
    {
        public string? TargetRole { get; set; }
        public string? JobDescription { get; set; }
        public int MatchScore { get; set; }
        public object CvData { get; set; } = new();
    }
}
