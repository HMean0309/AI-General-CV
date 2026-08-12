USE [TayDoV2]
GO

-- ============================================================
-- SQL Script: Cập nhật Bộ dữ liệu Test Đầy đủ cho AI General CV
-- Cơ sở dữ liệu: TayDoV2
-- Tài khoản Sinh viên: sv_test_full / 123456
-- Tài khoản Admin: admin_test / 123456 (Role 99)
-- ============================================================

-- A. XÓA DỮ LIỆU CŨ ĐỂ KHÔNG BỊ TRÙNG LẶP
DELETE FROM [dbo].[Projects] WHERE [StudentId] = 'e4444444-4444-4444-4444-444444444444';
DELETE FROM [dbo].[Certificates] WHERE [StudentId] = 'e4444444-4444-4444-4444-444444444444';

DELETE FROM [dbo].[StudentEvaluationDetails] WHERE [StudentEvaluationId] = 'e9999999-9999-9999-9999-999999999999';
DELETE FROM [dbo].[StudentEvaluations] WHERE [Id] = 'e9999999-9999-9999-9999-999999999999';
DELETE FROM [dbo].[EvaluationCriterias] WHERE CAST([Id] AS NVARCHAR(36)) LIKE 'e8888888-%';

DELETE FROM [dbo].[ExamResults] WHERE [StudentId] = 'e4444444-4444-4444-4444-444444444444';
DELETE FROM [dbo].[SubjectTeachingExams] WHERE CAST([Id] AS NVARCHAR(36)) LIKE 'e6666666-%';
DELETE FROM [dbo].[SubjectTeachings] WHERE CAST([Id] AS NVARCHAR(36)) LIKE 'ea%';
DELETE FROM [dbo].[Subjects] WHERE [SubjectCode] IN (N'CNTT100', N'CNTT101', N'CNTT102', N'CNTT103', N'CNTT201', N'CNTT202', N'CNTT203', N'CNTT204', N'CNTT205', N'KTPM301', N'KTPM302', N'KTPM303', N'CNTT301', N'CNTT302', N'CNTT303', N'CNTT304', N'CNTT305', N'CNTT401', N'CNTT402', N'CNTT403', N'CNTT404', N'CNTT405');

DELETE FROM [dbo].[Students] WHERE [Id] = 'e4444444-4444-4444-4444-444444444444';
DELETE FROM [dbo].[Users] WHERE [UserName] IN (N'sv_test_full', N'admin_test');
GO

-- 1. TẠO TÀI KHOẢN USERS (Mật khẩu chuẩn 123456 cho cả 2 tài khoản)
INSERT [dbo].[Users] ([Id], [UserName], [PasswordHash], [PasswordSalt], [FullName], [BirthDate], [IdentificationDate], [IdentificationNumber], [UserInternalId], [Mobile], [ProfilePicUrl], [Role], [IsActived], [LastEnforceAnnouncementRead], [IsDeleted]) VALUES 
(N'e3333333-3333-3333-3333-333333333333', N'sv_test_full', N'rYHE4nOo2tDfnyVthKTqp7c7qnF341Mb+CVlxHlsoZuVM2bn4HmJc6/d/vHzHiNC/nm+0SuCUaGOvX4+ReQ5Vw==', 0x000102030405060708090A0B0C0D0E0F101112131415161718191A1B1C1D1E1F202122232425262728292A2B2C2D2E2F303132333435363738393A3B3C3D3E3F404142434445464748494A4B4C4D4E4F505152535455565758595A5B5C5D5E5F606162636465666768696A6B6C6D6E6F707172737475767778797A7B7C7D7E7F, N'Nguyễn Văn Test', CAST(N'2004-05-15T00:00:00.0000000' AS DateTime2), NULL, NULL, N'SV000999', N'0909123456', NULL, 1, 1, NULL, 0);

INSERT [dbo].[Users] ([Id], [UserName], [PasswordHash], [PasswordSalt], [FullName], [BirthDate], [IdentificationDate], [IdentificationNumber], [UserInternalId], [Mobile], [ProfilePicUrl], [Role], [IsActived], [LastEnforceAnnouncementRead], [IsDeleted]) VALUES 
(N'e2222222-2222-2222-2222-222222222222', N'admin_test', N'rYHE4nOo2tDfnyVthKTqp7c7qnF341Mb+CVlxHlsoZuVM2bn4HmJc6/d/vHzHiNC/nm+0SuCUaGOvX4+ReQ5Vw==', 0x000102030405060708090A0B0C0D0E0F101112131415161718191A1B1C1D1E1F202122232425262728292A2B2C2D2E2F303132333435363738393A3B3C3D3E3F404142434445464748494A4B4C4D4E4F505152535455565758595A5B5C5D5E5F606162636465666768696A6B6C6D6E6F707172737475767778797A7B7C7D7E7F, N'Quản trị viên Hệ thống', CAST(N'1995-01-01T00:00:00.0000000' AS DateTime2), NULL, NULL, N'ADM001', N'0909888999', NULL, 99, 1, NULL, 0);
GO

-- 2. TẠO HỒ SƠ SINH VIÊN (Students)
INSERT [dbo].[Students] ([Id], [UserId], [AcademicYearId], [MajorId], [RelativeUserId], [StudyStatus], [Gender], [Nickname], [PlaceOfBirth], [Hometown], [PermanentAddress], [ContactAddress], [Ethnicity], [Religion], [EducationLevel], [FatherName], [FatherOccupation], [MotherName], [MotherOccupation], [SpouseName], [SpouseOccupation], [PolicySubject], [PreviousOccupation], [PostGraduationWorkplace], [CommunistPartyJoinDate], [OfficialPartyJoinDate], [YouthUnionJoinDate], [IsGraduated], [HasIssue], [IssueDescription], [LibraryId], [IsDeleted], [GithubUrl], [Email]) VALUES 
(N'e4444444-4444-4444-4444-444444444444', N'e3333333-3333-3333-3333-333333333333', N'e1111111-1111-1111-1111-111111111111', N'874e3a16-8ad0-4028-3c6c-08dbb14678af', NULL, 1, 0, N'SV000999', N'Cần Thơ', N'Cần Thơ', N'123 Đường 3/2, Cần Thơ', N'123 Đường 3/2, Cần Thơ', N'Kinh', N'Không', N'Đại học', N'Nguyễn Văn Cha', N'Kỹ sư', N'Lê Thị Mẹ', N'Giáo viên', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, N'', NULL, 0, N'https://github.com/HMean0309', N'sv_test_full@taydo.edu.vn');
GO

