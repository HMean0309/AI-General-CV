using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TayDoApi.Models
{
    [Table("Questions")]
    public class Questions
    {
        [Key]
        public Guid Id { get; set; }
        public Guid QuestionSuiteId { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public int Level { get; set; }
        public string? ImageUrl { get; set; }
    }
}
