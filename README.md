# 🚀 AI General CV - Hệ thống Quản lý & Phân tích CV Thông Minh

Dự án Báo cáo Thực tập: Xây dựng Hệ thống Tạo, Quản lý và Phân tích CV ứng viên ứng dụng Trí tuệ nhân tạo (AI).

---

## 📌 1. Tổng quan Dự án

**AI General CV** là giải pháp toàn diện hỗ trợ sinh viên/ứng viên xây dựng CV chuyên nghiệp và giúp nhà tuyển dụng/nhà trường quản lý, đánh giá năng lực ứng viên tự động. 

Hệ thống được thiết kế theo kiến trúc Microservices / Multi-service bao gồm 3 phân hệ chính:
- 🎨 **Frontend**: Giao diện người dùng hiện đại, tương tác trực quan, responsive (Next.js 15 / React 19).
- ⚙️ **Backend API**: Xử lý nghiệp vụ chính, quản lý người dùng, phân quyền và dữ liệu (.NET 8 Web API).
- 🤖 **AI Engine**: Phân tích cú pháp (CV Parsing), trích xuất thông tin, so khớp kỹ năng đa chiều 4 trụ cột, sinh CV chuẩn A4 (Python FastAPI & Google Gemini).

---

## 🏗️ 2. Kiến trúc Hệ thống

```text
                               ┌─────────────────┐
                               │   Next.js UI    │ (Frontend - Port 3000)
                               └────────┬────────┘
                                        │
                                        ▼ (HTTP/REST + JWT)
                               ┌─────────────────┐
                               │  .NET Web API   │ (Backend - Port 5000)
                               └────┬───────┬────┘
                                    │       │
             ┌──────────────────────┘       └──────────────────────┐
             ▼                                                     ▼
┌─────────────────────────┐                               ┌─────────────────┐
│   SQL Server Database   │ (CSDL TayDoV2)                │ Python FastAPI  │ (AI Engine - Port 8000)
└─────────────────────────┘                               └────────┬────────┘
                                                                   │
                                                                   ▼
                                                          ┌─────────────────┐
                                                          │ Google Gemini   │ (LLM Cloud)
                                                          └─────────────────┘
```

---

## 🛠️ 3. Công nghệ Sử dụng

| Phân hệ | Công nghệ / Thư viện |
| :--- | :--- |
| **Frontend** | React 19, Next.js 15, Zustand, Recharts, Lucide Icons, html2pdf.js |
| **Backend API** | C# .NET 8 Web API, Entity Framework Core (EF Core), JWT Bearer Auth |
| **AI Engine** | Python 3.10+, FastAPI, Google Gemini API, RapidFuzz, Sentence Transformers |
| **Database** | SQL Server (CSDL `TayDoV2`) |

---

## ✨ 4. Tính năng Chính

- 📝 **Tạo & Tự động Tối ưu CV với AI**: Phân tích JD tuyển dụng, trích xuất hồ sơ sinh viên, tối ưu hóa câu chữ chuẩn ATS vừa vặn 1 trang A4.
- 📊 **Mô hình Chấm điểm Đa chiều (4 Trụ cột)**: Chấm điểm % độ khớp dựa trên *Kỹ năng kỹ thuật (35%)*, *Đồ án liên quan (30%)*, *Học tập & PLO (20%)*, *Chứng chỉ & Kỹ năng mềm (15%)*.
- 🎓 **Tổng hợp Hồ sơ Đào tạo & PLO/CLO**: Tự động kết nối bảng điểm thi 22 môn và chỉ số năng lực thực hành PLO/CLO.
- 🔐 **Xác thực & Phân quyền**: Đăng nhập, đăng ký, bảo mật JWT Authentication.
- 👑 **Quản trị Admin**: Dashboard quản lý Sinh viên, Người dùng, Bảng điểm thi, Danh mục Tiêu chí PLO/CLO, hỗ trợ Dark Mode.

---

## 📂 5. Cấu trúc Thư mục Dự án

```text
AIGeneralCV/
├── AI-Engine/               # Microservice xử lý AI (Python FastAPI - Port 8000)
│   ├── app/                 # Source code chính (Services, Schemas, Routers)
│   ├── tests/               # Unit tests AI Engine
│   └── requirements.txt     # Thư viện Python phụ thuộc
├── Backend/                 # RESTful API Service (.NET 8 - Port 5000)
│   ├── Controllers/         # API Controllers (CvController, AuthController...)
│   ├── DTOs/                # Data Transfer Objects
│   ├── Models/              # EF Core Entities & Data Context
│   ├── Services/            # Service layer (AiEngineService...)
│   ├── appsettings.json     # Cấu hình ConnectionString & JWT
│   └── TayDoApi.csproj      # File cấu hình C# Project
├── Frontend/                # Giao diện Web Client (Next.js 15 - Port 3000)
│   ├── src/                 # App Router (dashboard, cv-workspace, cv-history, admin...)
│   ├── public/              # Static assets
│   └── package.json         # Thư viện Node.js
├── Database schema/         # Scripts khởi tạo & test data CSDL SQL Server
│   ├── AIGeneralCVDB.sql
│   └── Update_Test_Data_Full.sql
└── README.md                # Tài liệu hướng dẫn dự án (File này)
```

