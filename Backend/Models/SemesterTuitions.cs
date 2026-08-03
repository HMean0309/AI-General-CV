using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TayDoApi.Models
{
    [Table("SemesterTuitions")]
    public class SemesterTuitions
    {
        [Key]
        public Guid Id { get; set; }
        public Guid SemesterPlanId { get; set; }
        public Guid StudentId { get; set; }
        public decimal? Amount { get; set; }
        public DateTime? PaidDate { get; set; }
        public bool IsDeleted { get; set; }
    }
}
