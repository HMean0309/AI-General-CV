using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TayDoApi.Data;
using TayDoApi.DTOs;
using TayDoApi.Services;

namespace TayDoApi.Controllers
{
    /// <summary>
    /// Gom dữ liệu từ nhiều bảng nghiệp vụ để dựng CV cho một sinh viên: thông tin cá nhân,
    /// kết quả học tập theo môn, và điểm đánh giá theo tiêu chí PLO — toàn bộ mã GUID được
    /// chuyển đổi tường minh sang tên/giá trị thật thông qua LINQ JOIN, không trả GUID thô cho client.
    ///
    /// Bảng trục chính theo yêu cầu: Students, Users, Majors, ExamResults, Subjects,
    /// StudentEvaluationDetails, EvaluationCriterias.
    ///
    /// Bảng cầu nối bắt buộc theo đúng schema gốc (không có FK trực tiếp giữa các bảng trục):
    /// - ExamResults -> SubjectTeachingExams -> SubjectTeachings -> Subjects (lấy tên môn học)
    /// - StudentEvaluationDetails -> StudentEvaluations -> Students (StudentEvaluationDetails
    ///   không có StudentId trực tiếp, phải qua StudentEvaluations mới biết thuộc sinh viên nào)
    /// </summary>
    [ApiController]
    [Route("api/cv-generation")]
    [Authorize]
    public class CvGenerationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ICvAiService _cvAiService;

        public CvGenerationController(ApplicationDbContext context, ICvAiService cvAiService)
        {
            _context = context;
            _cvAiService = cvAiService;
        }

        // GET api/cv-generation/{studentId}
        [HttpGet("{studentId:guid}")]
        public async Task<ActionResult<StudentCvDataDto>> GenerateCvData(Guid studentId)
        {
            // ----- 1) Thông tin cá nhân: Students JOIN Users JOIN Majors -----
            var profile = await (
                from st in _context.Students.AsNoTracking()
                join us in _context.Users.AsNoTracking() on st.UserId equals us.Id
                join mj in _context.Majors.AsNoTracking() on st.MajorId equals mj.Id
                where st.Id == studentId && !st.IsDeleted
                select new StudentCvDataDto
                {
                    StudentId = st.Id,
                    FullName = us.FullName,
                    UserName = us.UserName,
                    Mobile = us.Mobile,
                    BirthDate = us.BirthDate,
                    Gender = st.Gender,
                    Hometown = st.Hometown,
                    MajorName = mj.Name,
                    MajorCode = mj.Code,
                }
            ).FirstOrDefaultAsync();

            if (profile == null)
                return NotFound($"Không tìm thấy sinh viên với Id = {studentId}");

            // ----- 2) Kết quả học tập: ExamResults JOIN SubjectTeachingExams JOIN SubjectTeachings JOIN Subjects -----
            // (2 bảng cầu nối SubjectTeachingExams/SubjectTeachings là bắt buộc vì ExamResults
            //  không lưu SubjectId trực tiếp trong schema gốc)
            profile.SubjectResults = await (
                from er in _context.ExamResults.AsNoTracking()
                join ste in _context.SubjectTeachingExams.AsNoTracking() on er.SubjectTeachingExamId equals ste.Id
                join sth in _context.SubjectTeachings.AsNoTracking() on ste.SubjectTeachingId equals sth.Id
                join sub in _context.Subjects.AsNoTracking() on sth.SubjectId equals sub.Id
                where er.StudentId == studentId && !er.IsDeleted
                orderby sub.Name
                select new SubjectResultDto
                {
                    SubjectCode = sub.SubjectCode,
                    SubjectName = sub.Name,
                    CreditPoint = sub.CreditPoint,
                    Result = er.Result,
                    CombinedResult = er.CombinedResult,
                }
            ).ToListAsync();

            // ----- 3) Điểm PLO: StudentEvaluationDetails JOIN StudentEvaluations (cầu nối) JOIN EvaluationCriterias -----
            // Dùng LEFT JOIN với EvaluationCriterias vì EvaluationCriteriaId trong
            // StudentEvaluationDetails được khai báo NULLABLE trong schema gốc.
            profile.PloScores = await (
                from sed in _context.StudentEvaluationDetails.AsNoTracking()
                join se in _context.StudentEvaluations.AsNoTracking() on sed.StudentEvaluationId equals se.Id
                join ec in _context.EvaluationCriterias.AsNoTracking() on sed.EvaluationCriteriaId equals ec.Id into ecJoin
                from ec in ecJoin.DefaultIfEmpty()
                where se.StudentId == studentId && !sed.IsDeleted
                select new PloScoreDto
                {
                    CriteriaId = sed.EvaluationCriteriaId,
                    // Tên tiêu chí PLO: ưu tiên lấy từ EvaluationCriterias.Name (nguồn chuẩn),
                    // nếu không khớp được (dữ liệu cũ/thiếu) thì fallback về EvaluationName lưu sẵn trong chi tiết đánh giá
                    CriteriaName = ec != null ? ec.Name : sed.EvaluationName ?? "(Không xác định)",
                    Description = ec != null ? ec.Description : null,
                    StudentScore = sed.StudentScore,
                    MaxScore = ec != null ? ec.Score : sed.Score,
                }
            ).ToListAsync();

            return Ok(profile);
        }

        // GET api/cv-generation/{studentId}/ai-suggestions
        // Trả về gợi ý AI cho CV — hiện dùng MockCvAiService (xem Services/MockCvAiService.cs).
        // Khi tích hợp AI thật, chỉ cần đổi đăng ký DI của ICvAiService trong Program.cs.
        [HttpGet("{studentId:guid}/ai-suggestions")]
        public async Task<ActionResult<CvAiSuggestionDto>> GetAiSuggestions(Guid studentId)
        {
            var cvDataResult = await GenerateCvData(studentId);
            if (cvDataResult.Result is NotFoundObjectResult notFound)
                return NotFound(notFound.Value);

            var cvData = ((OkObjectResult)cvDataResult.Result!).Value as StudentCvDataDto;
            var suggestions = await _cvAiService.GenerateSuggestionsAsync(cvData!);
            return Ok(suggestions);
        }
    }
}
