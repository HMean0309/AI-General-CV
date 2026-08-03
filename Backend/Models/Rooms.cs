using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TayDoApi.Models
{
    [Table("Rooms")]
    public class Rooms
    {
        [Key]
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int NumberOfSeats { get; set; }
        public bool IsDeleted { get; set; }
    }
}
