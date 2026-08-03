using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TayDoApi.Authorization;
using TayDoApi.Common;
using TayDoApi.Data;
using TayDoApi.DTOs;
using TayDoApi.Models;

namespace TayDoApi.Controllers
{
    [ApiController]
    [Route("api/user-cvs")]
    [Authorize]
    public class UserCvsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UserCvsController(ApplicationDbContext context)
        {
            _context = context;
        }

        private Guid CurrentUserId =>
            Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : Guid.Empty;


        private async Task<bool> CanModifyAsync(Guid cvStudentId)
        {
            if (User.IsInRole(Roles.Admin) || User.IsInRole(Roles.Teacher))
                return true;

            var ownStudent = await _context.Students.AsNoTracking()
                .FirstOrDefaultAsync(s => s.UserId == CurrentUserId && !s.IsDeleted);

            return ownStudent != null && ownStudent.Id == cvStudentId;
        }

        // GET api/user-cvs?studentId=&page=&pageSize=
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserCvs>>> GetAll(
            [FromQuery] Guid? studentId, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 500) pageSize = 50;

            var query = _context.UserCvs.AsNoTracking().Where(c => !c.IsDeleted);

            if (User.IsInRole(Roles.Student))
            {
                var ownStudent = await _context.Students.AsNoTracking()
                    .FirstOrDefaultAsync(s => s.UserId == CurrentUserId && !s.IsDeleted);

                if (ownStudent == null)
                    return Ok(Array.Empty<UserCvs>()); // tài khoản chưa gắn hồ sơ Student nào

                query = query.Where(c => c.StudentId == ownStudent.Id);
            }
            else if (studentId.HasValue)
            {
                query = query.Where(c => c.StudentId == studentId.Value);
            }

            var total = await query.CountAsync();
            var items = await query
                .OrderByDescending(c => c.UploadDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            Response.Headers["X-Total-Count"] = total.ToString();
            Response.Headers["X-Page"] = page.ToString();
            Response.Headers["X-Page-Size"] = pageSize.ToString();

            return Ok(items);
        }

        // GET api/user-cvs/{id}
        [HttpGet("{id:guid}")]
        public async Task<ActionResult<UserCvs>> GetById(Guid id)
        {
            var cv = await _context.UserCvs.AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);
            if (cv == null) return NotFound();

            if (!await CanModifyAsync(cv.StudentId)) // tái dùng: cùng quy tắc sở hữu áp cho cả xem chi tiết
            return Forbid();

            return Ok(cv);
        }

        // POST api/user-cvs
        [HttpPost]
        public async Task<ActionResult<UserCvs>> Create([FromBody] UserCvsCreateDto dto)
        {
            var studentExists = await _context.Students.AnyAsync(s => s.Id == dto.StudentId && !s.IsDeleted);
            if (!studentExists)
                return BadRequest($"Không tìm thấy sinh viên với Id = {dto.StudentId}");
            if (User.IsInRole(Roles.Student))
            {
                var ownStudent = await _context.Students.AsNoTracking()
                    .FirstOrDefaultAsync(s => s.UserId == CurrentUserId && !s.IsDeleted);

                if (ownStudent == null || ownStudent.Id != dto.StudentId)
                    return Forbid(); // student không được tạo CV gán cho người khác
            }

            var cv = new UserCvs
            {
                Id = Guid.NewGuid(),
                StudentId = dto.StudentId,
                FileName = dto.FileName,
                FileUrl = dto.FileUrl,
                Description = dto.Description,
                UploadDate = DateTime.UtcNow,
                IsDeleted = false,
            };

            _context.UserCvs.Add(cv);
            await _context.SaveChangesAsync();
            await LogAuditAsync(AuditActions.Create, cv.Id, $"Tạo CV mới: \"{cv.FileName}\" cho sinh viên {cv.StudentId}");

            return CreatedAtAction(nameof(GetById), new { id = cv.Id }, cv);
        }

        // PUT api/user-cvs/{id}  — cập nhật, tự động ghi vết sửa (diff các trường thay đổi) vào AuditLogs
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UserCvsUpdateDto dto)
        {
            var cv = await _context.UserCvs.FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);
            if (cv == null) return NotFound();

            if (!await CanModifyAsync(cv.StudentId))
                return Forbid();

            var changes = new List<string>();
            if (cv.FileName != dto.FileName)
                changes.Add($"FileName: \"{cv.FileName}\" → \"{dto.FileName}\"");
            if (cv.FileUrl != dto.FileUrl)
                changes.Add("FileUrl đã thay đổi");
            if (cv.Description != dto.Description)
                changes.Add("Description đã thay đổi");

            if (changes.Count == 0)
                return NoContent(); // không có gì thay đổi, không cần ghi vết

            cv.FileName = dto.FileName;
            cv.FileUrl = dto.FileUrl;
            cv.Description = dto.Description;

            await _context.SaveChangesAsync();
            await LogAuditAsync(AuditActions.Update, cv.Id, string.Join("; ", changes));

            return NoContent();
        }

        // DELETE api/user-cvs/{id}  — xóa mềm, có ghi vết
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var cv = await _context.UserCvs.FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);
            if (cv == null) return NotFound();

            if (!await CanModifyAsync(cv.StudentId))
                return Forbid();

            cv.IsDeleted = true;
            await _context.SaveChangesAsync();
            await LogAuditAsync(AuditActions.Delete, cv.Id, $"Xóa mềm CV: \"{cv.FileName}\"");

            return NoContent();
        }

        // POST api/user-cvs/{id}/duplicate  — nhân bản một CV đã có thành bản ghi mới
        [HttpPost("{id:guid}/duplicate")]
        public async Task<ActionResult<UserCvs>> Duplicate(Guid id)
        {
            var source = await _context.UserCvs.AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);
            if (source == null) return NotFound();
            if (!await CanModifyAsync(source.StudentId))
                return Forbid();

            var clone = new UserCvs
            {
                Id = Guid.NewGuid(),
                StudentId = source.StudentId,
                FileName = $"{source.FileName} (Copy)",
                FileUrl = source.FileUrl,
                Description = source.Description,
                UploadDate = DateTime.UtcNow,
                IsDeleted = false,
            };

            _context.UserCvs.Add(clone);
            await _context.SaveChangesAsync();
            await LogAuditAsync(AuditActions.Duplicate, clone.Id, $"Nhân bản từ CV gốc {source.Id}");

            return CreatedAtAction(nameof(GetById), new { id = clone.Id }, clone);
        }


        private async Task LogAuditAsync(int action, Guid recordId, string details)
        {
            _context.AuditLogs.Add(new AuditLogs
            {
                Id = Guid.NewGuid(),
                Action = action,
                Details = details,
                RecordId = recordId,
                CreationDate = DateTime.UtcNow,
                UserId = CurrentUserId,
                RecordEntity = AuditRecordEntities.UserCvs,
                RecordDesc = "UserCvs",
                IsDeleted = false,
            });
            await _context.SaveChangesAsync();
        }
    }
}
