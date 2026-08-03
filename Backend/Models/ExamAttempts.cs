using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TayDoApi.Models
{
    [Table("ExamAttempts")]
    public class ExamAttempts
    {
        [Key]
        public Guid Id { get; set; }
        public Guid StudentId { get; set; }
        public Guid SubjectTeachingExamId { get; set; }
        public DateTime? DraftDate { get; set; }
        public DateTime? SubmitDate { get; set; }
        public bool IsDeleted { get; set; }
    }
}
