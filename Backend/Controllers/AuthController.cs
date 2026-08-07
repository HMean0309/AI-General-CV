using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TayDoApi.Data;
using TayDoApi.DTOs;
using TayDoApi.Services;

namespace TayDoApi.Controllers
{
    [ApiController]
    [Route("api/auth")]
    [Authorize]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly PasswordHasher _passwordHasher;
        private readonly TokenService _tokenService;

        public AuthController(ApplicationDbContext context, PasswordHasher passwordHasher, TokenService tokenService)
        {
            _context = context;
            _passwordHasher = passwordHasher;
            _tokenService = tokenService;
        }

        // POST api/auth/login
        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.UserName == dto.UserName && !u.IsDeleted);

            if (user == null || !user.IsActived)
                return Unauthorized("Sai tài khoản hoặc mật khẩu.");

            if (!_passwordHasher.VerifyPassword(dto.Password, user.PasswordHash, user.PasswordSalt))
                return Unauthorized("Sai tài khoản hoặc mật khẩu.");

            var (token, expiresAt) = _tokenService.CreateToken(user);

            return Ok(new AuthResponseDto
            {
                Token = token,
                ExpiresAt = expiresAt,
                User = MapToDto(user)
            });
        }

        // POST api/auth/bootstrap-admin
        // Cho phép tạo user mới KHÔNG CẦN đăng nhập, miễn UserName chưa tồn tại.
        // Dùng để tạo tài khoản admin đầu tiên bên cạnh dữ liệu cũ đã restore từ TayDoV2.bak
        // (các tài khoản cũ không đăng nhập được do khác thuật toán hash mật khẩu).
        // CẢNH BÁO BẢO MẬT: vì endpoint này KHÔNG yêu cầu xác thực, sau khi đã tạo xong tài khoản
        // admin đầu tiên, bạn NÊN xóa hẳn action này (hoặc comment lại) trước khi triển khai thật,
        // nếu không bất kỳ ai cũng có thể gọi endpoint này để tự tạo tài khoản.
        [HttpPost("bootstrap-admin")]
        [AllowAnonymous]
        public async Task<ActionResult<UserDto>> BootstrapAdmin([FromBody] UserCreateDto dto)
        {
            if (await _context.Users.AnyAsync(u => !u.IsDeleted))
                return StatusCode(403, "Tính năng khởi tạo tự do đã bị khóa vì hệ thống đã có tài khoản người dùng. Vui lòng đăng nhập quản trị viên để tạo tài khoản mới.");

            if (await _context.Users.AnyAsync(u => u.UserName == dto.UserName))
                return StatusCode(403, "UserName này đã tồn tại.");

            var (hash, salt) = _passwordHasher.HashPassword(dto.Password);
            var user = new Models.Users
            {
                Id = Guid.NewGuid(),
                UserName = dto.UserName,
                PasswordHash = hash,
                PasswordSalt = salt,
                FullName = dto.FullName,
                UserInternalId = dto.UserInternalId,
                Mobile = dto.Mobile,
                Role = dto.Role,
                IsActived = true,
                IsDeleted = false
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(MapToDto(user));
        }

        // POST api/auth/change-password  (yêu cầu đã đăng nhập)
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userId == null || !Guid.TryParse(userId, out var id))
                return Unauthorized();

            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            if (!_passwordHasher.VerifyPassword(dto.CurrentPassword, user.PasswordHash, user.PasswordSalt))
                return BadRequest("Mật khẩu hiện tại không đúng.");

            var (hash, salt) = _passwordHasher.HashPassword(dto.NewPassword);
            user.PasswordHash = hash;
            user.PasswordSalt = salt;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private static UserDto MapToDto(Models.Users u) => new()
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

    public class ChangePasswordDto
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}
