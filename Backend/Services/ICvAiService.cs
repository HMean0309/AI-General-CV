using TayDoApi.DTOs;

namespace TayDoApi.Services
{
    /// <summary>
    /// Hợp đồng cho dịch vụ AI phân tích/gợi ý nội dung CV.
    /// Hiện chỉ có bản Mock (MockCvAiService) — khi có tích hợp AI thật (OpenAI, Azure AI...),
    /// tạo thêm class mới implement interface này rồi đổi đăng ký DI trong Program.cs,
    /// KHÔNG cần sửa gì ở Controller đang gọi ICvAiService.
    /// </summary>
    public interface ICvAiService
    {
        Task<CvAiSuggestionDto> GenerateSuggestionsAsync(StudentCvDataDto cvData);
    }
}
