USE [TayDoV2]
GO

-- ============================================================
-- SQL Script: Thêm dữ liệu Sinh viên Test đầy đủ
-- Cơ sở dữ liệu: TayDoV2
-- Định dạng: Chuẩn SQL flat inserts giống file dump gốc script.sql
-- Liên kết: Sử dụng AcademicYearId & MajorId (CNTT) có sẵn trong DB
-- ============================================================

-- Xóa dữ liệu cũ của sinh viên test trước
DELETE FROM [dbo].[StudentEvaluationDetails] WHERE [StudentEvaluationId] = 'e9999999-9999-9999-9999-999999999999'
DELETE FROM [dbo].[StudentEvaluations] WHERE [Id] = 'e9999999-9999-9999-9999-999999999999'
DELETE FROM [dbo].[EvaluationCriterias] WHERE [Id] IN ('e8888888-8888-8888-8888-888888888881', 'e8888888-8888-8888-8888-888888888882', 'e8888888-8888-8888-8888-888888888883', 'e8888888-8888-8888-8888-888888888884', 'e8888888-8888-8888-8888-888888888885', 'e8888888-8888-8888-8888-888888888886')
DELETE FROM [dbo].[ExamResults] WHERE [StudentId] = 'e4444444-4444-4444-4444-444444444444'
DELETE FROM [dbo].[SubjectTeachingExams] WHERE [Id] IN ('e6666666-6666-6666-6666-666666666661', 'e6666666-6666-6666-6666-666666666662', 'e6666666-6666-6666-6666-666666666663')
DELETE FROM [dbo].[SubjectTeachings] WHERE [Id] IN ('ea111111-1111-1111-1111-111111111111', 'ea222222-2222-2222-2222-222222222222', 'ea333333-3333-3333-3333-333333333333')
DELETE FROM [dbo].[Subjects] WHERE [Id] IN ('e5555555-5555-5555-5555-555555555551', 'e5555555-5555-5555-5555-555555555552', 'e5555555-5555-5555-5555-555555555553')
DELETE FROM [dbo].[Students] WHERE [Id] = 'e4444444-4444-4444-4444-444444444444'
DELETE FROM [dbo].[Users] WHERE [Id] = 'e3333333-3333-3333-3333-333333333333'
GO

-- 1. Chèn vào bảng Users (Mật khẩu: 123456, Role 1 = Student)
INSERT [dbo].[Users] ([Id], [UserName], [PasswordHash], [PasswordSalt], [FullName], [BirthDate], [IdentificationDate], [IdentificationNumber], [UserInternalId], [Mobile], [ProfilePicUrl], [Role], [IsActived], [LastEnforceAnnouncementRead], [IsDeleted]) VALUES 
(N'e3333333-3333-3333-3333-333333333333', N'sv_test_full', N'yf0Ouap9ZCTdDjZFttAdWUJcbmYIP82rr3AaMWq6+36DbUKhl2/RT4PSxydDMN8DcCjdfdCWz0hI3EgxB5/OtQ==', 0xE64B83A007DDC87CBCDDBD23C26198246FCED9ECCFBE4E1767E4BE03D87CE30C526466BAC37422265E4432624EC658FBB84BA7FF4E1A8DB56B7D1448BFE5B209462AD67ABC105E54AABBA5F591C68E537F618483DBF74A127A9CC58064AF581B4CDBD72232B53D5DA7C315E8E6DDE6441BE9DC8C825C672025DA53AF1BCB771E, N'Nguyễn Văn Test', CAST(N'2004-05-15T00:00:00.0000000' AS DateTime2), NULL, NULL, N'SV000999', N'0909123456', NULL, 1, 1, NULL, 0)
GO

