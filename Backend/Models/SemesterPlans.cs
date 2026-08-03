using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TayDoApi.Models
{
    [Table("SemesterPlans")]
    public class SemesterPlans
    {
        [Key]
        public Guid Id { get; set; }
        public Guid AcademicYearId { get; set; }
        public Guid MajorId { get; set; }
        public int Semester { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
    }
}