---

## 🚀 6. Hướng dẫn Cài đặt & Khởi chạy Dự án

### 6.1 Yêu cầu Tiền đề (Prerequisites)
- [Node.js](https://nodejs.org/) (v18.0 trở lên)
- [.NET SDK](https://dotnet.microsoft.com/) (v8.0 trở lên)
- [Python](https://www.python.org/) (v3.10 trở lên)
- [SQL Server](https://www.microsoft.com/sql-server/) (SSMS hoặc Azure Data Studio)

---

### 6.2 Thiết lập Cơ sở Dữ liệu (Database SQL Server)

Hệ thống sử dụng Cơ sở dữ liệu SQL Server có tên `TayDoV2`. Bạn có thể khởi tạo theo **2 cách**:

#### 🔹 Cách 1: Restore từ File Backup `.bak` (Khuyên dùng - Đầy đủ dữ liệu test nhất)
1. Tải file backup database `.bak` [tại đây (Google Drive)](https://drive.google.com/file/d/1-sioh20iW0sA_MPt69hO_R_1s6mjBVoz/view?usp=sharing).
2. Mở **SQL Server Management Studio (SSMS)**.
3. Chuột phải vào thư mục **Databases** ➔ Chọn **Restore Database...**
4. Tại mục *Source*, chọn **Device** ➔ Bấm nút `...` ➔ Bấm **Add** và chọn file `TayDoV2.bak` vừa tải về.
5. Kiểm tra Target Database tên là `TayDoV2` ➔ Nhấn **OK** để tiến hành khôi phục.

#### 🔹 Cách 2: Chạy Script SQL tạo Database từ đầu
1. Mở SSMS, mở và thực thi file `Database schema/AIGeneralCVDB.sql` để tạo schema cấu trúc các bảng.
2. Mở và thực thi file `Database schema/Update_Test_Data_Full.sql` để nạp dữ liệu sinh viên mẫu và bảng điểm test.

> ⚠️ **Lưu ý cấu hình Connection String**: 
> Mở file `Backend/appsettings.json`, kiểm tra chuỗi `ConnectionStrings:DefaultConnection` và cập nhật lại `Server` cho phù hợp với máy của bạn (ví dụ: `Server=localhost\\SQLEXPRESS` hoặc `Server=localhost` hoặc `Server=.`).

---

### 6.3 Khởi chạy AI Engine (Python / FastAPI - Port 8000)

```bash
# 1. Di chuyển vào thư mục AI-Engine
cd AI-Engine

# 2. Tạo môi trường ảo Python (nếu chưa có)
python -m venv venv

# 3. Kích hoạt môi trường ảo (Windows PowerShell / CMD):
venv\Scripts\activate

# 4. Cài đặt các thư viện cần thiết:
pip install -r requirements.txt

# 5. Khởi chạy server FastAPI:
uvicorn app.main:app --reload --port 8000
```
📍 **AI Engine Swagger API Docs:** `http://localhost:8000/docs`

---

### 6.4 Khởi chạy Backend API (.NET 8 - Port 5000)

```bash
# 1. Di chuyển vào thư mục Backend
cd Backend

# 2. Khôi phục packages & chạy dự án:
dotnet restore
dotnet run
```
📍 **Backend Swagger UI:** `http://localhost:5000/swagger`

---

### 6.5 Khởi chạy Frontend (Next.js - Port 3000)

```bash
# 1. Di chuyển vào thư mục Frontend
cd Frontend

# 2. Cài đặt packages Node.js & khởi chạy Dev Server:
npm install
npm run dev
```
📍 **Trang web ứng dụng:** `http://localhost:3000`

---

## 🔑 7. Tài khoản Đăng nhập Mẫu (Test Accounts)

Bạn có thể sử dụng 2 tài khoản test đã được cài đặt sẵn đầy đủ dữ liệu:

| Vai trò | Tên đăng nhập | Mật khẩu | Mô tả dữ liệu test |
| :--- | :--- | :--- | :--- |
| **🎓 Sinh viên** | `sv_test_full` | `123456` |
| **👑 Quản trị viên (Admin)** | `admin_test` | `123456` |
