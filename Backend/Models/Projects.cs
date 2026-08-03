using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TayDoApi.Models
{
    [Table("Projects")]
    public class Projects
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid StudentId { get; set; }

        [Required]
        [MaxLength(255)]
        public string ProjectName { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? Role { get; set; }

        public string? Technologies { get; set; }

        public string? Description { get; set; }

        [MaxLength(250)]
        public string? GitUrl { get; set; }

        [MaxLength(250)]
        public string? DemoUrl { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public DateTime CreationDate { get; set; } = DateTime.UtcNow;

        public bool IsDeleted { get; set; } = false;
    }
}