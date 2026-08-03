using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using TayDoApi.DTOs;

namespace TayDoApi.Services
{
    public interface IAiEngineService
    {
        Task<AiEngineCvResponseDto> GenerateCvAsync(AiEngineCvRequestDto request);
        Task<ExtractJdTextResponseDto> ExtractJdTextAsync(IFormFile file);
    }

    public class AiEngineService : IAiEngineService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AiEngineService> _logger;

        public AiEngineService(HttpClient httpClient, IConfiguration configuration, ILogger<AiEngineService> logger)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<AiEngineCvResponseDto> GenerateCvAsync(AiEngineCvRequestDto request)
        {
            var baseUrl = _configuration["AiEngine:BaseUrl"] ?? "http://localhost:8000";
            var internalToken = _configuration["AiEngine:InternalToken"] ?? "dev_token_for_testing";

            var endpoint = $"{baseUrl.TrimEnd('/')}/api/v1/generate-cv";

            var httpRequest = new HttpRequestMessage(HttpMethod.Post, endpoint);
            httpRequest.Headers.Add("X-Internal-Token", internalToken);

            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = false
            };

            var jsonContent = JsonSerializer.Serialize(request, options);
            httpRequest.Content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            try
            {
                _logger.LogInformation("Sending CV generation request to AI Engine at {Endpoint}", endpoint);
                var response = await _httpClient.SendAsync(httpRequest);

                if (!response.IsSuccessStatusCode)
                {
                    var errorBody = await response.Content.ReadAsStringAsync();
                    _logger.LogError("AI Engine returned status code {StatusCode}: {ErrorBody}", response.StatusCode, errorBody);
                    throw new HttpRequestException($"AI Engine Error ({response.StatusCode}): {errorBody}");
                }

                var responseJson = await response.Content.ReadAsStringAsync();
                var cvResponse = JsonSerializer.Deserialize<AiEngineCvResponseDto>(responseJson, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                return cvResponse ?? throw new InvalidOperationException("Failed to deserialize AI Engine response.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to call AI Engine. Returning Fallback Response.");
                return GenerateFallbackResponse(request);
            }
        }

        private static AiEngineCvResponseDto GenerateFallbackResponse(AiEngineCvRequestDto request)
        {
            var context = request.AcademicContext;
            return new AiEngineCvResponseDto
            {
                MatchScore = 75,
                MissingKeywords = new List<string> { "Git", "REST API", "Teamwork" },
                CvData = new CvDataDto
                {
                    PersonalInfo = new PersonalInfoDto
                    {
                        FullName = context.FullName,
                        Title = request.JobTitle ?? "Thực tập sinh " + context.Major,
                        Email = "student@taydo.edu.vn",
                        Phone = "0900000000",
                        Github = "github.com/student",
                        Linkedin = "linkedin.com/in/student"
                    },
                    Summary = $"Sinh viên ngành {context.Major} năng nổ, mong muốn ứng tuyển vị trí {request.JobTitle ?? "thực tập sinh"}.",
                    Skills = new SkillsDto
                    {
                        Technical = new List<string> { "C#", ".NET", "SQL Server", "HTML/CSS" },
                        Soft = new List<string> { "Giao tiếp", "Làm việc nhóm", "Giải quyết vấn đề" }
                    },
                    RelevantCoursework = context.Coursework.Select(c => new RelevantCourseworkDto
                    {
                        SubjectName = c.SubjectName,
                        Score = c.Score
                    }).ToList(),
                    Projects = context.Projects.Select(p => new ProjectOutputDto
                    {
                        Id = p.Id,
                        Name = p.Name,
                        Role = p.Role,
                        Technologies = p.Technologies,
                        Description = p.Description,
                        GitUrl = p.GitUrl,
                        DemoUrl = p.DemoUrl,
                        Highlights = new List<string>
                        {
                            $"Xây dựng thành công hệ thống {p.Name} sử dụng công nghệ {p.Technologies}.",
                            "Đảm bảo chất lượng mã nguồn và hoàn thành đúng tiến độ."
                        }
                    }).ToList(),
                    Certificates = context.Certificates?.Select(c => new CertificateOutputDto
                    {
                        Name = c.Name,
                        Issuer = c.Issuer,
                        Year = c.Year
                    }).ToList() ?? new List<CertificateOutputDto>(),
                    Education = new EducationDto
                    {
                        School = "Trường Đại học Tây Đô",
                        Major = context.Major,
                        Duration = "2022 - 2026",
                        Gpa = context.Gpa
                    }
                },
                Warnings = new List<string> { "Hệ thống AI đang bảo trì, đây là dữ liệu mẫu dự phòng." },
                Meta = new ResponseMetaDto
                {
                    RequestId = Guid.NewGuid().ToString(),
                    Provider = "mock",
                    LatencyMs = 100,
                    IsFallback = true
                }
            };
        }

        public async Task<ExtractJdTextResponseDto> ExtractJdTextAsync(IFormFile file)
        {
            var baseUrl = _configuration["AiEngine:BaseUrl"] ?? "http://localhost:8000";
            var internalToken = _configuration["AiEngine:InternalToken"] ?? "dev_token_for_testing";
            var endpoint = $"{baseUrl.TrimEnd('/')}/api/v1/extract-jd-text";

            using var content = new MultipartFormDataContent();
            using var stream = file.OpenReadStream();
            var streamContent = new StreamContent(stream);
            streamContent.Headers.ContentType = new MediaTypeHeaderValue(file.ContentType ?? "application/octet-stream");
            content.Add(streamContent, "file", file.FileName);

            var httpRequest = new HttpRequestMessage(HttpMethod.Post, endpoint);
            httpRequest.Headers.Add("X-Internal-Token", internalToken);
            httpRequest.Content = content;

            try
            {
                _logger.LogInformation("Sending file '{FileName}' to AI Engine for text extraction", file.FileName);
                var response = await _httpClient.SendAsync(httpRequest);

                if (!response.IsSuccessStatusCode)
                {
                    var errorBody = await response.Content.ReadAsStringAsync();
                    _logger.LogError("AI Engine extract-jd-text returned {StatusCode}: {ErrorBody}", response.StatusCode, errorBody);
                    throw new HttpRequestException($"AI Engine Error ({response.StatusCode}): {errorBody}");
                }

                var responseJson = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<ExtractJdTextResponseDto>(responseJson, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                return result ?? throw new InvalidOperationException("Failed to deserialize extract-jd-text response.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to extract JD text from file '{FileName}'", file.FileName);
                throw;
            }
        }
    }
}
