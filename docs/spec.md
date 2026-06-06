# Specification - Xây cái gì?

**LingoFlow** - Ứng dụng học tiếng Anh thông minh dành cho người học

## 1. Tổng Quan Sản Phẩm

LingoFlow là một ứng dụng web học tiếng Anh toàn diện, kết hợp công nghệ Spaced Repetition (lặp lại cách khoảng) theo hệ thống Leitner với kiến trúc Client-Server hoàn chỉnh. Ứng dụng hỗ trợ cả giao diện Desktop và Mobile, cho phép người học đăng ký tài khoản cá nhân, quản lý từ vựng, luyện tập qua flashcard, làm quiz trắc nghiệm và theo dõi tiến độ học tập trực quan. Tất cả dữ liệu học tập được đồng bộ và lưu trữ bảo mật trên đám mây.

---

## 2. Tính Năng Chính

### 2.1 Đăng nhập / Đăng ký & Bảo mật (Authentication)

- **Đăng ký tài khoản**: Người dùng tạo tài khoản bằng email, mật khẩu và tên hiển thị. Mật khẩu được băm bảo mật trước khi lưu vào cơ sở dữ liệu.
- **Đăng nhập**: Xác thực người dùng và cấp mã định danh JWT (JSON Web Token) để duy trì phiên làm việc.
- **Quản lý phiên (Session)**: Token được lưu trữ cục bộ phía client để tự động đăng nhập trong các lần truy cập tiếp theo.
- **Phân quyền dữ liệu**: Đảm bảo mỗi tài khoản có không gian học tập riêng biệt, dữ liệu từ vựng và kết quả kiểm tra được bảo mật hoàn toàn.
- **Đăng xuất**: Xóa phiên làm việc, xóa token cục bộ và chuyển hướng về màn hình đăng nhập.

### 2.2 Dashboard (Bảng Điều Khiển)

- **Tổng quan** tóm tắt thông tin học tập cá nhân.
- **Thống kê nhanh**: Tổng số từ vựng, số từ đã học, và số từ cần ôn tập trong ngày.
- **Gợi ý hành động**: Hiển thị nút truy cập nhanh đến các từ cần ôn tập hoặc bài quiz đề xuất.
- **Biểu đồ trực quan**: Thống kê tiến độ ôn tập trong ngày hiện tại.

### 2.3 Quản Lý Từ Vựng (Vocabulary)

- **Thêm từ mới**: Nhập từ tiếng Anh, nghĩa tiếng Việt, ví dụ minh họa và chủ đề.
- **Tự động điền phiên âm IPA**: Khi nhập từ tiếng Anh mới, hệ thống tự động gọi API từ điển công khai để điền sẵn phiên âm chuẩn IPA (có thể chỉnh sửa thủ công).
- **Tìm kiếm & Lọc**:
  - Tìm kiếm thời gian thực theo từ hoặc nghĩa, đồng bộ thanh tìm kiếm hai chiều giữa Header (`TopBar`) và trang Vocabulary.
  - Lọc theo chủ đề (Gia đình, Thực phẩm, v.v.).
  - Lọc theo trạng thái học (Đã học / Chưa học).
  - Lọc theo hộp ghi nhớ Leitner (Hộp 1 đến Hộp 5).
- **Chỉnh sửa & Xóa**: Cập nhật chi tiết hoặc xóa từ vựng khỏi tài khoản.
- **Sắp xếp**: Sắp xếp danh sách từ theo ngày tạo, thứ tự bảng chữ cái, trạng thái học hoặc hộp Leitner.

### 2.4 Flashcard (Thẻ Học 3D)

- **Giao diện 3D**: Trải nghiệm lật thẻ mượt mà để xem từ vựng (mặt trước) và nghĩa/ví dụ (mặt sau).
- **Đánh giá ghi nhớ**:
  - **Đã nhớ** ✓ (Hộp Leitner tăng lên 1 bậc, tối đa Hộp 5, tăng khoảng cách thời gian ôn tập).
  - **Chưa nhớ** ✗ (Hộp Leitner hạ ngay về Hộp 1, lên lịch ôn tập lại vào ngày tiếp theo).
- **Thuật toán Spaced Repetition (Hệ thống Leitner 5 Hộp)**:
  - Hộp 1 → Ôn tập sau 1 ngày.
  - Hộp 2 → Ôn tập sau 2 ngày.
  - Hộp 3 → Ôn tập sau 4 ngày.
  - Hộp 4 → Ôn tập sau 7 ngày.
  - Hộp 5 → Ôn tập sau 14 ngày.
