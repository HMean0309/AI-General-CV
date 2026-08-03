using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TayDoApi.Models
{
    [Table("SubjectSchedules")]
    public class SubjectSchedules
    {
        [Key]
        public Guid Id { get; set; }
        public Guid SubjectTeachingId { get; set; }
        public Guid? RoomId { get; set; }
        public Guid? TeacherId { get; set; }
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }
        public int? ScheduleType { get; set; }
        public string Note { get; set; } = string.Empty;
        public bool IsDeleted { get; set; }
    }
}
