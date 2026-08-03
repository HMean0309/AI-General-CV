namespace TayDoApi.Common
{
    /// <summary>
    /// Giá trị Action cho bảng AuditLogs khi ghi vết thao tác.
    /// LƯU Ý: đây là quy ước tạm đặt ra cho tính năng UserCvs — nếu hệ thống gốc đã có
    /// enum Action/RecordEntity dùng chung ở nơi khác, hãy thay các hằng số dưới đây cho khớp.
    /// </summary>
    public static class AuditActions
    {
        public const int Create = 1;
        public const int Update = 2;
        public const int Delete = 3;
        public const int Duplicate = 4;
    }

    /// <summary>Giá trị RecordEntity cho bảng AuditLogs, xác định vết ghi thuộc thực thể nào.</summary>
    public static class AuditRecordEntities
    {
        public const int UserCvs = 100;
    }
}