-- 3. TẠO 22 MÔN HỌC CNTT TRAI DÀI (Subjects)
INSERT [dbo].[Subjects] ([Id], [FacultyId], [SubjectCode], [Name], [CreditPoint], [TotalHours], [Note], [IsActived], [IsDeleted]) VALUES 
(N'e5555555-5555-5555-5555-555555555501', NULL, N'CNTT100', N'Nhập môn Công nghệ thông tin', 3, 45, N'', 1, 0),
(N'e5555555-5555-5555-5555-555555555502', NULL, N'CNTT101', N'Cấu trúc dữ liệu và giải thuật', 3, 45, N'', 1, 0),
(N'e5555555-5555-5555-5555-555555555503', NULL, N'CNTT102', N'Cơ sở dữ liệu', 3, 45, N'', 1, 0),
(N'e5555555-5555-5555-5555-555555555504', NULL, N'CNTT103', N'Kỹ thuật lập trình C/C++', 3, 45, N'', 1, 0),
(N'e5555555-5555-5555-5555-555555555505', NULL, N'CNTT201', N'Lập trình hướng đối tượng', 3, 45, N'', 1, 0),
(N'e5555555-5555-5555-5555-555555555506', NULL, N'CNTT202', N'Lập trình web', 3, 45, N'', 1, 0),
(N'e5555555-5555-5555-5555-555555555507', NULL, N'CNTT203', N'Mạng máy tính', 3, 45, N'', 1, 0),
(N'e5555555-5555-5555-5555-555555555508', NULL, N'CNTT204', N'Hệ điều hành', 3, 45, N'', 1, 0),
(N'e5555555-5555-5555-5555-555555555509', NULL, N'CNTT205', N'Phân tích và thiết kế hệ thống thông tin', 3, 45, N'', 1, 0),
(N'e5555555-5555-5555-5555-555555555510', NULL, N'KTPM301', N'Phát triển ứng dụng Node.js', 3, 45, N'', 1, 0),
(N'e5555555-5555-5555-5555-555555555511', NULL, N'KTPM302', N'Cơ sở dữ liệu nâng cao', 3, 45, N'', 1, 0),
(N'e5555555-5555-5555-5555-555555555512', NULL, N'KTPM303', N'Kiến trúc phần mềm', 3, 45, N'', 1, 0),
(N'e5555555-5555-5555-5555-555555555513', NULL, N'CNTT301', N'Điện toán đám mây (Cloud Computing)', 3, 45, N'', 1, 0),
(N'e5555555-5555-5555-5555-555555555514', NULL, N'CNTT302', N'An toàn và bảo mật thông tin', 3, 45, N'', 1, 0),
(N'e5555555-5555-5555-5555-555555555515', NULL, N'CNTT303', N'Lập trình thiết bị di động (React Native)', 3, 45, N'', 1, 0),
(N'e5555555-5555-5555-5555-555555555516', NULL, N'CNTT304', N'Lập trình Java nâng cao', 3, 45, N'', 1, 0),
(N'e5555555-5555-5555-5555-555555555517', NULL, N'CNTT305', N'Lập trình C# và .NET Core', 3, 45, N'', 1, 0),
(N'e5555555-5555-5555-5555-555555555518', NULL, N'CNTT401', N'Phân tích và xử lý dữ liệu với Python', 3, 45, N'', 1, 0),
(N'e5555555-5555-5555-5555-555555555519', NULL, N'CNTT402', N'Kiểm thử và đảm bảo chất lượng phần mềm', 3, 45, N'', 1, 0),
(N'e5555555-5555-5555-5555-555555555520', NULL, N'CNTT403', N'Quản trị hệ thống Linux & Docker', 3, 45, N'', 1, 0),
(N'e5555555-5555-5555-5555-555555555521', NULL, N'CNTT404', N'Nhập môn Trí tuệ nhân tạo và Học máy', 3, 45, N'', 1, 0),
(N'e5555555-5555-5555-5555-555555555522', NULL, N'CNTT405', N'Thực tập doanh nghiệp & Đồ án tốt nghiệp', 10, 150, N'', 1, 0);
GO

