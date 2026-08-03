namespace TayDoApi.DTOs
{
    /// <summary>Payload chuẩn trả về cho Frontend — dùng chung cho cả Mock lẫn AI thật sau này.</summary>
    public class CvAiSuggestionDto
    {
        public string Summary { get; set; } = string.Empty;
        public List<string> Strengths { get; set; } = new();
        public List<string> SuggestedCareerPaths { get; set; } = new();
        public List<string> ImprovementTips { get; set; } = new();
        public DateTime GeneratedAt { get; set; }
        public string ModelVersion { get; set; } = string.Empty;
        public bool IsMock { get; set; }
    }
}
