using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TayDoApi.Models
{
    [Table("EvaluationCriterias")]
    public class EvaluationCriterias
    {
        [Key]
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Type { get; set; }
        public decimal Score { get; set; }
        public Guid? ParentId { get; set; }
        public Guid? QuestionId { get; set; }
    }
}
