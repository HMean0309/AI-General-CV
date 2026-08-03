using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TayDoApi.Models
{
    [Table("ExamQuestionAnswers")]
    public class ExamQuestionAnswers
    {
        [Key]
        public Guid Id { get; set; }
        public Guid ExamQuestionSelectionId { get; set; }
        public string AnswerText { get; set; } = string.Empty;
        public bool IsAnswer { get; set; }
    }
}
