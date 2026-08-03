using TayDoApi.DTOs;

namespace TayDoApi.Services
{
    /// <summary>
    /// Bản MOCK của ICvAiService — KHÔNG gọi AI thật, chỉ trả về payload JSON có cấu trúc
    /// và nội dung mẫu hợp lý (dựa trên dữ liệu CV đầu vào một cách đơn giản, không suy luận AI).
    ///
    /// Mục đích: cho phép Frontend team dựng UI (loading state, hiển thị gợi ý...) và thống nhất
    /// hợp đồng dữ liệu (contract) với Backend TRƯỚC KHI tích hợp AI thật — tránh block tiến độ.
    ///
    /// Khi có AI thật: viết class mới (VD: OpenAiCvService) implement ICvAiService,
    /// rồi đổi 1 dòng đăng ký DI trong Program.cs — Controller gọi ICvAiService không cần sửa gì.
    /// </summary>
    public class MockCvAiService : ICvAiService
    {
        public async Task<CvAiSuggestionDto> GenerateSuggestionsAsync(StudentCvDataDto cvData)
        {
            // Giả lập độ trễ mạng/xử lý AI để Frontend có thể test trạng thái loading thực tế
            await Task.Delay(300);

            var majorName = string.IsNullOrWhiteSpace(cvData.MajorName) ? "chuyên ngành của bạn" : cvData.MajorName;
            var topSubjects = cvData.SubjectResults
                .Where(s => s.CombinedResult.HasValue)
                .OrderByDescending(s => s.CombinedResult)
                .Take(3)
                .Select(s => s.SubjectName)
                .ToList();

            var strengths = new List<string>
            {
                $"Nắm vững kiến thức nền tảng ngành {majorName}",
                "Có tinh thần chủ động học hỏi, hoàn thành đầy đủ các học phần theo kế hoạch",
            };
            if (topSubjects.Count > 0)
                strengths.Add($"Kết quả nổi bật ở các môn: {string.Join(", ", topSubjects)}");

            return new CvAiSuggestionDto
            {
                Summary = $"Sinh viên {cvData.FullName} thuộc ngành {majorName}, có bảng điểm với " +
                          $"{cvData.SubjectResults.Count} môn học đã hoàn thành. Đây là bản tóm tắt MẪU " +
                          "(mock) — nội dung thật sẽ do mô hình AI sinh ra khi tích hợp chính thức.",
                Strengths = strengths,
                SuggestedCareerPaths = new List<string>
                {
                    $"Vị trí thực tập sinh liên quan đến {majorName}",
                    "Vị trí nhân viên mới ra trường (fresher) đúng chuyên ngành đào tạo",
                },
                ImprovementTips = new List<string>
                {
                    "Bổ sung các chứng chỉ/khóa học ngoại khóa liên quan đến chuyên ngành",
                    "Nên trình bày thêm dự án hoặc kinh nghiệm thực tế (nếu có) trong CV",
                },
                GeneratedAt = DateTime.UtcNow,
                ModelVersion = "mock-v1",
                IsMock = true,
            };
        }
    }
}
