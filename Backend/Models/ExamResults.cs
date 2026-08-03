using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TayDoApi.Models
{
    [Table("ExamResults")]
    public class ExamResults
    {
        [Key]
        public Guid Id { get; set; }
        public Guid SubjectTeachingExamId { get; set; }
        public Guid StudentId { get; set; }
        public Guid? ExamAttemptId { get; set; }
        public float? Result { get; set; }
        public float? CombinedResult { get; set; }
        public string? Notes { get; set; }
        public string? ExamResultDesc { get; set; }
        public string? ExamResultDetail { get; set; }
        public bool IsDeleted { get; set; }
    }
}
