using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TayDoApi.Models
{
    [Table("Users")]
    public class Users
    {
        [Key]
        public Guid Id { get; set; }
        [MaxLength(450)]
        public string UserName { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public byte[] PasswordSalt { get; set; } = Array.Empty<byte>();
        [MaxLength(450)]
        public string FullName { get; set; } = string.Empty;
        public DateTime? BirthDate { get; set; }
        public DateTime? IdentificationDate { get; set; }
        public string? IdentificationNumber { get; set; }
        [MaxLength(450)]
        public string UserInternalId { get; set; } = string.Empty;
        [MaxLength(450)]
        public string? Mobile { get; set; }
        public string? ProfilePicUrl { get; set; }
        public int Role { get; set; }
        public bool IsActived { get; set; }
        public DateTime? LastEnforceAnnouncementRead { get; set; }
        public bool IsDeleted { get; set; }
    }
}
