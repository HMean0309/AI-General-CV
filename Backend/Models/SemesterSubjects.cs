using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TayDoApi.Models
{
    [Table("SemesterSubjects")]
    public class SemesterSubjects
    {
        [Key]
        public Guid Id { get; set; }
        public Guid SemesterPlanId { get; set; }
        public Guid? SubjectId { get; set; }
        public string SubjectName { get; set; } = string.Empty;
        public string SubjectCode { get; set; } = string.Empty;
        public int CreditPoint { get; set; }
        public bool IsDeleted { get; set; }
    }
}
