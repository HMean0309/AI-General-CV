using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TayDoApi.Models
{
    [Table("QuestionAnswers")]
    public class QuestionAnswers
    {
        [Key]
        public Guid Id { get; set; }
        public Guid QuestionId { get; set; }
        public string AnswerText { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public bool IsAnswer { get; set; }
    }
}
