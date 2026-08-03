namespace TayDoApi.Authorization
{
    /// <summary>
    /// Giá trị mặc định cho cột Users.Role (giả định vì chưa xác nhận enum thật của hệ thống gốc):
    /// 1 = Admin, 2 = Teacher (Giảng viên), 3 = Student (Sinh viên).
    /// Nếu enum thật khác, chỉ cần sửa 3 hằng số dưới đây, KHÔNG cần sửa từng controller.
    /// </summary>
    public static class Roles
    {
        public const string Admin = "99";
        public const string Teacher = "50";
        public const string Student = "1";

        public static readonly string[] AdminOnly = { Admin };
        public static readonly string[] AdminAndTeacher = { Admin, Teacher };
        public static readonly string[] AdminTeacherStudent = { Admin, Teacher, Student };
    }
}
