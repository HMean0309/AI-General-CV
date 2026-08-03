using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TayDoApi.Models
{
    [Table("StudentEvaluationDetails")]
    public class StudentEvaluationDetails
    {
        [Key]
        public Guid Id { get; set; }
        public Guid StudentEvaluationId { get; set; }
        public Guid? EvaluationCriteriaId { get; set; }
        public string? EvaluationName { get; set; }
        public decimal? StudentScore { get; set; }
        public decimal? Score { get; set; }
        public bool IsDeleted { get; set; }
    }
}
