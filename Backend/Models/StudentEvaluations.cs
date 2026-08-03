using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TayDoApi.Models
{
    [Table("StudentEvaluations")]
    public class StudentEvaluations
    {
        [Key]
        public Guid Id { get; set; }
        public Guid StudentId { get; set; }
        public Guid? SubjectTeachingId { get; set; }
        public Guid? SemesterPlanId { get; set; }
        public Guid? SubjectTeachingExamId { get; set; }
        public Guid? QuestionId { get; set; }
        public Guid? TeacherId { get; set; }
        public string? TeacherName { get; set; }
        public int Type { get; set; }
        public string? Comment { get; set; }
        public decimal? TotalScore { get; set; }
        public DateTime CreationDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public bool IsDeleted { get; set; }
    }
}