- **Lọc thẻ cần ôn**: Chỉ tải các thẻ có lịch ôn tập đến hạn (`nextReviewDate` ≤ thời điểm hiện tại).

### 2.5 Quiz (Kiểm Tra)

- **Tạo câu hỏi trắc nghiệm**: Chọn ngẫu nhiên từ vựng trong kho của người dùng (tất cả từ, theo chủ đề hoặc theo trạng thái ôn tập).
- **4 lựa chọn**: Bao gồm 1 đáp án đúng và 3 đáp án nhiễu được lấy ngẫu nhiên từ nghĩa của các từ khác.
- **Kết quả & Thống kê**:
  - Tính điểm theo thang 100 và tỷ lệ chính xác.
  - Ghi nhận thời gian làm bài (duration).
  - Hiển thị kết quả chi tiết sau khi hoàn thành.
  - Tự động lưu lịch sử làm quiz (`QuizAttempt`) lên database.

### 2.6 Thống Kê (Stats)

- **Biểu đồ trực quan**:
  - Tổng số từ vựng tích lũy theo thời gian.
  - Tỷ lệ từ đã học thành công.
  - Biểu đồ hình cột phân bố số lượng từ trong các Hộp 1-5.
  - Biểu đồ đường xu hướng độ chính xác qua các bài Quiz.
- **Thống kê chi tiết**:
  - Tổng số bài quiz đã hoàn thành, tỷ lệ chính xác trung bình và tổng thời gian làm quiz.
  - Chủ đề học tập có số lượng từ nhiều nhất.
  - Danh sách từ vựng yếu nhất (trả lời sai nhiều nhất trong các bài kiểm tra).

### 2.7 Cài Đặt & Quản Lý Dữ Liệu (Settings)

- **Giao diện & Cài đặt học tập**:
  - Bật/tắt chế độ tối (Dark Mode) - được thiết lập mặc định lúc tải trang để bảo vệ mắt.
  - Thay đổi số lượng câu hỏi mặc định cho mỗi bài Quiz.
- **Quản lý dữ liệu đám mây qua API**:
  - **Xuất dữ liệu** (Export): Tải xuống tệp JSON chứa toàn bộ từ vựng, kết quả quiz và cấu hình từ máy chủ MongoDB.
  - **Nhập dữ liệu** (Import): Tải lên tệp JSON để đồng bộ và khôi phục dữ liệu học tập lên máy chủ (xóa dữ liệu cũ).
  - **Reset dữ liệu**: Xóa sạch từ vựng, kết quả làm bài của tài khoản hiện tại về trạng thái mặc định ban đầu.

---

## 3. Yêu Cầu Chức Năng (Functional Requirements)

### FR1: Quản Lý Tài Khoản (Auth)
- [x] Đăng ký tài khoản bằng Email, mật khẩu và tên hiển thị.
- [x] Đăng nhập bằng Email, duy trì phiên đăng nhập thông qua lưu trữ Token JWT.
- [x] Đăng xuất và điều hướng người dùng về trang đăng nhập.
- [x] Bảo mật dữ liệu biệt lập giữa các tài khoản người dùng khác nhau.

### FR2: Quản Lý Từ Vựng
- [x] Thêm từ mới thủ công với các thuộc tính cơ bản.
- [x] Tự động truy vấn và điền phiên âm IPA thông qua API từ điển khi nhập xong từ.
- [x] Sửa, xóa và xem danh sách từ vựng dạng bảng (Desktop) hoặc dạng thẻ (Mobile).
- [x] Tìm kiếm nhanh (đồng bộ 2 chiều ở thanh Header) và lọc theo chủ đề, hộp Leitner, trạng thái học.

### FR3: Flashcard
- [x] Render thẻ flashcard dạng 3D với hiệu ứng lật mặt khi chạm.
- [x] Nút "Đã nhớ" / "Chưa nhớ" cập nhật chính xác cấp độ Hộp và lịch ôn tập tiếp theo (`nextReviewDate`) trên cơ sở dữ liệu MongoDB.
- [x] Hiển thị thanh tiến trình ôn tập của bộ thẻ hiện tại.

### FR4: Quiz
- [x] Sinh câu hỏi trắc nghiệm tự động từ kho từ vựng.
- [x] Ghi nhận câu trả lời, tính toán thời gian làm bài, tính điểm.
- [x] Lưu lịch sử bài quiz (`QuizAttempt`) lên MongoDB khi hoàn thành.

