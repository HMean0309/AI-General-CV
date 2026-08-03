namespace TayDoApi.DTOs
{
    public class ProjectDto
    {
        public Guid Id { get; set; }
        public Guid StudentId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Role { get; set; }
        public List<string> Technologies { get; set; } = new();
        public string? GitUrl { get; set; }
        public string? DemoUrl { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public DateTime CreationDate { get; set; }
    }

    public class ProjectCreateDto
    {
        public Guid StudentId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Role { get; set; }
        public List<string> Technologies { get; set; } = new();
        public string? GitUrl { get; set; }
        public string? DemoUrl { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }

    public class ProjectUpdateDto
    {
        public string ProjectName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Role { get; set; }
        public List<string> Technologies { get; set; } = new();
        public string? GitUrl { get; set; }
        public string? DemoUrl { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}