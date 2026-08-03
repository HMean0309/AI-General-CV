using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TayDoApi.Models
{
    [Table("Majors")]
    public class Majors
    {
        [Key]
        public Guid Id { get; set; }
        public Guid? FacultyId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public int TrainingType { get; set; }
        public bool IsDeleted { get; set; }
    }
}
