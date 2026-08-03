using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TayDoApi.Models
{
    [Table("UserDevices")]
    public class UserDevices
    {
        [Key]
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public int UserRole { get; set; }
        public int DeviceType { get; set; }
        public string Identifier { get; set; } = string.Empty;
        public string PushId { get; set; } = string.Empty;
    }
}
