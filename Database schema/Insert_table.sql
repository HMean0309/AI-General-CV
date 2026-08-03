-- =========================================================
-- SCRIPT KHỞI TẠO BẢNG CHO HỆ THỐNG AIGENERALCV
-- Chạy script này trên database TayDoV2 (SSMS hoặc sqlcmd)
-- =========================================================

USE TayDoV2;
GO

-- =========================================================
-- 1. Bảng Projects — lưu Kho Đồ án gốc của sinh viên
-- =========================================================
IF NOT EXISTS (
    SELECT 1 FROM sys.tables WHERE name = 'Projects'
)
BEGIN
    CREATE TABLE dbo.Projects (
        Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_Projects_Id DEFAULT NEWID(),
        StudentId UNIQUEIDENTIFIER NOT NULL,
        ProjectName NVARCHAR(255) NOT NULL,
        Role NVARCHAR(255) NULL,
        Technologies NVARCHAR(MAX) NULL,  -- VD: "ASP.NET Core, React, SQL Server"
        Description NVARCHAR(MAX) NULL,   -- Mô tả thô do sinh viên nhập
        GitUrl NVARCHAR(250) NULL,        -- Link Git repository (Github, Gitlab, Bitbucket)
        DemoUrl NVARCHAR(250) NULL,       -- Link demo/website live (nếu có)
        StartDate DATETIME2 NULL,
        EndDate DATETIME2 NULL,
        CreationDate DATETIME2 NOT NULL CONSTRAINT DF_Projects_CreationDate DEFAULT SYSUTCDATETIME(),
        IsDeleted BIT NOT NULL CONSTRAINT DF_Projects_IsDeleted DEFAULT 0,
        CONSTRAINT PK_Projects PRIMARY KEY CLUSTERED (Id),
        CONSTRAINT FK_Projects_Students_StudentId FOREIGN KEY (StudentId) REFERENCES dbo.Students (Id) ON DELETE CASCADE
    );

    CREATE NONCLUSTERED INDEX IX_Projects_StudentId ON dbo.Projects (StudentId);
    PRINT 'Đã tạo bảng Projects thành công.';
END
ELSE
BEGIN
    PRINT 'Bảng Projects đã tồn tại — bỏ qua.';
END
GO

-- =========================================================
-- 2. Bảng Certificates — lưu Kho Chứng chỉ của sinh viên
-- =========================================================
IF NOT EXISTS (
    SELECT 1 FROM sys.tables WHERE name = 'Certificates'
)
BEGIN
    CREATE TABLE dbo.Certificates (
        Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_Certificates_Id DEFAULT NEWID(),
        StudentId UNIQUEIDENTIFIER NOT NULL,
        CertificateName NVARCHAR(255) NOT NULL,
        Issuer NVARCHAR(255) NULL,        -- Tổ chức cấp (VD: British Council, Amazon)
        IssueDate DATETIME2 NULL,
        CertificateUrl NVARCHAR(MAX) NULL, -- Link ảnh/scan chứng chỉ (nếu có)
        CreationDate DATETIME2 NOT NULL CONSTRAINT DF_Certificates_CreationDate DEFAULT SYSUTCDATETIME(),
        IsDeleted BIT NOT NULL CONSTRAINT DF_Certificates_IsDeleted DEFAULT 0,
        CONSTRAINT PK_Certificates PRIMARY KEY CLUSTERED (Id),
        CONSTRAINT FK_Certificates_Students_StudentId FOREIGN KEY (StudentId) REFERENCES dbo.Students (Id) ON DELETE CASCADE
    );

    CREATE NONCLUSTERED INDEX IX_Certificates_StudentId ON dbo.Certificates (StudentId);
    PRINT 'Đã tạo bảng Certificates thành công.';
END
ELSE
BEGIN
    PRINT 'Bảng Certificates đã tồn tại — bỏ qua.';
END
GO

-- =========================================================
-- 3. Bảng GeneratedCVs — lưu Lịch sử CV được AI tự sinh (JSON)
-- =========================================================
IF NOT EXISTS (
    SELECT 1 FROM sys.tables WHERE name = 'GeneratedCVs'
)
BEGIN
    CREATE TABLE dbo.GeneratedCVs (
        Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_GeneratedCVs_Id DEFAULT NEWID(),
        StudentId UNIQUEIDENTIFIER NOT NULL,
        JobTitle NVARCHAR(200) NULL,          -- Vị trí ứng tuyển (VD: Backend Developer)
        RawJobDescription NVARCHAR(MAX) NULL, -- Đoạn mô tả JD sinh viên dán vào
        MatchScore INT NOT NULL DEFAULT 0,    -- Điểm matchScore (0 - 100)
        CvDataJson NVARCHAR(MAX) NOT NULL,    -- LƯU NGUYÊN KHỐI JSON DO AI ENGINE TRẢ VỀ!
        IsFallback BIT NOT NULL CONSTRAINT DF_GeneratedCVs_IsFallback DEFAULT 0,
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_GeneratedCVs_CreatedAt DEFAULT SYSUTCDATETIME(),
        IsDeleted BIT NOT NULL CONSTRAINT DF_GeneratedCVs_IsDeleted DEFAULT 0,
        CONSTRAINT PK_GeneratedCVs PRIMARY KEY CLUSTERED (Id),
        CONSTRAINT FK_GeneratedCVs_Students_StudentId FOREIGN KEY (StudentId) REFERENCES dbo.Students (Id) ON DELETE CASCADE
    );

    CREATE NONCLUSTERED INDEX IX_GeneratedCVs_StudentId ON dbo.GeneratedCVs (StudentId);
    PRINT 'Đã tạo bảng GeneratedCVs thành công.';
END
ELSE
BEGIN
    PRINT 'Bảng GeneratedCVs đã tồn tại — bỏ qua.';
END
GO