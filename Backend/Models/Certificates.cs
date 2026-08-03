using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TayDoApi.Models
{
    [Table("Certificates")]
    public class Certificates
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid StudentId { get; set; }

        [Required]
        [MaxLength(255)]
        public string CertificateName { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? Issuer { get; set; }

        public DateTime? IssueDate { get; set; }

        public string? CertificateUrl { get; set; }

        public DateTime CreationDate { get; set; } = DateTime.UtcNow;

        public bool IsDeleted { get; set; } = false;
    }
}