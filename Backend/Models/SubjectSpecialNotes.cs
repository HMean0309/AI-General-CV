using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TayDoApi.Models
{
    [Table("SubjectSpecialNotes")]
    public class SubjectSpecialNotes
    {
        [Key]
        public Guid Id { get; set; }
        public Guid SubjectId { get; set; }
        public Guid StudentId { get; set; }
        public Guid CreatedById { get; set; }
        public string Notes { get; set; } = string.Empty;
        public int Type { get; set; }
        public DateTime CreationDate { get; set; }
        public bool IsDeleted { get; set; }
    }
}
