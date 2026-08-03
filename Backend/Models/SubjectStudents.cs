using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TayDoApi.Models
{
    [Table("SubjectStudents")]
    public class SubjectStudents
    {
        [Key]
        public Guid Id { get; set; }
        public Guid SubjectTeachingId { get; set; }
        public Guid StudentId { get; set; }
    }
}
