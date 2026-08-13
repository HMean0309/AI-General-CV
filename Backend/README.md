# TayDo API

Web API (ASP.NET Core 8, EF Core) đọc/ghi dữ liệu cho database **TayDoV2** 

## Cấu trúc project
```
TayDoApi/
├── Models/          # 36 entity, map 1-1 với 36 bảng trong DB
├── Data/
│   └── ApplicationDbContext.cs   # DbContext, khai báo DbSet cho toàn bộ bảng
├── Controllers/
│   ├── CrudControllerBase.cs     # Controller CRUD dùng chung (generic)
│   └── *Controller.cs            # 1 controller mỏng cho mỗi bảng, kế thừa CrudControllerBase
├── Program.cs
├── appsettings.json
└── TayDoApi.csproj
```

## Yêu cầu môi trường

Project target `net8.0`. Kiểm tra máy bạn đã cài .NET 8 SDK chưa:
```bash
dotnet --list-sdks
dotnet --list-runtimes
```
Nếu chưa thấy dòng nào bắt đầu bằng `8.0.x`, tải SDK .NET 8 tại: https://dotnet.microsoft.com/download/dotnet/8.0

## Cách chạy

1. **Sửa connection string** trong `appsettings.json`:
```json
    "DefaultConnection": "Server=LAPTOP-7U28KRV4\\SQLEXPRESS;Database=TayDoV2;Trusted_Connection=True;TrustServerCertificate=True;"
```
Đổi `Server` theo instance SQL Server bạn đã restore `TayDoV2.bak` vào.

2. Cài package & chạy:
```bash
dotnet restore
dotnet run
```

3. Mở Swagger để test API: `https://localhost:5000/swagger`

## Các endpoint có sẵn (áp dụng cho tất cả 36 bảng)