-- 4. TẠO LỚP HỌC (SubjectTeachings)
INSERT [dbo].[SubjectTeachings] ([Id], [SubjectId], [Name], [StartDate], [EndDate], [TotalSessions], [RoomIdDefault], [IsDeleted]) VALUES 
(N'ea011111-1111-1111-1111-111111111101', N'e5555555-5555-5555-5555-555555555501', N'Lớp Nhập môn CNTT', CAST(N'2022-09-01T00:00:00.0000000' AS DateTime2), CAST(N'2023-01-01T00:00:00.0000000' AS DateTime2), 15, NULL, 0),
(N'ea021111-1111-1111-1111-111111111102', N'e5555555-5555-5555-5555-555555555502', N'Lớp CTDL & GT', CAST(N'2022-09-01T00:00:00.0000000' AS DateTime2), CAST(N'2023-01-01T00:00:00.0000000' AS DateTime2), 15, NULL, 0),
(N'ea031111-1111-1111-1111-111111111103', N'e5555555-5555-5555-5555-555555555503', N'Lớp CSDL cơ bản', CAST(N'2023-01-15T00:00:00.0000000' AS DateTime2), CAST(N'2023-06-01T00:00:00.0000000' AS DateTime2), 15, NULL, 0),
(N'ea041111-1111-1111-1111-111111111104', N'e5555555-5555-5555-5555-555555555504', N'Lớp C/C++', CAST(N'2023-01-15T00:00:00.0000000' AS DateTime2), CAST(N'2023-06-01T00:00:00.0000000' AS DateTime2), 15, NULL, 0),
(N'ea051111-1111-1111-1111-111111111105', N'e5555555-5555-5555-5555-555555555505', N'Lớp OOP', CAST(N'2023-09-01T00:00:00.0000000' AS DateTime2), CAST(N'2024-01-01T00:00:00.0000000' AS DateTime2), 15, NULL, 0),
(N'ea061111-1111-1111-1111-111111111106', N'e5555555-5555-5555-5555-555555555506', N'Lớp Web cơ bản', CAST(N'2023-09-01T00:00:00.0000000' AS DateTime2), CAST(N'2024-01-01T00:00:00.0000000' AS DateTime2), 15, NULL, 0),
(N'ea071111-1111-1111-1111-111111111107', N'e5555555-5555-5555-5555-555555555507', N'Lớp Mạng máy tính', CAST(N'2024-01-15T00:00:00.0000000' AS DateTime2), CAST(N'2024-06-01T00:00:00.0000000' AS DateTime2), 15, NULL, 0),
(N'ea081111-1111-1111-1111-111111111108', N'e5555555-5555-5555-5555-555555555508', N'Lớp Hệ điều hành', CAST(N'2024-01-15T00:00:00.0000000' AS DateTime2), CAST(N'2024-06-01T00:00:00.0000000' AS DateTime2), 15, NULL, 0),
(N'ea091111-1111-1111-1111-111111111109', N'e5555555-5555-5555-5555-555555555509', N'Lớp PT&TK Hệ thống', CAST(N'2024-09-01T00:00:00.0000000' AS DateTime2), CAST(N'2025-01-01T00:00:00.0000000' AS DateTime2), 15, NULL, 0),
(N'ea101111-1111-1111-1111-111111111110', N'e5555555-5555-5555-5555-555555555510', N'Lớp Node.js', CAST(N'2024-09-01T00:00:00.0000000' AS DateTime2), CAST(N'2025-01-01T00:00:00.0000000' AS DateTime2), 15, NULL, 0),
(N'ea111111-1111-1111-1111-111111111111', N'e5555555-5555-5555-5555-555555555511', N'Lớp CSDL nâng cao', CAST(N'2025-01-15T00:00:00.0000000' AS DateTime2), CAST(N'2025-06-01T00:00:00.0000000' AS DateTime2), 15, NULL, 0),
(N'ea121111-1111-1111-1111-111111111112', N'e5555555-5555-5555-5555-555555555512', N'Lớp Kiến trúc phần mềm', CAST(N'2025-01-15T00:00:00.0000000' AS DateTime2), CAST(N'2025-06-01T00:00:00.0000000' AS DateTime2), 15, NULL, 0),
(N'ea131111-1111-1111-1111-111111111113', N'e5555555-5555-5555-5555-555555555513', N'Lớp Cloud Computing', CAST(N'2025-01-15T00:00:00.0000000' AS DateTime2), CAST(N'2025-06-01T00:00:00.0000000' AS DateTime2), 15, NULL, 0),
(N'ea141111-1111-1111-1111-111111111114', N'e5555555-5555-5555-5555-555555555514', N'Lớp Bảo mật thông tin', CAST(N'2025-09-01T00:00:00.0000000' AS DateTime2), CAST(N'2026-01-01T00:00:00.0000000' AS DateTime2), 15, NULL, 0),
(N'ea151111-1111-1111-1111-111111111115', N'e5555555-5555-5555-5555-555555555515', N'Lớp React Native', CAST(N'2025-09-01T00:00:00.0000000' AS DateTime2), CAST(N'2026-01-01T00:00:00.0000000' AS DateTime2), 15, NULL, 0),
(N'ea161111-1111-1111-1111-111111111116', N'e5555555-5555-5555-5555-555555555516', N'Lớp Java nâng cao', CAST(N'2025-09-01T00:00:00.0000000' AS DateTime2), CAST(N'2026-01-01T00:00:00.0000000' AS DateTime2), 15, NULL, 0),
(N'ea171111-1111-1111-1111-111111111117', N'e5555555-5555-5555-5555-555555555517', N'Lớp .NET Core API', CAST(N'2025-09-01T00:00:00.0000000' AS DateTime2), CAST(N'2026-01-01T00:00:00.0000000' AS DateTime2), 15, NULL, 0),
(N'ea181111-1111-1111-1111-111111111118', N'e5555555-5555-5555-5555-555555555518', N'Lớp Python Data', CAST(N'2026-01-15T00:00:00.0000000' AS DateTime2), CAST(N'2026-06-01T00:00:00.0000000' AS DateTime2), 15, NULL, 0),
(N'ea191111-1111-1111-1111-111111111119', N'e5555555-5555-5555-5555-555555555519', N'Lớp Software Testing', CAST(N'2026-01-15T00:00:00.0000000' AS DateTime2), CAST(N'2026-06-01T00:00:00.0000000' AS DateTime2), 15, NULL, 0),
(N'ea201111-1111-1111-1111-111111111120', N'e5555555-5555-5555-5555-555555555520', N'Lớp Linux & Docker', CAST(N'2026-01-15T00:00:00.0000000' AS DateTime2), CAST(N'2026-06-01T00:00:00.0000000' AS DateTime2), 15, NULL, 0),
(N'ea211111-1111-1111-1111-111111111121', N'e5555555-5555-5555-5555-555555555521', N'Lớp AI / Machine Learning', CAST(N'2026-01-15T00:00:00.0000000' AS DateTime2), CAST(N'2026-06-01T00:00:00.0000000' AS DateTime2), 15, NULL, 0),
(N'ea221111-1111-1111-1111-111111111122', N'e5555555-5555-5555-5555-555555555522', N'Đồ án Tốt nghiệp CNTT', CAST(N'2026-01-15T00:00:00.0000000' AS DateTime2), CAST(N'2026-06-01T00:00:00.0000000' AS DateTime2), 30, NULL, 0);
GO

