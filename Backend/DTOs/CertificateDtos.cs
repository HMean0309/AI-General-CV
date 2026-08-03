namespace TayDoApi.DTOs
{
    public class CertificateDto
    {
        public Guid Id { get; set; }
        public Guid StudentId { get; set; }
        public string CertificateName { get; set; } = string.Empty;
        public string? Issuer { get; set; }
        public DateTime? IssueDate { get; set; }
        public string? CertificateUrl { get; set; }
        public DateTime CreationDate { get; set; }
    }

    public class CertificateCreateDto
    {
        public Guid StudentId { get; set; }
        public string CertificateName { get; set; } = string.Empty;
        public string? Issuer { get; set; }
        public DateTime? IssueDate { get; set; }
        public string? CertificateUrl { get; set; }
    }

    public class CertificateUpdateDto
    {
        public string CertificateName { get; set; } = string.Empty;
        public string? Issuer { get; set; }
        public DateTime? IssueDate { get; set; }
        public string? CertificateUrl { get; set; }
    }
}