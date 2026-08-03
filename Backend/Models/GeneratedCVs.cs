using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TayDoApi.Models
{
    [Table("GeneratedCVs")]
    public class GeneratedCVs
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid StudentId { get; set; }

        [MaxLength(200)]
        public string? JobTitle { get; set; }

        public string? RawJobDescription { get; set; }

        public int MatchScore { get; set; } = 0;

        [Required]
        public string CvDataJson { get; set; } = string.Empty;

        public bool IsFallback { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool IsDeleted { get; set; } = false;
    }
}
