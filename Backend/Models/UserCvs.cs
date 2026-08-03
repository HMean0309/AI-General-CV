using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TayDoApi.Models
{
    [Table("UserCvs")]
    public class UserCvs
    {
        [Key]
        public Guid Id { get; set; }

        public Guid StudentId { get; set; }

        [MaxLength(255)]
        public string FileName { get; set; } = string.Empty;

        public string FileUrl { get; set; } = string.Empty;

        public string? Description { get; set; }

        public DateTime UploadDate { get; set; }

        public bool IsDeleted { get; set; }
    }
}