-- 5. TẠO THI CUỐI KỲ (SubjectTeachingExams)
INSERT [dbo].[SubjectTeachingExams] ([Id], [SubjectTeachingId], [Name], [StartDate], [EndDate], [IsDeleted], [Type], [Count], [NumOfEasy], [NumOfNormal], [NumOfHard], [NumOfPractice], [Method], [AllowNotifyStudent], [Notes]) VALUES 
(N'e6666666-6666-6666-6666-666666666601', N'ea011111-1111-1111-1111-111111111101', N'Thi Nhập môn CNTT', CAST(N'2023-01-01T00:00:00.0000000' AS DateTime2), CAST(N'2023-01-01T02:00:00.0000000' AS DateTime2), 0, 1, 0, 0, 0, 0, 0, 1, 1, N''),
(N'e6666666-6666-6666-6666-666666666602', N'ea021111-1111-1111-1111-111111111102', N'Thi CTDL & GT', CAST(N'2023-01-02T00:00:00.0000000' AS DateTime2), CAST(N'2023-01-02T02:00:00.0000000' AS DateTime2), 0, 1, 0, 0, 0, 0, 0, 1, 1, N''),
(N'e6666666-6666-6666-6666-666666666603', N'ea031111-1111-1111-1111-111111111103', N'Thi CSDL cơ bản', CAST(N'2023-06-01T00:00:00.0000000' AS DateTime2), CAST(N'2023-06-01T02:00:00.0000000' AS DateTime2), 0, 1, 0, 0, 0, 0, 0, 1, 1, N''),
(N'e6666666-6666-6666-6666-666666666604', N'ea041111-1111-1111-1111-111111111104', N'Thi C/C++', CAST(N'2023-06-02T00:00:00.0000000' AS DateTime2), CAST(N'2023-06-02T02:00:00.0000000' AS DateTime2), 0, 1, 0, 0, 0, 0, 0, 1, 1, N''),
(N'e6666666-6666-6666-6666-666666666605', N'ea051111-1111-1111-1111-111111111105', N'Thi OOP', CAST(N'2024-01-01T00:00:00.0000000' AS DateTime2), CAST(N'2024-01-01T02:00:00.0000000' AS DateTime2), 0, 1, 0, 0, 0, 0, 0, 1, 1, N''),
(N'e6666666-6666-6666-6666-666666666606', N'ea061111-1111-1111-1111-111111111106', N'Thi Web cơ bản', CAST(N'2024-01-02T00:00:00.0000000' AS DateTime2), CAST(N'2024-01-02T02:00:00.0000000' AS DateTime2), 0, 1, 0, 0, 0, 0, 0, 1, 1, N''),
(N'e6666666-6666-6666-6666-666666666607', N'ea071111-1111-1111-1111-111111111107', N'Thi Mạng máy tính', CAST(N'2024-06-01T00:00:00.0000000' AS DateTime2), CAST(N'2024-06-01T02:00:00.0000000' AS DateTime2), 0, 1, 0, 0, 0, 0, 0, 1, 1, N''),
(N'e6666666-6666-6666-6666-666666666608', N'ea081111-1111-1111-1111-111111111108', N'Thi Hệ điều hành', CAST(N'2024-06-02T00:00:00.0000000' AS DateTime2), CAST(N'2024-06-02T02:00:00.0000000' AS DateTime2), 0, 1, 0, 0, 0, 0, 0, 1, 1, N''),
(N'e6666666-6666-6666-6666-666666666609', N'ea091111-1111-1111-1111-111111111109', N'Thi PT&TK Hệ thống', CAST(N'2025-01-01T00:00:00.0000000' AS DateTime2), CAST(N'2025-01-01T02:00:00.0000000' AS DateTime2), 0, 1, 0, 0, 0, 0, 0, 1, 1, N''),
(N'e6666666-6666-6666-6666-666666666610', N'ea101111-1111-1111-1111-111111111110', N'Thi Node.js', CAST(N'2025-01-02T00:00:00.0000000' AS DateTime2), CAST(N'2025-01-02T02:00:00.0000000' AS DateTime2), 0, 1, 0, 0, 0, 0, 0, 1, 1, N''),
(N'e6666666-6666-6666-6666-666666666611', N'ea111111-1111-1111-1111-111111111111', N'Thi CSDL nâng cao', CAST(N'2025-06-01T00:00:00.0000000' AS DateTime2), CAST(N'2025-06-01T02:00:00.0000000' AS DateTime2), 0, 1, 0, 0, 0, 0, 0, 1, 1, N''),
(N'e6666666-6666-6666-6666-666666666612', N'ea121111-1111-1111-1111-111111111112', N'Thi Kiến trúc phần mềm', CAST(N'2025-06-02T00:00:00.0000000' AS DateTime2), CAST(N'2025-06-02T02:00:00.0000000' AS DateTime2), 0, 1, 0, 0, 0, 0, 0, 1, 1, N''),
(N'e6666666-6666-6666-6666-666666666613', N'ea131111-1111-1111-1111-111111111113', N'Thi Cloud Computing', CAST(N'2025-06-03T00:00:00.0000000' AS DateTime2), CAST(N'2025-06-03T02:00:00.0000000' AS DateTime2), 0, 1, 0, 0, 0, 0, 0, 1, 1, N''),
(N'e6666666-6666-6666-6666-666666666614', N'ea141111-1111-1111-1111-111111111114', N'Thi Bảo mật thông tin', CAST(N'2026-01-01T00:00:00.0000000' AS DateTime2), CAST(N'2026-01-01T02:00:00.0000000' AS DateTime2), 0, 1, 0, 0, 0, 0, 0, 1, 1, N''),
(N'e6666666-6666-6666-6666-666666666615', N'ea151111-1111-1111-1111-111111111115', N'Thi React Native', CAST(N'2026-01-02T00:00:00.0000000' AS DateTime2), CAST(N'2026-01-02T02:00:00.0000000' AS DateTime2), 0, 1, 0, 0, 0, 0, 0, 1, 1, N''),
(N'e6666666-6666-6666-6666-666666666616', N'ea161111-1111-1111-1111-111111111116', N'Thi Java nâng cao', CAST(N'2026-01-03T00:00:00.0000000' AS DateTime2), CAST(N'2026-01-03T02:00:00.0000000' AS DateTime2), 0, 1, 0, 0, 0, 0, 0, 1, 1, N''),
(N'e6666666-6666-6666-6666-666666666617', N'ea171111-1111-1111-1111-111111111117', N'Thi .NET Core API', CAST(N'2026-01-04T00:00:00.0000000' AS DateTime2), CAST(N'2026-01-04T02:00:00.0000000' AS DateTime2), 0, 1, 0, 0, 0, 0, 0, 1, 1, N''),
(N'e6666666-6666-6666-6666-666666666618', N'ea181111-1111-1111-1111-111111111118', N'Thi Python Data', CAST(N'2026-06-01T00:00:00.0000000' AS DateTime2), CAST(N'2026-06-01T02:00:00.0000000' AS DateTime2), 0, 1, 0, 0, 0, 0, 0, 1, 1, N''),
(N'e6666666-6666-6666-6666-666666666619', N'ea191111-1111-1111-1111-111111111119', N'Thi Software Testing', CAST(N'2026-06-02T00:00:00.0000000' AS DateTime2), CAST(N'2026-06-02T02:00:00.0000000' AS DateTime2), 0, 1, 0, 0, 0, 0, 0, 1, 1, N''),
(N'e6666666-6666-6666-6666-666666666620', N'ea201111-1111-1111-1111-111111111120', N'Thi Linux & Docker', CAST(N'2026-06-03T00:00:00.0000000' AS DateTime2), CAST(N'2026-06-03T02:00:00.0000000' AS DateTime2), 0, 1, 0, 0, 0, 0, 0, 1, 1, N''),
(N'e6666666-6666-6666-6666-666666666621', N'ea211111-1111-1111-1111-111111111121', N'Thi AI / Machine Learning', CAST(N'2026-06-04T00:00:00.0000000' AS DateTime2), CAST(N'2026-06-04T02:00:00.0000000' AS DateTime2), 0, 1, 0, 0, 0, 0, 0, 1, 1, N''),
(N'e6666666-6666-6666-6666-666666666622', N'ea221111-1111-1111-1111-111111111122', N'Bảo vệ Đồ án Tốt nghiệp', CAST(N'2026-01-15T00:00:00.0000000' AS DateTime2), CAST(N'2026-06-10T05:00:00.0000000' AS DateTime2), 0, 1, 0, 0, 0, 0, 0, 1, 1, N'');
GO

