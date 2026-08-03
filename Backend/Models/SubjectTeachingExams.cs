using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TayDoApi.Models
{
    [Table("SubjectTeachingExams")]
    public class SubjectTeachingExams
    {
        [Key]
        public Guid Id { get; set; }
        public Guid SubjectTeachingId { get; set; }
        public Guid? QuestionSuiteId { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public Guid? RoomId { get; set; }
        public Guid? TeacherId { get; set; }
        public string Notes { get; set; } = string.Empty;
        public int Type { get; set; }
        public int Count { get; set; }
        public int NumOfEasy { get; set; }
        public int NumOfNormal { get; set; }
        public int NumOfHard { get; set; }
        public int NumOfPractice { get; set; }
        public int? Method { get; set; }
        public bool AllowNotifyStudent { get; set; }
        public bool IsDeleted { get; set; }
    }
}
