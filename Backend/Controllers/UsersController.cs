using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TayDoApi.Authorization;
using TayDoApi.Data;
using TayDoApi.DTOs;
using TayDoApi.Models;
using TayDoApi.Services;

namespace TayDoApi.Controllers
{

    [ApiController]
    [Route("api/users")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly PasswordHasher _passwordHasher;

        public UsersController(ApplicationDbContext context, PasswordHasher passwordHasher)
        {
            _context = context;
            _passwordHasher = passwordHasher;
        }

        private Guid? CurrentUserId =>
            Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : null;

        // GET api/users?page=1&pageSize=50   (chỉ Admin/Teacher được liệt kê toàn bộ)
        [HttpGet]
        [Authorize(Roles = Roles.Admin + "," + Roles.Teacher)]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 500) pageSize = 50;

            var query = _context.Users.AsNoTracking();
            var total = await query.CountAsync();
            var items = await query.Skip((page - 1) * pageSize).Take(pageSize)
                .Select(u => ToDto(u))
                .ToListAsync();

            Response.Headers["X-Total-Count"] = total.ToString();
            Response.Headers["X-Page"] = page.ToString();
            Response.Headers["X-Page-Size"] = pageSize.ToString();

            return Ok(items);
        }

        // GET api/users/{id}   (Admin/Teacher xem ai cũng được; user thường chỉ xem chính mình)
        [HttpGet("{id:guid}")]
        public async Task<ActionResult<UserDto>> GetById(Guid id)
        {
            var isAdminOrTeacher = User.IsInRole(Roles.Admin) || User.IsInRole(Roles.Teacher);
            if (!isAdminOrTeacher && CurrentUserId != id)
                return Forbid();

            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();
            return Ok(ToDto(user));
        }

        // POST api/users  (tạo user mới, server tự hash mật khẩu) - chỉ Admin
        [HttpPost]
        [Authorize(Roles = Roles.Admin)]
        public async Task<ActionResult<UserDto>> Create([FromBody] UserCreateDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.UserName == dto.UserName))
                return Conflict("UserName đã tồn tại.");

            var (hash, salt) = _passwordHasher.HashPassword(dto.Password);

            var user = new Users
            {
                Id = Guid.NewGuid(),
                UserName = dto.UserName,
                PasswordHash = hash,
                PasswordSalt = salt,
                FullName = dto.FullName,
                BirthDate = dto.BirthDate,
                IdentificationDate = dto.IdentificationDate,
                IdentificationNumber = dto.IdentificationNumber,
                UserInternalId = dto.UserInternalId,
                Mobile = dto.Mobile,
                ProfilePicUrl = dto.ProfilePicUrl,
                Role = dto.Role,
                IsActived = true,
                IsDeleted = false
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = user.Id }, ToDto(user));
        }

        // PUT api/users/{id}  (Password để trống nếu không đổi) - Admin hoặc chính user
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UserUpdateDto dto)
        {
            var isAdmin = User.IsInRole(Roles.Admin);
            if (!isAdmin && CurrentUserId != id) return Forbid();

            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            user.UserName = dto.UserName;
            user.FullName = dto.FullName;
            user.BirthDate = dto.BirthDate;
            user.IdentificationDate = dto.IdentificationDate;
            user.IdentificationNumber = dto.IdentificationNumber;
            user.UserInternalId = dto.UserInternalId;
            user.Mobile = dto.Mobile;
            user.ProfilePicUrl = dto.ProfilePicUrl;
            user.Role = dto.Role;
            user.IsActived = dto.IsActived;

            if (!string.IsNullOrWhiteSpace(dto.Password))
            {
                var (hash, salt) = _passwordHasher.HashPassword(dto.Password);
                user.PasswordHash = hash;
                user.PasswordSalt = salt;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE api/users/{id}  (xóa mềm) - chỉ Admin
        [HttpDelete("{id:guid}")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> Delete(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            user.IsDeleted = true;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private static UserDto ToDto(Users u) => new()
        {
            Id = u.Id,
            UserName = u.UserName,
            FullName = u.FullName,
            BirthDate = u.BirthDate,
            IdentificationDate = u.IdentificationDate,
            IdentificationNumber = u.IdentificationNumber,
            UserInternalId = u.UserInternalId,
            Mobile = u.Mobile,
            ProfilePicUrl = u.ProfilePicUrl,
            Role = u.Role,
            IsActived = u.IsActived,
            LastEnforceAnnouncementRead = u.LastEnforceAnnouncementRead,
            IsDeleted = u.IsDeleted
        };
    }
}