-- 6. GẮN ĐIỂM THI CHO SINH VIÊN (ExamResults)
INSERT [dbo].[ExamResults] ([Id], [SubjectTeachingExamId], [StudentId], [ExamAttemptId], [Result], [CombinedResult], [Notes], [ExamResultDesc], [ExamResultDetail], [IsDeleted]) VALUES 
(N'e7777777-7777-7777-7777-777777777701', N'e6666666-6666-6666-6666-666666666601', N'e4444444-4444-4444-4444-444444444444', NULL, 9.0, 9.0, N'Xuất sắc', N'Điểm môn Nhập môn CNTT', N'', 0),
(N'e7777777-7777-7777-7777-777777777702', N'e6666666-6666-6666-6666-666666666602', N'e4444444-4444-4444-4444-444444444444', NULL, 8.0, 8.0, N'Giỏi', N'Điểm môn Cấu trúc dữ liệu và giải thuật', N'', 0),
(N'e7777777-7777-7777-7777-777777777703', N'e6666666-6666-6666-6666-666666666603', N'e4444444-4444-4444-4444-444444444444', NULL, 9.0, 9.0, N'Xuất sắc', N'Điểm môn Cơ sở dữ liệu', N'', 0),
(N'e7777777-7777-7777-7777-777777777704', N'e6666666-6666-6666-6666-666666666604', N'e4444444-4444-4444-4444-444444444444', NULL, 8.5, 8.5, N'Giỏi', N'Điểm môn Kỹ thuật lập trình C/C++', N'', 0),
(N'e7777777-7777-7777-7777-777777777705', N'e6666666-6666-6666-6666-666666666605', N'e4444444-4444-4444-4444-444444444444', NULL, 9.0, 9.0, N'Xuất sắc', N'Điểm môn Lập trình hướng đối tượng', N'', 0),
(N'e7777777-7777-7777-7777-777777777706', N'e6666666-6666-6666-6666-666666666606', N'e4444444-4444-4444-4444-444444444444', NULL, 8.5, 8.5, N'Giỏi', N'Điểm môn Lập trình web', N'', 0),
(N'e7777777-7777-7777-7777-777777777707', N'e6666666-6666-6666-6666-666666666607', N'e4444444-4444-4444-4444-444444444444', NULL, 7.5, 7.5, N'Khá', N'Điểm môn Mạng máy tính', N'', 0),
(N'e7777777-7777-7777-7777-777777777708', N'e6666666-6666-6666-6666-666666666608', N'e4444444-4444-4444-4444-444444444444', NULL, 8.0, 8.0, N'Giỏi', N'Điểm môn Hệ điều hành', N'', 0),
(N'e7777777-7777-7777-7777-777777777709', N'e6666666-6666-6666-6666-666666666609', N'e4444444-4444-4444-4444-444444444444', NULL, 8.5, 8.5, N'Giỏi', N'Điểm môn Phân tích và thiết kế hệ thống', N'', 0),
(N'e7777777-7777-7777-7777-777777777710', N'e6666666-6666-6666-6666-666666666610', N'e4444444-4444-4444-4444-444444444444', NULL, 9.0, 9.0, N'Xuất sắc', N'Điểm môn Phát triển ứng dụng Node.js', N'', 0),
(N'e7777777-7777-7777-7777-777777777711', N'e6666666-6666-6666-6666-666666666611', N'e4444444-4444-4444-4444-444444444444', NULL, 8.5, 8.5, N'Giỏi', N'Điểm môn Cơ sở dữ liệu nâng cao', N'', 0),
(N'e7777777-7777-7777-7777-777777777712', N'e6666666-6666-6666-6666-666666666612', N'e4444444-4444-4444-4444-444444444444', NULL, 9.5, 9.5, N'Xuất sắc', N'Điểm môn Kiến trúc phần mềm', N'', 0),
(N'e7777777-7777-7777-7777-777777777713', N'e6666666-6666-6666-6666-666666666613', N'e4444444-4444-4444-4444-444444444444', NULL, 9.0, 9.0, N'Xuất sắc', N'Điểm môn Điện toán đám mây', N'', 0),
(N'e7777777-7777-7777-7777-777777777714', N'e6666666-6666-6666-6666-666666666614', N'e4444444-4444-4444-4444-444444444444', NULL, 8.5, 8.5, N'Giỏi', N'Điểm môn An toàn và bảo mật thông tin', N'', 0),
(N'e7777777-7777-7777-7777-777777777715', N'e6666666-6666-6666-6666-666666666615', N'e4444444-4444-4444-4444-444444444444', NULL, 8.5, 8.5, N'Giỏi', N'Điểm môn Lập trình thiết bị di động', N'', 0),
(N'e7777777-7777-7777-7777-777777777716', N'e6666666-6666-6666-6666-666666666616', N'e4444444-4444-4444-4444-444444444444', NULL, 9.0, 9.0, N'Xuất sắc', N'Điểm môn Lập trình Java nâng cao', N'', 0),
(N'e7777777-7777-7777-7777-777777777717', N'e6666666-6666-6666-6666-666666666617', N'e4444444-4444-4444-4444-444444444444', NULL, 9.5, 9.5, N'Xuất sắc', N'Điểm môn Lập trình C# và .NET Core', N'', 0),
(N'e7777777-7777-7777-7777-777777777718', N'e6666666-6666-6666-6666-666666666618', N'e4444444-4444-4444-4444-444444444444', NULL, 8.5, 8.5, N'Giỏi', N'Điểm môn Phân tích dữ liệu với Python', N'', 0),
(N'e7777777-7777-7777-7777-777777777719', N'e6666666-6666-6666-6666-666666666619', N'e4444444-4444-4444-4444-444444444444', NULL, 8.0, 8.0, N'Giỏi', N'Điểm môn Software Testing', N'', 0),
(N'e7777777-7777-7777-7777-777777777720', N'e6666666-6666-6666-6666-666666666620', N'e4444444-4444-4444-4444-444444444444', NULL, 9.0, 9.0, N'Xuất sắc', N'Điểm môn Linux & Docker', N'', 0),
(N'e7777777-7777-7777-7777-777777777721', N'e6666666-6666-6666-6666-666666666621', N'e4444444-4444-4444-4444-444444444444', NULL, 8.5, 8.5, N'Giỏi', N'Điểm môn Trí tuệ nhân tạo', N'', 0),
(N'e7777777-7777-7777-7777-777777777722', N'e6666666-6666-6666-6666-666666666622', N'e4444444-4444-4444-4444-444444444444', NULL, 9.5, 9.5, N'Xuất sắc', N'Điểm Đồ án Tốt nghiệp', N'', 0);
GO

