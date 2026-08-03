using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TayDoApi.Models
{
    [Table("AuditLogs")]
    public class AuditLogs
    {
        [Key]
        public Guid Id { get; set; }
        public int Action { get; set; }
        public string Details { get; set; } = string.Empty;
        public Guid RecordId { get; set; }
        public DateTime CreationDate { get; set; }
        public Guid UserId { get; set; }
        public int? RecordEntity { get; set; }
        public string RecordDesc { get; set; } = string.Empty;
        public bool IsDeleted { get; set; }
    }
}
