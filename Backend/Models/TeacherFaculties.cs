using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TayDoApi.Models
{
    [Table("TeacherFaculties")]
    public class TeacherFaculties
    {
        [Key]
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid FacultyId { get; set; }
        public bool IsHeadOfFaculty { get; set; }
        public bool IsDeleted { get; set; }
    }
}