-- 7. DỮ LIỆU ĐỒ ÁN (Projects) — 5 DỰ ÁN VỚI MÔ TẢ CHI TIẾT ĐỂ TEST KHẢ NĂNG TÓM TẮT CỦA LLM
INSERT [dbo].[Projects] ([Id], [StudentId], [ProjectName], [Role], [Technologies], [Description], [GitUrl], [DemoUrl], [StartDate], [EndDate], [CreationDate], [IsDeleted]) VALUES 
(NEWID(), N'e4444444-4444-4444-4444-444444444444', 
 N'Hệ thống Backend E-Commerce Microservices', 
 N'Trưởng nhóm Backend / Lead Developer', 
 N'Node.js, Express.js, TypeScript, Redis, SQL Server, Docker, RabbitMQ, REST API, Git', 
 N'Dự án xây dựng toàn bộ hệ thống backend xử lý giao dịch thương mại điện tử quy mô vừa theo kiến trúc Microservices. Dự án bao gồm các dịch vụ độc lập: Auth Service (quản lý JWT token và phân quyền RBAC), Product Catalog Service (quản lý danh mục hàng hóa sử dụng Redis cache để tăng tốc truy vấn), Order Service (xử lý đơn hàng, tích hợp RabbitMQ để gửi thông báo bất đồng bộ) và Payment Service (tích hợp cổng thanh toán MoMo và VNPAY). Đã thiết kế database SQL Server với các index tối ưu giúp giảm độ trễ query từ 250ms xuống còn dưới 45ms. Áp dụng Clean Architecture, Dockerize toàn bộ các microservices và thiết lập pipeline CI/CD với GitHub Actions để tự động hóa kiểm thử và triển khai lên môi trường thử nghiệm.', 
 N'https://github.com/HMean0309/ecommerce-microservices-backend', 
 N'https://api-demo.ecommerce-taydo.io.vn', 
 CAST(N'2024-08-01T00:00:00.0000000' AS DateTime2), CAST(N'2024-12-15T00:00:00.0000000' AS DateTime2), GETUTCDATE(), 0),

