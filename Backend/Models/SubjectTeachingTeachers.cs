using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TayDoApi.Models
{
    [Table("SubjectTeachingTeachers")]
    public class SubjectTeachingTeachers
    {
        [Key]
        public Guid Id { get; set; }
        public Guid SubjectTeachingId { get; set; }
        public Guid? TeacherId { get; set; }
        public bool? IsMainTeacher { get; set; }
        public bool IsDeleted { get; set; }
    }
}
