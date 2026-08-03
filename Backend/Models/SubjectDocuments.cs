using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TayDoApi.Models
{
    [Table("SubjectDocuments")]
    public class SubjectDocuments
    {
        [Key]
        public Guid Id { get; set; }
        public Guid SubjectId { get; set; }
        public int Type { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Detail { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public Guid CreateById { get; set; }
        public Guid UserId { get; set; }
        public DateTime CreationDate { get; set; }
        public DateTime UpdateDate { get; set; }
    }
}
