namespace TayDoApi.DTOs
{
    /// <summary>Dữ liệu tổng hợp để dựng CV cho một sinh viên — gom từ Students, Users, Majors,
    /// ExamResults, Subjects, StudentEvaluationDetails, EvaluationCriterias.</summary>
    public class StudentCvDataDto
    {
        public Guid StudentId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string? Mobile { get; set; }
        public DateTime? BirthDate { get; set; }
        public int? Gender { get; set; }
        public string? Hometown { get; set; }
        public string MajorName { get; set; } = string.Empty;
        public string MajorCode { get; set; } = string.Empty;

        public List<SubjectResultDto> SubjectResults { get; set; } = new();
        public List<PloScoreDto> PloScores { get; set; } = new();
    }

    /// <summary>Kết quả một môn học — tên môn đã được chuyển đổi từ SubjectId (GUID) sang tên thật.</summary>
    public class SubjectResultDto
    {
        public string SubjectCode { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public int CreditPoint { get; set; }
        public float? Result { get; set; }
        public float? CombinedResult { get; set; }
    }

    /// <summary>Điểm theo tiêu chí PLO — tên tiêu chí đã được chuyển đổi từ EvaluationCriteriaId (GUID) sang tên thật.</summary>
    public class PloScoreDto
    {
        public Guid? CriteriaId { get; set; }
        public string CriteriaName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal? StudentScore { get; set; }
        public decimal? MaxScore { get; set; }
    }
}
