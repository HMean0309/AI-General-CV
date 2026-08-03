using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TayDoApi.Models
{
    [Table("Subjects")]
    public class Subjects
    {
        [Key]
        public Guid Id { get; set; }
        public Guid? FacultyId { get; set; }
        public string SubjectCode { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public int CreditPoint { get; set; }
        public int? TotalHours { get; set; }
        public string Note { get; set; } = string.Empty;
        public bool IsActived { get; set; }
        public bool IsDeleted { get; set; }
    }
}