### FR5: Thống Kê & Cài Đặt
- [x] Vẽ các biểu đồ tiến độ học, phân bố hộp, và hiệu suất làm quiz bằng biểu đồ trực quan.
- [x] Thay đổi chế độ sáng/tối (Dark Mode làm mặc định hệ thống).
- [x] API xuất/nhập tệp JSON và xóa toàn bộ dữ liệu tài khoản trên cloud.

---

## 4. Yêu Cầu Phi Chức Năng (Non-Functional Requirements)

### NFR1: Hiệu Năng & Đồng Bộ
- [x] Thời gian phản hồi của API backend < 300ms (ngoại trừ lượt gọi lạnh đầu tiên khi server Render khởi động lại).
- [x] Trạng thái giao diện thay đổi tức thì (Optimistic UI updates) khi thêm/sửa/xóa từ vựng để tránh cảm giác trễ mạng.
- [x] Quản lý tải trang mượt mà, sử dụng các hiệu ứng loading/skeleton khi đợi phản hồi từ database.

### NFR2: Bảo Mật Dữ Liệu
- [x] Mật khẩu người dùng được băm bằng thuật toán một chiều `bcryptjs`.
- [x] Tất cả các kết nối trao đổi dữ liệu giữa Frontend và Backend phải thông qua giao thức bảo mật HTTPS (trên môi trường production).
- [x] Các route API lấy và thay đổi dữ liệu từ vựng/quiz đều được bảo vệ bằng middleware JWT.

### NFR3: Triển Khai & Cấu Hình
- [x] Client (Vite + React) được triển khai lên **Vercel** với cấu hình ghi đè định tuyến (`vercel.json`) nhằm tránh lỗi 404 khi người dùng tải lại trang ở các URL con.
- [x] Server (Express.js) được triển khai lên **Render** kết nối trực tiếp với Cluster đám mây của **MongoDB Atlas**.
- [x] Thiết lập CORS chỉ chấp nhận kết nối từ tên miền của Frontend (được cấu hình động hỗ trợ các subdomain dạng `*.vercel.app`).

---

## 5. Cấu Trúc Dữ Liệu (MongoDB Schemas)

### User (Người Dùng)
```typescript
{
  id: ObjectId;
  email: string; // Unique, required
  passwordHash: string; // Băm bằng bcryptjs
  displayName: string;
  settings: {
    darkMode: boolean; // Mặc định true
    theme: 'dark' | 'light' | 'normal';
    defaultQuizSize: number; // Mặc định 10
    dailyGoal: number; // Mặc định 5
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Word (Từ Vựng)
```typescript
{
  id: ObjectId;
  userId: ObjectId; // Liên kết tới bảng User
  word: string;
  ipa: string;
  meaning: string;
  example: string;
  topic: string;
  learned: boolean;
  box: number; // Giá trị từ 1 - 5
  nextReviewDate: Date; // Lịch ôn tập Spaced Repetition
  createdAt: Date;
  updatedAt: Date;
}
```

### QuizAttempt (Kết Quả Làm Bài)
```typescript
{
  id: ObjectId;
  userId: ObjectId; // Liên kết tới bảng User
  score: number; // Điểm số (0 - 100)
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  duration: number; // Tính bằng giây
  topic: string;
  date: Date;
}
```

---

## 6. Hạn Chế Hiện Tại

- **Độ trễ khởi động của Server Free**: Do máy chủ Render (gói Free) tự động ngủ sau 15 phút không hoạt động, lượt gọi API đầu tiên sau thời gian này sẽ mất từ 50-60 giây để khởi động lại máy chủ (Cold Start).
- **Chưa có âm thanh phát âm trực tiếp**: Hệ thống chưa tích hợp tính năng Text-to-Speech phát âm từ vựng.
- **Chưa hoạt động ngoại tuyến (Offline mode)**: Do đã chuyển dịch hoàn toàn sang kiến trúc Client-Server, ứng dụng yêu cầu kết nối Internet liên tục để tải và cập nhật dữ liệu.

---

## 7. Tiềm Năng Mở Rộng (Future)

- **Hỗ trợ Offline-first**: Lưu trữ tạm dữ liệu học tập vào IndexedDB khi mất kết nối mạng và tự động đồng bộ lên MongoDB khi có Internet trở lại.
- **Phát âm từ vựng (Audio Pronunciation)**: Tích hợp thư viện hoặc API phát âm giọng đọc bản xứ.
- **Tạo gợi ý học tập bằng AI**: Sử dụng mô hình ngôn ngữ (như Gemini API) để tạo câu ví dụ tự động phù hợp với ngữ cảnh học tập của người dùng.
- **Học tập nhóm (Social Sharing)**: Cho phép người dùng chia sẻ bộ từ vựng hoặc thi đua bảng điểm quiz với nhau.
