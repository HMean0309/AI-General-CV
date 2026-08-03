namespace TayDoApi.DTOs
{
    /// <summary>Dữ liệu Users trả về cho client - KHÔNG chứa PasswordHash/PasswordSalt.</summary>
    public class UserDto
    {
        public Guid Id { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public DateTime? BirthDate { get; set; }
        public DateTime? IdentificationDate { get; set; }
        public string? IdentificationNumber { get; set; }
        public string UserInternalId { get; set; } = string.Empty;
        public string? Mobile { get; set; }
        public string? ProfilePicUrl { get; set; }
        public int Role { get; set; }
        public bool IsActived { get; set; }
        public DateTime? LastEnforceAnnouncementRead { get; set; }
        public bool IsDeleted { get; set; }
    }

    /// <summary>Dữ liệu client gửi lên để tạo Users mới (kèm mật khẩu dạng plain text, server sẽ tự hash).</summary>
    public class UserCreateDto
    {
        public string UserName { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public DateTime? BirthDate { get; set; }
        public DateTime? IdentificationDate { get; set; }
        public string? IdentificationNumber { get; set; }
        public string UserInternalId { get; set; } = string.Empty;
        public string? Mobile { get; set; }
        public string? ProfilePicUrl { get; set; }
        public int Role { get; set; }
    }

    /// <summary>Dữ liệu client gửi lên để cập nhật Users. Password để trống nếu không đổi mật khẩu.</summary>
    public class UserUpdateDto
    {
        public string UserName { get; set; } = string.Empty;
        public string? Password { get; set; }
        public string FullName { get; set; } = string.Empty;
        public DateTime? BirthDate { get; set; }
        public DateTime? IdentificationDate { get; set; }
        public string? IdentificationNumber { get; set; }
        public string UserInternalId { get; set; } = string.Empty;
        public string? Mobile { get; set; }
        public string? ProfilePicUrl { get; set; }
        public int Role { get; set; }
        public bool IsActived { get; set; }
    }
}