-- 2. Chèn vào bảng Students
-- Sử dụng AcademicYearId = e1111111-1111-1111-1111-111111111111 (Khóa 2022-2026)
-- Sử dụng MajorId = 874e3a16-8ad0-4028-3c6c-08dbb14678af (Ngành Công nghệ Thông tin sẵn có trong DB)
INSERT [dbo].[Students] ([Id], [UserId], [AcademicYearId], [MajorId], [RelativeUserId], [StudyStatus], [Gender], [Nickname], [PlaceOfBirth], [Hometown], [PermanentAddress], [ContactAddress], [Ethnicity], [Religion], [EducationLevel], [FatherName], [FatherOccupation], [MotherName], [MotherOccupation], [SpouseName], [SpouseOccupation], [PolicySubject], [PreviousOccupation], [PostGraduationWorkplace], [CommunistPartyJoinDate], [OfficialPartyJoinDate], [YouthUnionJoinDate], [IsGraduated], [HasIssue], [IssueDescription], [LibraryId], [IsDeleted]) VALUES 
(N'e4444444-4444-4444-4444-444444444444', N'e3333333-3333-3333-3333-333333333333', N'e1111111-1111-1111-1111-111111111111', N'874e3a16-8ad0-4028-3c6c-08dbb14678af', NULL, 1, 0, N'SV000999', N'Cần Thơ', N'Cần Thơ', N'123 Đường 3/2, Cần Thơ', N'123 Đường 3/2, Cần Thơ', N'Kinh', N'Không', N'Đại học', N'Nguyễn Văn Cha', N'Tự do', N'Lê Thị Mẹ', N'Nội trợ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, N'', NULL, 0)
GO

-- 3. Chèn vào bảng Subjects
INSERT [dbo].[Subjects] ([Id], [FacultyId], [SubjectCode], [Name], [CreditPoint], [TotalHours], [Note], [IsActived], [IsDeleted]) VALUES 
(N'e5555555-5555-5555-5555-555555555551', NULL, N'KTPM301', N'Phát triển ứng dụng Node.js', 3, 45, N'', 1, 0),
(N'e5555555-5555-5555-5555-555555555552', NULL, N'KTPM302', N'Cơ sở dữ liệu nâng cao', 3, 45, N'', 1, 0),
(N'e5555555-5555-5555-5555-555555555553', NULL, N'KTPM303', N'Kiến trúc phần mềm', 3, 45, N'', 1, 0),
(N'e5555555-5555-5555-5555-555555555554', NULL, N'CNTT101', N'Cấu trúc dữ liệu và giải thuật', 3, 45, N'', 1, 0),
(N'e5555555-5555-5555-5555-555555555555', NULL, N'CNTT201', N'Lập trình hướng đối tượng', 3, 45, N'', 1, 0),
(N'e5555555-5555-5555-5555-555555555556', NULL, N'CNTT202', N'Lập trình web', 3, 45, N'', 1, 0),
(N'e5555555-5555-5555-5555-555555555557', NULL, N'CNTT203', N'Mạng máy tính', 3, 45, N'', 1, 0),
(N'e5555555-5555-5555-5555-555555555558', NULL, N'CNTT102', N'Cơ sở dữ liệu', 3, 45, N'', 1, 0)
GO

-- 4. Chèn vào bảng SubjectTeachings
INSERT [dbo].[SubjectTeachings] ([Id], [SubjectId], [Name], [StartDate], [EndDate], [TotalSessions], [RoomIdDefault], [IsDeleted]) VALUES 
(N'ea111111-1111-1111-1111-111111111111', N'e5555555-5555-5555-5555-555555555551', N'Lớp học Phát triển ứng dụng Node.js', CAST(N'2025-01-01T00:00:00.0000000' AS DateTime2), CAST(N'2025-06-01T00:00:00.0000000' AS DateTime2), 15, NULL, 0),
(N'ea222222-2222-2222-2222-222222222222', N'e5555555-5555-5555-5555-555555555552', N'Lớp học Cơ sở dữ liệu nâng cao', CAST(N'2025-01-01T00:00:00.0000000' AS DateTime2), CAST(N'2025-06-01T00:00:00.0000000' AS DateTime2), 15, NULL, 0),
(N'ea333333-3333-3333-3333-333333333333', N'e5555555-5555-5555-5555-555555555553', N'Lớp học Kiến trúc phần mềm', CAST(N'2025-01-01T00:00:00.0000000' AS DateTime2), CAST(N'2025-06-01T00:00:00.0000000' AS DateTime2), 15, NULL, 0),
(N'ea444444-4444-4444-4444-444444444444', N'e5555555-5555-5555-5555-555555555554', N'Lớp học Cấu trúc dữ liệu và giải thuật', CAST(N'2024-09-01T00:00:00.0000000' AS DateTime2), CAST(N'2025-01-01T00:00:00.0000000' AS DateTime2), 15, NULL, 0),
(N'ea555555-5555-5555-5555-555555555555', N'e5555555-5555-5555-5555-555555555555', N'Lớp học Lập trình hướng đối tượng', CAST(N'2024-09-01T00:00:00.0000000' AS DateTime2), CAST(N'2025-01-01T00:00:00.0000000' AS DateTime2), 15, NULL, 0),
(N'ea666666-6666-6666-6666-666666666666', N'e5555555-5555-5555-5555-555555555556', N'Lớp học Lập trình web', CAST(N'2024-09-01T00:00:00.0000000' AS DateTime2), CAST(N'2025-01-01T00:00:00.0000000' AS DateTime2), 15, NULL, 0),
(N'ea777777-7777-7777-7777-777777777777', N'e5555555-5555-5555-5555-555555555557', N'Lớp học Mạng máy tính', CAST(N'2024-09-01T00:00:00.0000000' AS DateTime2), CAST(N'2025-01-01T00:00:00.0000000' AS DateTime2), 15, NULL, 0),
(N'ea888888-8888-8888-8888-888888888888', N'e5555555-5555-5555-5555-555555555558', N'Lớp học Cơ sở dữ liệu', CAST(N'2024-09-01T00:00:00.0000000' AS DateTime2), CAST(N'2025-01-01T00:00:00.0000000' AS DateTime2), 15, NULL, 0)
GO

-- 5. Chèn vào bảng SubjectTeachingExams
INSERT [dbo].[SubjectTeachingExams] ([Id], [SubjectTeachingId], [QuestionSuiteId], [Name], [StartDate], [EndDate], [RoomId], [TeacherId], [Notes], [Type], [Count], [NumOfEasy], [NumOfNormal], [NumOfHard], [NumOfPractice], [Method], [AllowNotifyStudent], [IsDeleted]) VALUES 
(N'e6666666-6666-6666-6666-666666666661', N'ea111111-1111-1111-1111-111111111111', NULL, N'Thi cuối kỳ Node.js', CAST(N'2025-06-01T00:00:00.0000000' AS DateTime2), CAST(N'2025-06-01T02:00:00.0000000' AS DateTime2), NULL, NULL, N'', 1, 0, 0, 0, 0, 0, 1, 1, 0),
(N'e6666666-6666-6666-6666-666666666662', N'ea222222-2222-2222-2222-222222222222', NULL, N'Thi cuối kỳ CSDL nâng cao', CAST(N'2025-06-02T00:00:00.0000000' AS DateTime2), CAST(N'2025-06-02T02:00:00.0000000' AS DateTime2), NULL, NULL, N'', 1, 0, 0, 0, 0, 0, 1, 1, 0),
(N'e6666666-6666-6666-6666-666666666663', N'ea333333-3333-3333-3333-333333333333', NULL, N'Thi cuối kỳ Kiến trúc PM', CAST(N'2025-06-03T00:00:00.0000000' AS DateTime2), CAST(N'2025-06-03T02:00:00.0000000' AS DateTime2), NULL, NULL, N'', 1, 0, 0, 0, 0, 0, 1, 1, 0),
(N'e6666666-6666-6666-6666-666666666664', N'ea444444-4444-4444-4444-444444444444', NULL, N'Thi cuối kỳ CTDL & GT', CAST(N'2025-01-15T00:00:00.0000000' AS DateTime2), CAST(N'2025-01-15T02:00:00.0000000' AS DateTime2), NULL, NULL, N'', 1, 0, 0, 0, 0, 0, 1, 1, 0),
(N'e6666666-6666-6666-6666-666666666665', N'ea555555-5555-5555-5555-555555555555', NULL, N'Thi cuối kỳ OOP', CAST(N'2025-01-16T00:00:00.0000000' AS DateTime2), CAST(N'2025-01-16T02:00:00.0000000' AS DateTime2), NULL, NULL, N'', 1, 0, 0, 0, 0, 0, 1, 1, 0),
(N'e6666666-6666-6666-6666-666666666666', N'ea666666-6666-6666-6666-666666666666', NULL, N'Thi cuối kỳ Lập trình web', CAST(N'2025-01-17T00:00:00.0000000' AS DateTime2), CAST(N'2025-01-17T02:00:00.0000000' AS DateTime2), NULL, NULL, N'', 1, 0, 0, 0, 0, 0, 1, 1, 0),
(N'e6666666-6666-6666-6666-666666666667', N'ea777777-7777-7777-7777-777777777777', NULL, N'Thi cuối kỳ Mạng MT', CAST(N'2025-01-18T00:00:00.0000000' AS DateTime2), CAST(N'2025-01-18T02:00:00.0000000' AS DateTime2), NULL, NULL, N'', 1, 0, 0, 0, 0, 0, 1, 1, 0),
(N'e6666666-6666-6666-6666-666666666668', N'ea888888-8888-8888-8888-888888888888', NULL, N'Thi cuối kỳ CSDL', CAST(N'2025-01-19T00:00:00.0000000' AS DateTime2), CAST(N'2025-01-19T02:00:00.0000000' AS DateTime2), NULL, NULL, N'', 1, 0, 0, 0, 0, 0, 1, 1, 0)
GO

-- 6. Chèn vào bảng ExamResults
INSERT [dbo].[ExamResults] ([Id], [SubjectTeachingExamId], [StudentId], [ExamAttemptId], [Result], [CombinedResult], [Notes], [ExamResultDesc], [ExamResultDetail], [IsDeleted]) VALUES 
(N'e7777777-7777-7777-7777-777777777771', N'e6666666-6666-6666-6666-666666666661', N'e4444444-4444-4444-4444-444444444444', NULL, 9.0, 9.0, N'Xuất sắc', N'Điểm môn Phát triển ứng dụng Node.js', N'', 0),
(N'e7777777-7777-7777-7777-777777777772', N'e6666666-6666-6666-6666-666666666662', N'e4444444-4444-4444-4444-444444444444', NULL, 8.5, 8.5, N'Giỏi', N'Điểm môn Cơ sở dữ liệu nâng cao', N'', 0),
(N'e7777777-7777-7777-7777-777777777773', N'e6666666-6666-6666-6666-666666666663', N'e4444444-4444-4444-4444-444444444444', NULL, 9.5, 9.5, N'Xuất sắc', N'Điểm môn Kiến trúc phần mềm', N'', 0),
(N'e7777777-7777-7777-7777-777777777774', N'e6666666-6666-6666-6666-666666666664', N'e4444444-4444-4444-4444-444444444444', NULL, 8.0, 8.0, N'Giỏi', N'Điểm môn Cấu trúc dữ liệu và giải thuật', N'', 0),
(N'e7777777-7777-7777-7777-777777777775', N'e6666666-6666-6666-6666-666666666665', N'e4444444-4444-4444-4444-444444444444', NULL, 9.0, 9.0, N'Xuất sắc', N'Điểm môn Lập trình hướng đối tượng', N'', 0),
(N'e7777777-7777-7777-7777-777777777776', N'e6666666-6666-6666-6666-666666666666', N'e4444444-4444-4444-4444-444444444444', NULL, 8.5, 8.5, N'Giỏi', N'Điểm môn Lập trình web', N'', 0),
(N'e7777777-7777-7777-7777-777777777777', N'e6666666-6666-6666-6666-666666666667', N'e4444444-4444-4444-4444-444444444444', NULL, 7.5, 7.5, N'Khá', N'Điểm môn Mạng máy tính', N'', 0),
(N'e7777777-7777-7777-7777-777777777778', N'e6666666-6666-6666-6666-666666666668', N'e4444444-4444-4444-4444-444444444444', NULL, 9.0, 9.0, N'Xuất sắc', N'Điểm môn Cơ sở dữ liệu', N'', 0)
GO

-- 7. Chèn vào bảng EvaluationCriterias (6 tiêu chí PLO)
INSERT [dbo].[EvaluationCriterias] ([Id], [Name], [Description], [Type], [Score], [ParentId], [QuestionId]) VALUES 
(N'e8888888-8888-8888-8888-888888888881', N'Thiết kế hệ thống RESTful API', N'Khả năng thiết kế, chuẩn hóa và xây dựng các API RESTful chất lượng cao', 1, 10.00, NULL, NULL),
(N'e8888888-8888-8888-8888-888888888882', N'Tối ưu hóa câu lệnh truy vấn SQL', N'Năng lực tối ưu hóa index, cấu trúc câu lệnh và hiệu năng database', 1, 10.00, NULL, NULL),
(N'e8888888-8888-8888-8888-888888888883', N'Lập trình hướng đối tượng (OOP)', N'Áp dụng các nguyên lý SOLID, Design Patterns và Clean Code', 1, 10.00, NULL, NULL),
(N'e8888888-8888-8888-8888-888888888884', N'Quản lý phiên bản với Git', N'Kỹ năng sử dụng Git/GitHub, branching strategy và collaborative workflow', 1, 10.00, NULL, NULL),
(N'e8888888-8888-8888-8888-888888888885', N'Phân tích yêu cầu phần mềm', N'Khả năng thu thập, phân tích và mô hình hóa yêu cầu hệ thống', 1, 10.00, NULL, NULL),
(N'e8888888-8888-8888-8888-888888888886', N'Kiểm thử phần mềm', N'Kỹ năng viết test case, unit test và integration test', 1, 10.00, NULL, NULL)
GO

-- 8. Chèn vào bảng StudentEvaluations
INSERT [dbo].[StudentEvaluations] ([Id], [StudentId], [SubjectTeachingId], [SemesterPlanId], [SubjectTeachingExamId], [QuestionId], [TeacherId], [TeacherName], [Type], [Comment], [TotalScore], [CreationDate], [UpdatedDate], [IsDeleted]) VALUES 
(N'e9999999-9999-9999-9999-999999999999', N'e4444444-4444-4444-4444-444444444444', NULL, NULL, NULL, NULL, NULL, N'Hệ thống', 1, N'Đánh giá năng lực tích lũy PLO tự động', 8.75, CAST(N'2026-07-14T00:00:00.0000000' AS DateTime2), NULL, 0)
GO

-- 9. Chèn vào bảng StudentEvaluationDetails (6 chi tiết đánh giá)
INSERT [dbo].[StudentEvaluationDetails] ([Id], [StudentEvaluationId], [EvaluationCriteriaId], [EvaluationName], [StudentScore], [Score], [IsDeleted]) VALUES 
(N'eaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', N'e9999999-9999-9999-9999-999999999999', N'e8888888-8888-8888-8888-888888888881', N'Thiết kế hệ thống RESTful API', 9.50, 10.00, 0),
(N'ebbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', N'e9999999-9999-9999-9999-999999999999', N'e8888888-8888-8888-8888-888888888882', N'Tối ưu hóa câu lệnh truy vấn SQL', 8.00, 10.00, 0),
(N'ecccccc1-cccc-cccc-cccc-cccccccccccc', N'e9999999-9999-9999-9999-999999999999', N'e8888888-8888-8888-8888-888888888883', N'Lập trình hướng đối tượng (OOP)', 8.50, 10.00, 0),
(N'ecccccc2-cccc-cccc-cccc-cccccccccccc', N'e9999999-9999-9999-9999-999999999999', N'e8888888-8888-8888-8888-888888888884', N'Quản lý phiên bản với Git', 9.00, 10.00, 0),
(N'ecccccc3-cccc-cccc-cccc-cccccccccccc', N'e9999999-9999-9999-9999-999999999999', N'e8888888-8888-8888-8888-888888888885', N'Phân tích yêu cầu phần mềm', 7.50, 10.00, 0),
(N'ecccccc4-cccc-cccc-cccc-cccccccccccc', N'e9999999-9999-9999-9999-999999999999', N'e8888888-8888-8888-8888-888888888886', N'Kiểm thử phần mềm', 7.00, 10.00, 0)
GO

SELECT N'Đã thêm sinh viên Nguyễn Văn Test thành công!' AS [Status];
GO
