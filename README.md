# LingoFlow 📚

Ứng dụng học tiếng Anh thông minh sử dụng thuật toán lặp lại ngắt quãng **Spaced Repetition** (Hệ thống Leitner 5 Hộp) giúp tối ưu hóa việc ghi nhớ từ vựng. Hệ thống được phát triển theo mô hình **Fullstack MERN** với cơ chế xác thực bảo mật và đồng bộ hóa đám mây.

---

## 🎯 Tính Năng Chính

* 🔐 **Xác thực người dùng (Auth)**: Hệ thống Đăng ký / Đăng nhập riêng tư, mã hóa mật khẩu an toàn và bảo mật API bằng JSON Web Token (JWT).
* 📚 **Quản lý từ vựng (Vocabulary)**: Thêm từ mới, hiển thị nghĩa và tự động điền phiên âm IPA thông qua kết nối API từ điển. Hỗ trợ tìm kiếm thời gian thực đồng bộ hai chiều.
* 🎴 **Flashcard học tập**: Giao diện lật thẻ 3D mượt mà, phân loại từ theo thuật toán lặp lại ngắt quãng (Leitner 5-box).
* 🎯 **Quiz trắc nghiệm**: Tạo bài kiểm tra trắc nghiệm 4 lựa chọn tự động từ kho từ vựng cá nhân, lưu kết quả làm bài trực tiếp lên đám mây.
* 📊 **Thống kê tiến độ**: Bảng điều khiển trực quan hiển thị biểu đồ phân bố hộp học tập, tỷ lệ chính xác làm quiz và xu hướng ôn tập tích lũy.
* ⚙️ **Cài đặt & Đồng bộ**: Hỗ trợ chuyển đổi Dark/Light mode (Dark Mode mặc định) và cơ chế Xuất/Nhập dữ liệu dự phòng qua file JSON.

---

## 🛠️ Công Nghệ Sử Dụng

### Frontend (Client)
* **React 19** + **TypeScript 5.8** + **Vite 6.2**
* **Tailwind CSS 4.1** (Styling Premium Glassmorphism)
* **Motion (motion/react)** (Hiệu ứng lật thẻ & chuyển động mượt mà)

### Backend & Database (Server)
* **Node.js** + **Express.js** + **TypeScript**
* **MongoDB Atlas** + **Mongoose** (ODM)
* **JWT (JSON Web Token)** + **Bcryptjs** (Security)

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Môi Trường Local

### Yêu cầu hệ thống
* **Node.js** ≥ 18.0
* **npm** ≥ 9.0
* Một tài khoản **MongoDB Atlas** (hoặc chạy MongoDB Local)

### Cài đặt nhanh

#### Bước 1: Khởi tạo Backend
1. Truy cập vào thư mục `backend`:
   ```bash
   cd backend
   ```
2. Cài đặt các thư viện:
   ```bash
   npm install
   ```
3. Tạo tệp cấu hình môi trường `.env` từ file mẫu:
   ```bash
   cp .env.example .env
   ```
   *Mở tệp `.env` vừa tạo và điền thông tin đường dẫn kết nối MongoDB Atlas (`MONGODB_URI`) và khóa bí mật (`JWT_SECRET`).*
4. Chạy server ở chế độ phát triển:
   ```bash
   npm run dev
   ```
   *Server backend sẽ chạy tại: http://localhost:5000*

#### Bước 2: Khởi tạo Frontend
1. Truy cập vào thư mục `frontend`:
   ```bash
   cd ../frontend
   ```
2. Cài đặt các thư viện:
   ```bash
   npm install
   ```
3. Tạo tệp cấu hình môi trường `.env`:
   ```bash
   # Tạo file .env và thêm đường dẫn API Backend
   VITE_API_URL="http://localhost:5000/api"
   ```
4. Chạy client ở chế độ phát triển:
   ```bash
   npm run dev
   ```
   *Ứng dụng web sẽ chạy tại: http://localhost:3000*

---

## 📁 Cấu Trúc Dự Án Chính

```
English_App_Netspace/
├── backend/                  # Máy chủ Express & Database Models
│   ├── src/
│   │   ├── config/           # Cấu hình kết nối DB Atlas
│   │   ├── middleware/       # Bộ lọc xác thực JWT (Auth middleware)
│   │   ├── models/           # Cấu trúc bảng MongoDB (User, Word, QuizAttempt)
│   │   ├── routes/           # Định tuyến API (Auth, Words, Quiz, Data)
│   │   └── index.ts          # Điểm khởi chạy Server chính
├── frontend/                 # Giao diện Client React
│   ├── src/
│   │   ├── components/       # Các components dùng chung (Sidebar, TopBar, MobileNav)
│   │   ├── pages/            # Các trang giao diện chính
│   │   ├── services/         # apiService.ts kết nối server qua HTTP/JWT
│   │   ├── AppContext.tsx    # State management trung tâm
│   │   └── types.ts          # Định nghĩa kiểu dữ liệu TypeScript
└── docs/                     # Tài liệu chi tiết của dự án
```

---

## 📖 Tài Liệu Chi Tiết Hơn
Các đặc tả kỹ thuật chi tiết của dự án được lưu trữ trong thư mục `docs/`:
* [**spec.md**](./docs/spec.md) - Đặc tả chi tiết các tính năng, yêu cầu chức năng/phi chức năng và cấu trúc dữ liệu.
* [**architecture.md**](./docs/architecture.md) - Tài liệu kiến trúc hệ thống, sơ đồ luồng dữ liệu, thuật toán Leitner và thiết kế API.
* [**changelog.md**](./docs/changelog.md) - Nhật ký ghi nhận lịch sử cập nhật và nâng cấp tính năng của ứng dụng.

---

## 📄 Bản Quyền
Dự án được phân phối dưới giấy phép **MIT License**.
