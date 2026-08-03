using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TayDoApi.Models
{
    [Table("FormRequests")]
    public class FormRequests
    {
        [Key]
        public Guid Id { get; set; }
        public DateTime CreationDate { get; set; }
        public DateTime UpdateDate { get; set; }
        public Guid StudentId { get; set; }
        public Guid? FormTemplateId { get; set; }
        public Guid? ApprovalId { get; set; }
        public string ApprovalName { get; set; } = string.Empty;
        public string Note { get; set; } = string.Empty;
        public int Status { get; set; }
        public bool IsDeleted { get; set; }
    }
}
