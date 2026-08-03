using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TayDoApi.Authorization;
using TayDoApi.Data;
using TayDoApi.DTOs;
using TayDoApi.Models;

namespace TayDoApi.Controllers
{
    /// <summary>
    /// CRUD cho Chứng chỉ (Certificates) của sinh viên. Quyền: Admin/Teacher không giới hạn;
    /// Student chỉ xem/tạo/sửa/xóa được chứng chỉ của chính mình, theo đúng pattern đã áp
    /// dụng cho UserCvsController/ProjectsController.
    /// </summary>
    [ApiController]
    [Route("api/certificates")]
    [Authorize]
    public class CertificatesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CertificatesController(ApplicationDbContext context)
        {
            _context = context;
        }

        private Guid CurrentUserId =>
            Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : Guid.Empty;

        private async Task<bool> CanModifyAsync(Guid certificateStudentId)
        {
            if (User.IsInRole(Roles.Admin) || User.IsInRole(Roles.Teacher))
                return true;

            var ownStudent = await _context.Students.AsNoTracking()
                .FirstOrDefaultAsync(s => s.UserId == CurrentUserId && !s.IsDeleted);

            return ownStudent != null && ownStudent.Id == certificateStudentId;
        }

        // GET api/certificates?studentId=&page=&pageSize=
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CertificateDto>>> GetAll(
            [FromQuery] Guid? studentId, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 500) pageSize = 50;

            var query = _context.Certificates.AsNoTracking().Where(c => !c.IsDeleted);

            if (User.IsInRole(Roles.Student))
            {
                var ownStudent = await _context.Students.AsNoTracking()
                    .FirstOrDefaultAsync(s => s.UserId == CurrentUserId && !s.IsDeleted);
                if (ownStudent == null) return Ok(Array.Empty<CertificateDto>());
                query = query.Where(c => c.StudentId == ownStudent.Id);
            }
            else if (studentId.HasValue)
            {
                query = query.Where(c => c.StudentId == studentId.Value);
            }

            var total = await query.CountAsync();
            var items = await query.OrderByDescending(c => c.CreationDate)
                .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

            Response.Headers["X-Total-Count"] = total.ToString();
            Response.Headers["X-Page"] = page.ToString();
            Response.Headers["X-Page-Size"] = pageSize.ToString();

            return Ok(items.Select(ToDto));
        }

        // GET api/certificates/{id}
        [HttpGet("{id:guid}")]
        public async Task<ActionResult<CertificateDto>> GetById(Guid id)
        {
            var cert = await _context.Certificates.AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);
            if (cert == null) return NotFound();

            if (!await CanModifyAsync(cert.StudentId)) return Forbid();

            return Ok(ToDto(cert));
        }

        // POST api/certificates
        [HttpPost]
        public async Task<ActionResult<CertificateDto>> Create([FromBody] CertificateCreateDto dto)
        {
            if (User.IsInRole(Roles.Student))
            {
                var ownStudent = await _context.Students.AsNoTracking()
                    .FirstOrDefaultAsync(s => s.UserId == CurrentUserId && !s.IsDeleted);
                if (ownStudent == null || ownStudent.Id != dto.StudentId)
                    return Forbid();
            }

            var studentExists = await _context.Students.AnyAsync(s => s.Id == dto.StudentId && !s.IsDeleted);
            if (!studentExists) return BadRequest($"Không tìm thấy sinh viên với Id = {dto.StudentId}");

            var cert = new Certificates
            {
                Id = Guid.NewGuid(),
                StudentId = dto.StudentId,
                CertificateName = dto.CertificateName,
                Issuer = dto.Issuer,
                IssueDate = dto.IssueDate,
                CertificateUrl = dto.CertificateUrl,
                CreationDate = DateTime.UtcNow,
                IsDeleted = false,
            };

            _context.Certificates.Add(cert);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = cert.Id }, ToDto(cert));
        }

        // PUT api/certificates/{id}
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CertificateUpdateDto dto)
        {
            var cert = await _context.Certificates.FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);
            if (cert == null) return NotFound();

            if (!await CanModifyAsync(cert.StudentId)) return Forbid();

            cert.CertificateName = dto.CertificateName;
            cert.Issuer = dto.Issuer;
            cert.IssueDate = dto.IssueDate;
            cert.CertificateUrl = dto.CertificateUrl;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE api/certificates/{id}  (xóa mềm)
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var cert = await _context.Certificates.FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);
            if (cert == null) return NotFound();

            if (!await CanModifyAsync(cert.StudentId)) return Forbid();

            cert.IsDeleted = true;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private static CertificateDto ToDto(Certificates c) => new()
        {
            Id = c.Id,
            StudentId = c.StudentId,
            CertificateName = c.CertificateName,
            Issuer = c.Issuer,
            IssueDate = c.IssueDate,
            CertificateUrl = c.CertificateUrl,
            CreationDate = c.CreationDate,
        };
    }
}