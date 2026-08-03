namespace TayDoApi.DTOs
{
    public class UserCvsCreateDto
    {
        public Guid StudentId { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    public class UserCvsUpdateDto
    {
        public string FileName { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}
