using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TayDoApi.Data;
using TayDoApi.DTOs;
using TayDoApi.Models;
using TayDoApi.Services;

namespace TayDoApi.Controllers
{
    [ApiController]
    [Route("api/cv")]
    [Authorize]
    public class CvController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IAiEngineService _aiEngineService;

        public CvController(ApplicationDbContext context, IAiEngineService aiEngineService)
        {
            _context = context;
            _aiEngineService = aiEngineService;
        }

        private Guid CurrentUserId =>
            Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : Guid.Empty;

        /// <summary>
        /// POST /api/cv/generate — Sinh CV tối ưu từ AI
        /// Gom thông tin sinh viên từ DB (Users, Students, Majors, Subjects, Projects, Certificates)
        /// rồi gọi FastAPI AI-Engine và lưu kết quả vào SQL Server.
        /// </summary>
        [HttpPost("generate")]
        public async Task<IActionResult> GenerateCv([FromBody] GenerateCvClientRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.JobDescription))
            {
                return BadRequest(new { message = "Nội dung Job Description không được để trống." });
            }

            // 1. Xác định sinh viên từ Token JWT hoặc StudentId truyền lên
            Guid targetStudentId = Guid.Empty;

            if (request.StudentId.HasValue && request.StudentId.Value != Guid.Empty)
            {
                targetStudentId = request.StudentId.Value;
            }
            else
            {
                var ownStudent = await _context.Students.AsNoTracking()
                    .FirstOrDefaultAsync(s => s.UserId == CurrentUserId && !s.IsDeleted);

                if (ownStudent != null)
                {
                    targetStudentId = ownStudent.Id;
                }
            }

            if (targetStudentId == Guid.Empty)
            {
                return NotFound(new { message = "Không tìm thấy hồ sơ sinh viên trong hệ thống." });
            }

            // 2. Kéo Profile từ DB
            var studentProfile = await (
                from st in _context.Students.AsNoTracking()
                join us in _context.Users.AsNoTracking() on st.UserId equals us.Id
                join mj in _context.Majors.AsNoTracking() on st.MajorId equals mj.Id
                where st.Id == targetStudentId && !st.IsDeleted
                select new
                {
                    st.Id,
                    us.FullName,
                    Email = st.Email ?? us.UserName,
                    us.Mobile,
                    st.GithubUrl,
                    MajorName = mj.Name,
                }
            ).FirstOrDefaultAsync();

            if (studentProfile == null)
            {
                return NotFound(new { message = "Không tìm thấy thông tin sinh viên." });
            }

            // 3. Kéo Môn học + Điểm
            var courseworkList = await (
                from er in _context.ExamResults.AsNoTracking()
                join ste in _context.SubjectTeachingExams.AsNoTracking() on er.SubjectTeachingExamId equals ste.Id
                join sth in _context.SubjectTeachings.AsNoTracking() on ste.SubjectTeachingId equals sth.Id
                join sub in _context.Subjects.AsNoTracking() on sth.SubjectId equals sub.Id
                where er.StudentId == targetStudentId && !er.IsDeleted && er.Result.HasValue
                select new CourseworkInputDto
                {
                    SubjectName = sub.Name,
                    Score = (float)(er.Result ?? 0.0)
                }
            ).ToListAsync();

            // 4. Kéo Đồ án (Projects)
            var projectsList = await _context.Projects.AsNoTracking()
                .Where(p => p.StudentId == targetStudentId && !p.IsDeleted)
                .Select(p => new ProjectInputDto
                {
                    Id = p.Id.ToString(),
                    Name = p.ProjectName,
                    Role = p.Role ?? "Thành viên",
                    Technologies = p.Technologies ?? "",
                    Description = p.Description ?? "",
                    GitUrl = p.GitUrl,
                    DemoUrl = p.DemoUrl
                }).ToListAsync();

            // 5. Kéo Chứng chỉ (Certificates)
            var certsList = await _context.Certificates.AsNoTracking()
                .Where(c => c.StudentId == targetStudentId && !c.IsDeleted)
                .Select(c => new CertificateInputDto
                {
                    Name = c.CertificateName,
                    Issuer = c.Issuer ?? "",
                    Year = c.IssueDate.HasValue ? c.IssueDate.GetValueOrDefault().Year.ToString() : ""
                }).ToListAsync();

            // Tính GPA động từ điểm thi các môn
            var avgScore = courseworkList.Count > 0 ? courseworkList.Average(c => c.Score) : 8.0f;
            var gpa4Scale = (avgScore / 10.0f) * 4.0f;
            var gpaString = $"{gpa4Scale:F2}/4.0";

            // 6. Gom Payload gửi sang FastAPI
            var aiRequest = new AiEngineCvRequestDto
            {
                JobDescription = request.JobDescription,
                JobTitle = request.TargetRole,
                AcademicContext = new StudentAcademicContextDto
                {
                    StudentId = targetStudentId.ToString(),
                    FullName = studentProfile.FullName,
                    Major = studentProfile.MajorName,
                    Gpa = gpaString,
                    Coursework = courseworkList,
                    Projects = projectsList,
                    Certificates = certsList
                }
            };

            // 7. Gọi FastAPI AI Engine
            var aiResponse = await _aiEngineService.GenerateCvAsync(aiRequest);

            // Ghi đè thông tin liên hệ thực tế của sinh viên vào kết quả AI
            if (aiResponse?.CvData?.PersonalInfo != null)
            {
                if (!string.IsNullOrWhiteSpace(studentProfile.FullName))
                    aiResponse.CvData.PersonalInfo.FullName = studentProfile.FullName;

                if (!string.IsNullOrWhiteSpace(studentProfile.Email))
                    aiResponse.CvData.PersonalInfo.Email = studentProfile.Email;

                if (!string.IsNullOrWhiteSpace(studentProfile.Mobile))
                    aiResponse.CvData.PersonalInfo.Phone = studentProfile.Mobile;

                if (!string.IsNullOrWhiteSpace(studentProfile.GithubUrl))
                    aiResponse.CvData.PersonalInfo.Github = studentProfile.GithubUrl;

                // Xóa LinkedIn khỏi CV output
                aiResponse.CvData.PersonalInfo.Linkedin = null;
            }

            // 8. Trả kết quả JSON xem trước về cho Frontend (Không tự động lưu vào DB)
            return Ok(aiResponse);
        }

        /// <summary>
        /// POST /api/cv/save — Lưu bản CV chủ động từ người dùng vào Lịch sử ứng tuyển (SQL Server)
        /// </summary>
        [HttpPost("save")]
        public async Task<IActionResult> SaveCv([FromBody] SaveCvRequestDto request)
        {
            var ownStudent = await _context.Students.AsNoTracking()
                .FirstOrDefaultAsync(s => s.UserId == CurrentUserId && !s.IsDeleted);

            if (ownStudent == null)
            {
                return NotFound(new { message = "Không tìm thấy hồ sơ sinh viên." });
            }

            var jsonOptions = new JsonSerializerOptions { WriteIndented = false };
            var cvJson = JsonSerializer.Serialize(request.CvData, jsonOptions);

            var generatedCvRecord = new GeneratedCVs
            {
                Id = Guid.NewGuid(),
                StudentId = ownStudent.Id,
                JobTitle = request.TargetRole ?? "Vị trí ứng tuyển",
                RawJobDescription = request.JobDescription ?? "",
                MatchScore = request.MatchScore > 0 ? request.MatchScore : 85,
                CvDataJson = cvJson,
                IsFallback = false,
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            };

            _context.GeneratedCVs.Add(generatedCvRecord);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Đã lưu CV vào lịch sử thành công.",
                id = generatedCvRecord.Id,
                createdAt = generatedCvRecord.CreatedAt
            });
        }

        /// <summary>
        /// DELETE /api/cv/{id} — Xóa bản CV khỏi lịch sử (Soft delete)
        /// </summary>
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteCv(Guid id)
        {
            var record = await _context.GeneratedCVs
                .FirstOrDefaultAsync(cv => cv.Id == id && !cv.IsDeleted);

            if (record == null) return NotFound(new { message = "Không tìm thấy bản CV." });

            record.IsDeleted = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa bản CV thành công." });
        }

        /// <summary>
        /// GET /api/cv — Lấy danh sách lịch sử CV đã tạo của sinh viên
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetHistory([FromQuery] Guid? studentId)
        {
            var ownStudent = await _context.Students.AsNoTracking()
                .FirstOrDefaultAsync(s => s.UserId == CurrentUserId && !s.IsDeleted);

            var targetId = studentId ?? ownStudent?.Id;
            if (!targetId.HasValue) return Ok(Array.Empty<object>());

            var history = await _context.GeneratedCVs.AsNoTracking()
                .Where(cv => cv.StudentId == targetId.Value && !cv.IsDeleted)
                .OrderByDescending(cv => cv.CreatedAt)
                .Select(cv => new
                {
                    cv.Id,
                    cv.StudentId,
                    cv.JobTitle,
                    cv.MatchScore,
                    cv.IsFallback,
                    cv.CreatedAt
                })
                .ToListAsync();

            return Ok(history);
        }

        /// <summary>
        /// GET /api/cv/{id} — Đọc chi tiết 1 bản CV cũ từ DB (không tốn token sinh lại)
        /// </summary>
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var record = await _context.GeneratedCVs.AsNoTracking()
                .FirstOrDefaultAsync(cv => cv.Id == id && !cv.IsDeleted);

            if (record == null) return NotFound(new { message = "Không tìm thấy CV." });

            var cvResponse = JsonSerializer.Deserialize<AiEngineCvResponseDto>(record.CvDataJson);
            return Ok(cvResponse);
        }

        /// <summary>
        /// POST /api/cv/parse-jd-file — Upload file PDF/DOCX/TXT, trích xuất plaintext JD
        /// Forward file tới AI-Engine /api/v1/extract-jd-text
        /// </summary>
        [HttpPost("parse-jd-file")]
        public async Task<IActionResult> ParseJdFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "File không được để trống." });
            }

            // Giới hạn 5MB
            if (file.Length > 5 * 1024 * 1024)
            {
                return BadRequest(new { message = "File vượt quá giới hạn 5MB." });
            }

            // Kiểm tra extension
            var allowedExtensions = new[] { ".pdf", ".docx", ".doc", ".txt" };
            var ext = Path.GetExtension(file.FileName)?.ToLowerInvariant();
            if (string.IsNullOrEmpty(ext) || !allowedExtensions.Contains(ext))
            {
                return BadRequest(new { message = $"Định dạng file '{ext}' không được hỗ trợ. Chỉ hỗ trợ: {string.Join(", ", allowedExtensions)}" });
            }

            try
            {
                var result = await _aiEngineService.ExtractJdTextAsync(file);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi xử lý file: {ex.Message}" });
            }
        }
    }
}
