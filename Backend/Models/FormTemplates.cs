using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TayDoApi.Models
{
    [Table("FormTemplates")]
    public class FormTemplates
    {
        [Key]
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? DocumentUrl { get; set; }
        public bool IsDeleted { get; set; }
    }
}