Ví dụ với bảng `Students` → route `api/students`:

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/students?page=1&pageSize=50` | Lấy danh sách (có phân trang, tối đa 500/trang) |
| GET | `/api/students/{id}` | Lấy 1 bản ghi theo Id |
| POST | `/api/students` | Tạo mới |
| PUT | `/api/students/{id}` | Cập nhật |
| DELETE | `/api/students/{id}` | Xóa |

Danh sách route tương ứng từng bảng (kebab-case): `academic-years`, `attendances`, `audit-logs`, `evaluation-criterias`, `exam-attempts`, `exam-question-answers`, `exam-question-selections`, `exam-results`, `faculties`, `form-requests`, `form-templates`, `majors`, `password-resets`, `question-answers`, `question-suites`, `questions`, `rooms`, `semester-plans`, `semester-subjects`, `semester-tuitions`, `settings`, `student-evaluation-details`, `student-evaluations`, `students`, `subject-documents`, `subject-schedules`, `subject-special-notes`, `subject-students`, `subject-teaching-exams`, `subject-teaching-teachers`, `subject-teachings`, `subjects`, `teacher-faculties`, `user-announcements`, `user-devices`, `users`.

Kết quả GET danh sách trả kèm header `X-Total-Count`, `X-Page`, `X-Page-Size` để phân trang phía client.

## Authentication (JWT)

Toàn bộ API (trừ `api/auth/*`) hiện yêu cầu **Bearer JWT token** hợp lệ.

### 1. Cấu hình secret key
Trong `appsettings.json`, đổi `Jwt:Key` thành một chuỗi bí mật dài, ngẫu nhiên (>= 32 ký tự), không commit key thật lên git.

### 2. Tạo tài khoản admin đầu tiên
Mật khẩu trong `TayDoV2.bak` (dữ liệu cũ) được hash bằng thuật toán của hệ thống gốc — không khớp với HMACSHA512 mà API này dùng để tạo user mới — nên tài khoản cũ sẽ chưa đăng nhập được ngay. Gọi endpoint bootstrap để tạo admin mới (chỉ chặn nếu trùng `userName` với user đã có, không quan tâm bảng có dữ liệu cũ hay không):
```
POST /api/auth/bootstrap-admin
{ "userName": "admin", "password": "Admin@123", "fullName": "Quan tri vien", "userInternalId": "ADMIN001", "role": 1 }
```
**Cảnh báo bảo mật:** endpoint này không yêu cầu đăng nhập (để tiện bootstrap lần đầu). Sau khi đã có tài khoản admin hoạt động được, nên xóa/comment action `BootstrapAdmin` trong `Controllers/AuthController.cs` trước khi triển khai thật — nếu không, bất kỳ ai cũng gọi được để tự tạo tài khoản.

### 3. Đăng nhập lấy token
```
POST /api/auth/login
{ "userName": "admin", "password": "Admin@123" }
```
trả về `{ token, expiresAt, user }`.

### 4. Gọi API kèm token
Thêm header `Authorization: Bearer {token}` vào mọi request. Trong Swagger UI bấm nút **Authorize** ở góc trên, dán `Bearer {token}`.

### 5. Đổi mật khẩu
```
POST /api/auth/change-password  (kèm Authorization header)
{ "currentPassword": "...", "newPassword": "..." }
```

## DTO ẩn field nhạy cảm cho Users

`UsersController` (`api/users`) không dùng chung `CrudControllerBase` như 35 bảng còn lại mà viết riêng để:
- GET/POST/PUT/DELETE đều thao tác qua `UserDto`/`UserCreateDto`/`UserUpdateDto` — không bao giờ trả `PasswordHash`, `PasswordSalt` ra ngoài.
- POST/PUT nhận `Password` dạng plain text, server tự hash trước khi lưu.
- DELETE là xóa mềm (`IsDeleted = true`), không xóa hẳn khỏi DB.

Xem `DTOs/UserDto.cs`, `Controllers/UsersController.cs`, `Services/PasswordHasher.cs`.

## Phân quyền theo Role

Vì chưa xác nhận được enum `Role` thật của hệ thống gốc, mặc định đang dùng: **1 = Admin, 2 = Teacher, 3 = Student** (khai báo tại `Authorization/Roles.cs` — muốn đổi chỉ cần sửa 3 hằng số ở đây, không phải sửa từng controller).

Mỗi controller kế thừa `CrudControllerBase<T>` có 2 thuộc tính override được:
```csharp
protected virtual string[]? ReadRoles => null;              // null = ai đăng nhập cũng đọc được (mặc định)
protected virtual string[] WriteRoles => Roles.AdminOnly;    // mặc định chỉ Admin được ghi
```

Quy tắc đã áp dụng sẵn cho 35 bảng:

| Nhóm | Bảng | Đọc (GET) | Ghi (POST/PUT/DELETE) |
|---|---|---|---|
| Dữ liệu nền tảng | AcademicYears, Faculties, Majors, Rooms, FormTemplates, Settings, SemesterPlans, EvaluationCriterias, TeacherFaculties, Subjects | Ai đăng nhập cũng xem | Chỉ **Admin** |
| Nghiệp vụ giảng dạy | Attendances, Questions, QuestionAnswers, QuestionSuites, ExamQuestionAnswers, ExamQuestionSelections, ExamResults, SemesterSubjects, StudentEvaluations, StudentEvaluationDetails, SubjectDocuments, SubjectSchedules, SubjectSpecialNotes, SubjectStudents, SubjectTeachingExams, SubjectTeachingTeachers, SubjectTeachings, UserAnnouncements | Ai đăng nhập cũng xem | **Admin + Teacher** |
| Sinh viên tự thao tác | ExamAttempts, FormRequests | Ai đăng nhập cũng xem | **Admin + Teacher + Student** |
| Dữ liệu nhạy cảm | AuditLogs, PasswordResets, SemesterTuitions, Students, UserDevices | Chỉ **Admin + Teacher** | Chỉ **Admin** |
| Users (controller riêng) | — | Admin/Teacher xem mọi user; Student chỉ xem **chính mình** | Chỉ **Admin** |

Nếu request không đủ quyền, API trả về `403 Forbidden`. Muốn đổi quy tắc cho bảng nào, sửa 2 dòng override trong file `Controllers/{Ten Bang}Controller.cs` tương ứng, ví dụ:
```csharp
protected override string[] WriteRoles => Roles.AdminAndTeacher;
protected override string[]? ReadRoles => Roles.AdminAndTeacher;
```

## Lưu ý quan trọng khác

- 36 bảng còn lại chỉ map cột (không khai báo navigation property/quan hệ FK ở tầng EF Core) để tránh vòng lặp serialize JSON. Cột khóa ngoại (`StudentId`, `SubjectId`,...) vẫn còn nguyên nếu cần join thủ công hoặc bổ sung navigation sau.
- CORS đang mở `AllowAny` — nên giới hạn origin cụ thể khi deploy.
- Hiện tất cả endpoint yêu cầu "đã đăng nhập" (`[Authorize]`) và đã phân quyền theo Role — xem mục "Phân quyền theo Role" ở trên.
- Đây là code sinh tự động từ schema — nếu DB có ràng buộc nghiệp vụ khác (unique, check constraint...) cần rà lại cho khớp.
