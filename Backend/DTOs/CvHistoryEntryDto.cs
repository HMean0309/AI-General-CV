namespace TayDoApi.DTOs
{
    public class CvHistoryEntryDto
    {
        public Guid Id { get; set; }
        public Guid CvId { get; set; }
        public int Action { get; set; }
        public string ActionName { get; set; } = string.Empty;
        public string Details { get; set; } = string.Empty;
        public Guid ChangedByUserId { get; set; }
        public string? ChangedByName { get; set; }
        public DateTime CreationDate { get; set; }
    }
}