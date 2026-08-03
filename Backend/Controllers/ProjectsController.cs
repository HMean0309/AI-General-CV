using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TayDoApi.Data;
using TayDoApi.DTOs;
using TayDoApi.Models;

namespace TayDoApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProjectsController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Lấy danh sách đồ án của 1 sinh viên theo StudentId
        /// </summary>
        [HttpGet("student/{studentId}")]
        public async Task<IActionResult> GetByStudentId(Guid studentId)
        {
            var projects = await _context.Projects
                .Where(p => p.StudentId == studentId && !p.IsDeleted)
                .OrderByDescending(p => p.CreationDate)
                .ToListAsync();

            var dtos = projects.Select(p => MapToDto(p)).ToList();
            return Ok(dtos);
        }

        /// <summary>
        /// Lấy chi tiết 1 đồ án
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);
            if (project == null) return NotFound(new { message = "Không tìm thấy đồ án." });

            return Ok(MapToDto(project));
        }

        /// <summary>
        /// Thêm mới 1 đồ án
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ProjectCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var project = new Projects
            {
                Id = Guid.NewGuid(),
                StudentId = dto.StudentId,
                ProjectName = dto.ProjectName,
                Description = dto.Description,
                Role = dto.Role,
                Technologies = dto.Technologies != null ? string.Join(", ", dto.Technologies) : null,
                GitUrl = dto.GitUrl,
                DemoUrl = dto.DemoUrl,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                CreationDate = DateTime.UtcNow,
                IsDeleted = false
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = project.Id }, MapToDto(project));
        }

        /// <summary>
        /// Cập nhật đồ án
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] ProjectUpdateDto dto)
        {
            var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);
            if (project == null) return NotFound(new { message = "Không tìm thấy đồ án." });

            project.ProjectName = dto.ProjectName;
            project.Description = dto.Description;
            project.Role = dto.Role;
            project.Technologies = dto.Technologies != null ? string.Join(", ", dto.Technologies) : null;
            project.GitUrl = dto.GitUrl;
            project.DemoUrl = dto.DemoUrl;
            project.StartDate = dto.StartDate;
            project.EndDate = dto.EndDate;

            await _context.SaveChangesAsync();
            return Ok(MapToDto(project));
        }

        /// <summary>
        /// Xóa (Soft Delete) 1 đồ án
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);
            if (project == null) return NotFound(new { message = "Không tìm thấy đồ án." });

            project.IsDeleted = true;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Xóa đồ án thành công." });
        }

        private static ProjectDto MapToDto(Projects p)
        {
            return new ProjectDto
            {
                Id = p.Id,
                StudentId = p.StudentId,
                ProjectName = p.ProjectName,
                Description = p.Description,
                Role = p.Role,
                Technologies = !string.IsNullOrEmpty(p.Technologies) 
                    ? p.Technologies.Split(", ", StringSplitOptions.RemoveEmptyEntries).ToList() 
                    : new List<string>(),
                GitUrl = p.GitUrl,
                DemoUrl = p.DemoUrl,
                StartDate = p.StartDate,
                EndDate = p.EndDate,
                CreationDate = p.CreationDate
            };
        }
    }
}