using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TayDoApi.Models
{
    [Table("ExamQuestionSelections")]
    public class ExamQuestionSelections
    {
        [Key]
        public Guid Id { get; set; }
        public Guid ExamAttemptId { get; set; }
        public Guid? AnswerId { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public int Order { get; set; }
        public bool IsFlag { get; set; }
        public DateTime CreationDate { get; set; }
        public DateTime? SubmitDate { get; set; }
    }
}
