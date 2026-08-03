using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TayDoApi.Models
{
    [Table("UserAnnouncements")]
    public class UserAnnouncements
    {
        [Key]
        public Guid Id { get; set; }
        public int Type { get; set; }
        public string UserIds { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime CreationDate { get; set; }
        public int Status { get; set; }
        public string DeepLink { get; set; } = string.Empty;
        public string DeepLinkParam { get; set; } = string.Empty;
        public Guid EntityObjectId { get; set; }
        public bool EnforceRead { get; set; }
        public int? NotificationType { get; set; }
        public bool IsDeleted { get; set; }
    }
}