(NEWID(), N'e4444444-4444-4444-4444-444444444444', 
 N'Hệ thống Quản lý và Điểm danh Sinh viên Thông minh', 
 N'Fullstack Developer', 
 N'C# .NET 8 Web API, Entity Framework Core, ReactJS, SQL Server, JWT, Tailwind CSS, Recharts', 
 N'Xây dựng giải pháp tổng thể hỗ trợ nhà trường và giảng viên quản lý hồ sơ sinh viên, điểm danh tự động và theo dõi tiến độ hoàn thành các tiêu chí PLO/CLO. Backend được phát triển bằng .NET 8 Web API áp dụng Repository Pattern và Unit of Work, cung cấp hơn 30 RESTful API endpoints có bảo mật JWT Bearer Authentication. Frontend sử dụng ReactJS kết hợp Tailwind CSS tạo giao diện Dashboard trực quan với các biểu đồ thống kê từ Recharts. Hệ thống cho phép xuất báo cáo điểm và lịch sử học tập ra file Excel và PDF trực tiếp trên trình duyệt, giảm 60% thời gian xử lý thủ công của cán bộ quản lý.', 
 N'https://github.com/HMean0309/student-management-dotnet-react', 
 N'https://student-system.taydo.edu.vn', 
 CAST(N'2024-01-10T00:00:00.0000000' AS DateTime2), CAST(N'2024-06-20T00:00:00.0000000' AS DateTime2), GETUTCDATE(), 0),

(NEWID(), N'e4444444-4444-4444-4444-444444444444', 
 N'Ứng dụng Di động Tìm kiếm & Đặt Lịch Sân Thể thao', 
 N'Mobile App Developer', 
 N'React Native, Expo, Firebase Authentication, Node.js, Express, MongoDB, Socket.io, Google Maps API', 
 N'Phát triển ứng dụng di động đa nền tảng (iOS và Android) giúp người dùng dễ dàng tìm kiếm sân bóng đá, cầu lông gần vị trí hiện tại dựa trên Google Maps API, xem lịch sân trống theo giờ và thực hiện đặt sân trực tuyến. Tích hợp Socket.io cho phép chủ sân và khách hàng chat trực tiếp thời gian thực, đồng thời gửi thông báo đẩy (Push Notifications) khi đơn đặt sân được xác nhận. Tích hợp SDK thanh toán MoMo và ZaloPay. Đã triển khai thử nghiệm trên 15 sân tập thực tế với hơn 500 người dùng hàng tháng.', 
 N'https://github.com/HMean0309/sports-booking-mobile-app', 
 N'https://expo.dev/@hmean/sports-booking-app', 
 CAST(N'2023-09-01T00:00:00.0000000' AS DateTime2), CAST(N'2023-12-30T00:00:00.0000000' AS DateTime2), GETUTCDATE(), 0),

(NEWID(), N'e4444444-4444-4444-4444-444444444444', 
 N'Dịch vụ Trích xuất & Chấm điểm Hồ sơ Tuyển dụng tự động', 
 N'AI Software Engineer', 
 N'Python 3.10, FastAPI, PyMuPDF, Sentence-Transformers, RapidFuzz, Docker, Pydantic', 
 N'Xây dựng microservice độc lập chịu trách nhiệm trích xuất văn bản từ file JD (PDF/DOCX), phân tích cú pháp hồ sơ sinh viên và tính điểm tương thích (Match Score) dựa trên mô hình Vector Embedding đa ngôn ngữ (Sentence Transformers). Sử dụng thư viện RapidFuzz để chuẩn hóa tên môn học tiếng Việt không dấu và đối chiếu danh mục kỹ năng. Tích hợp cơ chế Failover Gọi LLM 3 lớp (Groq Llama 3.1 ➔ Gemini 2.0 ➔ Mock Data) giúp hệ thống hoạt động liên tục 24/7 không bị gián đoạn khi API bên thứ ba gặp sự cố. Kết quả trả về dưới dạng JSON chuẩn ATS đạt thời gian phản hồi trung bình dưới 1.8 giây.', 
 N'https://github.com/HMean0309/ai-cv-parser-service', 
 N'https://ai-engine.generalcv.io.vn/docs', 
 CAST(N'2025-02-01T00:00:00.0000000' AS DateTime2), CAST(N'2025-05-30T00:00:00.0000000' AS DateTime2), GETUTCDATE(), 0),

(NEWID(), N'e4444444-4444-4444-4444-444444444444', 
 N'Website Giới thiệu Tiệm Bánh ngọt & Đặt Bánh Sinh nhật Online', 
 N'Lập trình viên Web cá nhân', 
 N'PHP Native, MySQL, Bootstrap 4, HTML5/CSS3, jQuery', 
 N'Xây dựng website bán hàng đơn giản cho tiệm bánh gia đình. Cho phép xem danh mục các loại bánh ngọt, xem hình ảnh sản phẩm, chọn kích thước bánh và điền thông tin giao hàng để gửi đơn đặt bánh trực tiếp về Zalo của chủ tiệm. Sử dụng MySQL lưu trữ danh mục và Bootstrap 4 cho giao diện hiển thị cơ bản.', 
 N'https://github.com/HMean0309/bakery-online-shop', 
 N'https://tiembanhngot-demo.net', 
 CAST(N'2022-10-01T00:00:00.0000000' AS DateTime2), CAST(N'2022-11-15T00:00:00.0000000' AS DateTime2), GETUTCDATE(), 0);
GO

