using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TayDoApi.Models
{
    [Table("Attendances")]
    public class Attendances
    {
        [Key]
        public Guid Id { get; set; }
        public Guid SubjectScheduleId { get; set; }
        public Guid StudentId { get; set; }
        public Guid CreatedById { get; set; }
        public int Status { get; set; }
        public string Notes { get; set; } = string.Empty;
        public DateTime CreationDate { get; set; }
        public bool? IsFirstTypeWarning { get; set; }
        public bool? IsSecondTypeWarning { get; set; }
    }
}
