# 🚀 AI General CV - Hệ thống Quản lý & Phân tích CV Thông Minh

Dự án Báo cáo Thực tập: Xây dựng Hệ thống Tạo, Quản lý và Phân tích CV ứng viên ứng dụng Trí tuệ nhân tạo (AI).

---

## 📌 1. Tổng quan Dự án

**AI General CV** là giải pháp toàn diện hỗ trợ ứng viên xây dựng CV chuyên nghiệp và giúp nhà tuyển dụng phân tích, đánh giá CV ứng viên tự động. 

Hệ thống được thiết kế theo kiến trúc Microservices / Multi-service bao gồm 3 phân hệ chính:
- 🎨 **Frontend**: Giao diện người dùng hiện đại, tương tác trực quan (Next.js).
- ⚙️ **Backend API**: Xử lý nghiệp vụ chính, quản lý người dùng, phân quyền và dữ liệu (.NET 8 Web API).
- 🤖 **AI Engine**: Phân tích cú pháp (CV Parsing), trích xuất thông tin, chấm điểm độ phù hợp (Python FastAPI).

---

## 🏗️ 2. Kiến trúc Hệ thống

```text
                               ┌─────────────────┐
                               │   Next.js UI    │ (Frontend - Port 3000)
                               └────────┬────────┘
                                        │
                                        ▼ (HTTP/REST)
                               ┌─────────────────┐
                               │  .NET Web API   │ (Backend - Port 5000)
                               └────┬───────┬────┘
                                    │       │
             ┌──────────────────────┘       └──────────────────────┐
             ▼                                                     ▼
┌─────────────────────────┐                               ┌─────────────────┐
│   SQL Server Database   │                               │ Python FastAPI  │ (AI Engine - Port 8000)
└─────────────────────────┘                               └─────────────────┘
```

---

## 🛠️ 3. Công nghệ Sử dụng

| Phân hệ | Công nghệ / Thư viện |
| :--- | :--- |
| **Frontend** | React, Next.js 14, CSS / Tailwind CSS |
| **Backend API** | C# .NET 8 Web API, Entity Framework Core |
| **AI Engine** | Python 3.10+, FastAPI, Pytest, Docker |
| **Database** | SQL Server |

---

## ✨ 4. Tính năng Chính

- 📝 **Tạo & Quản lý CV**: Hỗ trợ ứng viên tạo và chỉnh sửa CV theo template chuẩn.
- 🤖 **AI CV Parser & Scorer**: Tự động bóc tách thông tin CV và chấm điểm độ tương thích công việc.
- 🔐 **Xác thực & Phân quyền**: Đăng nhập, đăng ký, bảo mật JWT Authentication.
- 📊 **Thống kê & Quản lý**: Quản lý hồ sơ ứng viên và kết quả đánh giá cho nhà tuyển dụng.

---

## 📂 5. Cấu trúc Thư mục Dự án

```text
AIGeneralCV/
├── AI-Engine/               # Sub-system: Microservice xử lý AI (Python FastAPI)
│   ├── app/                 # Source code dịch vụ AI
│   ├── tests/               # Unit test AI Engine
│   ├── Dockerfile           # File cấu hình Docker container
│   └── requirements.txt     # Danh sách thư viện Python
├── Backend/                 # Sub-system: RESTful API (.NET 8)
│   └── Tay_Do_API/          # Project C# .NET (Controllers, Services, Models, DTOs)
├── Frontend/                # Sub-system: Giao diện Web (Next.js)
│   ├── src/                 # React components & pages
│   └── package.json         # Danh sách thư viện Node.js
├── AIGeneralCVDB.sql        # Script tạo Database Schema chuẩn
├── AIGeneralCV_Specification.md # Tài liệu Yêu cầu & Đặc tả hệ thống
├── FlowWork.md              # Tài liệu Luồng làm việc (WorkFlow)
├── Roadmap.md               # Lộ trình phát triển dự án
├── design.md                # Tài liệu thiết kế giao diện/hệ thống
└── README.md                # Tài liệu hướng dẫn dự án (File này)
```

---

## 🚀 6. Hướng dẫn Cài đặt & Khởi chạy Dự án

### 1. Yêu cầu Tiền đề (Prerequisites)
- [Node.js](https://nodejs.org/) (v18 trở lên)
- [.NET SDK](https://dotnet.microsoft.com/) (v8.0 trở lên)
- [Python](https://www.python.org/) (v3.10 trở lên)
- [SQL Server](https://www.microsoft.com/sql-server/)

---

### 2. Thiết lập Cơ sở Dữ liệu (Database)
1. Mở **SQL Server Management Studio (SSMS)** hoặc Azure Data Studio.
2. Mở file `AIGeneralCVDB.sql` và thực thi (Execute) để khởi tạo Database và bảng dữ liệu.

---

### 3. Khởi chạy AI Engine (Python / FastAPI)
```bash
# Di chuyển vào thư mục AI-Engine
cd AI-Engine

# Tạo môi trường ảo Python
python -m venv venv

# Kích hoạt môi trường ảo (Windows):
venv\Scripts\activate

# Cài đặt các thư viện phụ thuộc:
pip install -r requirements.txt

# Khởi chạy AI Engine server:
uvicorn app.main:app --reload --port 8000
```
📍 **AI Engine API Docs (Swagger):** `http://localhost:8000/docs`

---

### 4. Khởi chạy Backend API (.NET 8)
```bash
# Di chuyển vào thư mục Backend
cd Backend/Tay_Do_Project

# Restore packages & chạy dự án:
dotnet restore
dotnet run
```
📍 **Backend API Swagger UI:** `http://localhost:5000/swagger` *(hoặc port mặc định khi launch)*

---

### 5. Khởi chạy Frontend (Next.js)
```bash
# Di chuyển vào thư mục Frontend
cd Frontend

# Cài đặt packages & chạy dev server:
npm install
npm run dev
```
📍 **Website Client:** `http://localhost:3000`

---

### 6. Thông tin đăng nhập test

- **Tên đăng nhập**: sv_test_full
- **Mật khẩu**: 123456

### Lưu ý: Dữ liệu trong src code hoàn toàn chỉ là table và dữ liệu sinh viên để test không hoàn toàn full dữ liệu các table trong DB do github giới hạn 100mb nên có thể nhấn vào link dưới đây để tải file [.bak backup DB](https://drive.google.com/file/d/1_WfH6IcmPmYo91JHE_73yPfSAYaOm7Mf/view?usp=sharing) backup DB được dùng để test full chức năng