-- 8. DỮ LIỆU CHỨNG CHỈ (Certificates) — 3 CHỨNG CHỈ IT/NGOẠI NGỮ + 2 CHỨNG CHỈ KHÔNG LIÊN QUAN ĐỂ TEST AI FILTERING
INSERT [dbo].[Certificates] ([Id], [StudentId], [CertificateName], [Issuer], [IssueDate], [CertificateUrl], [CreationDate], [IsDeleted]) VALUES 
(NEWID(), N'e4444444-4444-4444-4444-444444444444', N'AWS Certified Developer - Associate', N'Amazon Web Services (AWS)', CAST(N'2024-03-15T00:00:00.0000000' AS DateTime2), N'https://aws.amazon.com/verification/AWS-DEV-2024-8891', GETUTCDATE(), 0),
(NEWID(), N'e4444444-4444-4444-4444-444444444444', N'Node.js Application Developer & Microservices Security', N'freeCodeCamp', CAST(N'2023-11-20T00:00:00.0000000' AS DateTime2), N'https://freecodecamp.org/certification/hmean/node-js-developer', GETUTCDATE(), 0),
(NEWID(), N'e4444444-4444-4444-4444-444444444444', N'TOEIC Listening & Reading 780/990', N'IIG Vietnam', CAST(N'2023-08-10T00:00:00.0000000' AS DateTime2), N'https://iigvietnam.com/verify/TOEIC-780-HM', GETUTCDATE(), 0),
(NEWID(), N'e4444444-4444-4444-4444-444444444444', N'Chứng chỉ Sơ cấp Nghệ thuật Nấu ăn & Pha chế Đồ uống', N'Trung tâm Dạy nghề Cần Thơ', CAST(N'2022-06-18T00:00:00.0000000' AS DateTime2), N'https://daynghecantho.edu.vn/cert/cooking-2022', GETUTCDATE(), 0),
(NEWID(), N'e4444444-4444-4444-4444-444444444444', N'Chứng nhận Huấn luyện Kỹ năng Sơ cấp cứu & PCCC', N'Hội Chữ Thập Đỏ Thành phố Cần Thơ', CAST(N'2021-12-05T00:00:00.0000000' AS DateTime2), N'https://redcross-cantho.org.vn/cert/pccc-2021', GETUTCDATE(), 0);
GO

-- 9. TẠO ĐÁNH GIÁ PLO (StudentEvaluations & Details)
INSERT [dbo].[EvaluationCriterias] ([Id], [Name], [Description], [Type], [Score], [ParentId], [QuestionId]) VALUES 
(N'e8888888-8888-8888-8888-888888888881', N'Thiết kế hệ thống RESTful API', N'Khả năng thiết kế, chuẩn hóa và xây dựng các API RESTful chất lượng cao', 1, 10.00, NULL, NULL),
(N'e8888888-8888-8888-8888-888888888882', N'Tối ưu hóa câu lệnh truy vấn SQL', N'Năng lực tối ưu hóa index, cấu trúc câu lệnh và hiệu năng database', 1, 10.00, NULL, NULL),
(N'e8888888-8888-8888-8888-888888888883', N'Lập trình hướng đối tượng (OOP)', N'Áp dụng các nguyên lý SOLID, Design Patterns và Clean Code', 1, 10.00, NULL, NULL),
(N'e8888888-8888-8888-8888-888888888884', N'Quản lý phiên bản với Git', N'Kỹ năng sử dụng Git/GitHub, branching strategy và collaborative workflow', 1, 10.00, NULL, NULL),
(N'e8888888-8888-8888-8888-888888888885', N'Phân tích yêu cầu phần mềm', N'Khả năng thu thập, phân tích và mô hình hóa yêu cầu hệ thống', 1, 10.00, NULL, NULL),
(N'e8888888-8888-8888-8888-888888888886', N'Kiểm thử phần mềm', N'Kỹ năng viết test case, unit test và integration test', 1, 10.00, NULL, NULL);

INSERT [dbo].[StudentEvaluations] ([Id], [StudentId], [SubjectTeachingId], [SemesterPlanId], [SubjectTeachingExamId], [QuestionId], [TeacherId], [TeacherName], [Type], [Comment], [TotalScore], [CreationDate], [UpdatedDate], [IsDeleted]) VALUES 
(N'e9999999-9999-9999-9999-999999999999', N'e4444444-4444-4444-4444-444444444444', NULL, NULL, NULL, NULL, NULL, N'Hệ thống', 1, N'Đánh giá năng lực tích lũy PLO tự động', 8.85, GETUTCDATE(), NULL, 0);

INSERT [dbo].[StudentEvaluationDetails] ([Id], [StudentEvaluationId], [EvaluationCriteriaId], [EvaluationName], [StudentScore], [Score], [IsDeleted]) VALUES 
(NEWID(), N'e9999999-9999-9999-9999-999999999999', N'e8888888-8888-8888-8888-888888888881', N'Thiết kế hệ thống RESTful API', 9.50, 10.00, 0),
(NEWID(), N'e9999999-9999-9999-9999-999999999999', N'e8888888-8888-8888-8888-888888888882', N'Tối ưu hóa câu lệnh truy vấn SQL', 8.50, 10.00, 0),
(NEWID(), N'e9999999-9999-9999-9999-999999999999', N'e8888888-8888-8888-8888-888888888883', N'Lập trình hướng đối tượng (OOP)', 9.00, 10.00, 0),
(NEWID(), N'e9999999-9999-9999-9999-999999999999', N'e8888888-8888-8888-8888-888888888884', N'Quản lý phiên bản với Git', 9.00, 10.00, 0),
(NEWID(), N'e9999999-9999-9999-9999-999999999999', N'e8888888-8888-8888-8888-888888888885', N'Phân tích yêu cầu phần mềm', 8.50, 10.00, 0),
(NEWID(), N'e9999999-9999-9999-9999-999999999999', N'e8888888-8888-8888-8888-888888888886', N'Kiểm thử phần mềm', 8.00, 10.00, 0);
GO

SELECT N'ĐÃ CẬP NHẬT THÀNH CÔNG BỘ DỮ LIỆU TEST PHONG PHÚ (22 MÔN HỌC, 5 DỰ ÁN CHI TIẾT, 5 CHỨNG CHỈ, TÀI KHOẢN ADMIN admin_test/123456)!' AS [Status];
GO
