# Specification - Xây cái gì?

**LingoFlow** - Ứng dụng học tiếng Anh thông minh dành cho người học

## 1. Tổng Quan Sản Phẩm

LingoFlow là một ứng dụng web học tiếng Anh toàn diện, kết hợp công nghệ Spaced Repetition (lặp lại cách khoảng) với giao diện thân thiện người dùng. Ứng dụng hỗ trợ cả giao diện Desktop và Mobile, cho phép người học quản lý từ vựng, luyện tập qua flashcard, làm quiz và theo dõi tiến độ.

## 2. Tính Năng Chính

### 2.1 Dashboard (Bảng Điều Khiển)

- **Tổng quan** tóm tắt thông tin học tập
- **Thống kê nhanh**: Tổng từ vựng, từ đã học, từ cần ôn tập
- **Gợi ý hành động** tiếp theo: từ cần ôn tập, quiz đề xuất
- **Biểu đồ trực quan** tiến độ hôm nay

### 2.2 Quản Lý Từ Vựng (Vocabulary)

- **Thêm từ mới**: Thêm từ, IPA, nghĩa, ví dụ, chủ đề
- **Danh sách từ**: Xem tất cả từ đã thêm
- **Tìm kiếm & lọc**:
  - Tìm kiếm theo từ, nghĩa
  - Lọc theo chủ đề (Gia đình, Thực phẩm, v.v.)
  - Lọc theo trạng thái (Đã học / Chưa học)
  - Lọc theo hộp (Box 1-5 trong Leitner system)
- **Chỉnh sửa từ**: Cập nhật thông tin từ vựng
- **Xóa từ**: Xóa từ khỏi danh sách
- **Đánh dấu trạng thái**: Đánh dấu từ là đã học / chưa học
- **Sắp xếp**: Theo ngày tạo, trạng thái học, hộp

### 2.3 Flashcard (Thẻ Học)

- **Chế độ học**: Xem thẻ một chiều
- **Xem thẻ**: Hiển thị từ, IPA, ví dụ
- **Đánh dấu trạng thái**:
  - Đã hiểu ✓ (nâng lên box cao hơn)
  - Chưa hiểu ✗ (hạ xuống box 1)
- **Spaced Repetition**: Lên lịch ôn tập dựa trên Leitner System
  - Box 1 → 1 ngày
  - Box 2 → 2 ngày
  - Box 3 → 4 ngày
  - Box 4 → 7 ngày
  - Box 5 → 14 ngày
- **Lọc**: Chỉ hiển thị từ cần ôn tập (nextReviewDate ≤ hôm nay)

### 2.4 Quiz (Kiểm Tra)

- **Câu hỏi trắc nghiệm**: Chọn nghĩa đúng cho từ
- **4 lựa chọn**: Đáp án đúng + 3 nhiễu
- **Đánh giá**: Tính điểm, tỷ lệ chính xác
- **Luyện tập có mục đích**:
  - Luyện toàn bộ từ
  - Luyện theo chủ đề
  - Luyện từ chưa học
  - Luyện từ cần ôn tập
- **Thời gian**: Ghi nhận thời gian làm quiz
- **Kết quả**: Hiển thị tổng điểm, phần trăm chính xác, từ còn yếu

### 2.5 Thống Kê (Stats)

- **Biểu đồ tiến độ**:
  - Tổng từ vựng theo thời gian
  - Tỷ lệ từ đã học
  - Phân bố từ theo hộp (Box distribution)
  - Biểu đồ hiệu suất quiz (Accuracy trend)
- **Thống kê chi tiết**:
  - Tổng quiz đã làm
  - Tỷ lệ chính xác trung bình
  - Thời gian học tổng cộng
  - Chủ đề yêu thích
  - Từ vựng yếu nhất (ít đúng trong quiz)
  - Từ vựng mạnh nhất (hay đúng)
- **Hôm nay**: Thống kê của ngày hiện tại

### 2.6 Cài Đặt (Settings)

- **Giao diện**:
  - Chế độ tối (Dark mode) / Sáng (Light mode)
  - Kích thước font
  - Chủ đề màu (nếu có)
- **Học tập**:
  - Số câu hỏi mỗi quiz (mặc định 10)
  - Chế độ random (xáo trộn câu hỏi)
  - Âm thanh phát âm (nếu có)
- **Dữ liệu**:
  - **Xuất dữ liệu** (Export): Tải file JSON chứa tất cả từ vựng, quiz attempts, settings
  - **Nhập dữ liệu** (Import): Tải file JSON để khôi phục dữ liệu
  - **Reset dữ liệu**: Xóa toàn bộ từ vựng, attempts, quay lại mặc định

### 2.7 Đăng nhập / Đăng ký (Authentication)

- **Đăng ký tài khoản**: Người dùng tạo tài khoản bằng email, mật khẩu và tên hiển thị.
- **Đăng nhập**: Người dùng đăng nhập bằng email và mật khẩu đã đăng ký.
- **Quản lý phiên**: Khi đăng nhập thành công, người dùng được đưa vào app chính.
- **Dữ liệu riêng tư**: Mỗi tài khoản có dữ liệu từ vựng, quiz attempts và cài đặt riêng biệt.
- **Đăng xuất**: Cho phép người dùng đăng xuất và trở về màn hình đăng nhập.

## 3. Yêu Cầu Chức Năng (Functional Requirements)

### FR1: Quản Lý Từ Vựng

- [ ] Thêm từ mới với đầy đủ thông tin (word, IPA, meaning, example, topic)
- [ ] Chỉnh sửa thông tin từ
- [ ] Xóa từ
- [ ] Danh sách tất cả từ với pagination hoặc infinite scroll
- [ ] Tìm kiếm theo từ hoặc nghĩa (case-insensitive)
- [ ] Lọc theo chủ đề, trạng thái học, box
- [ ] Sắp xếp theo ngày tạo, tên từ, trạng thái

### FR2: Flashcard Learning

- [ ] Hiển thị thẻ học (word + IPA + example)
- [ ] Chuyển sang mặt sau (flip card) để xem nghĩa
- [ ] Đánh dấu "Đã hiểu" / "Chưa hiểu"
- [ ] Cập nhật Spaced Repetition box dựa trên kết quả
- [ ] Lọc thẻ cần ôn tập dựa trên nextReviewDate
- [ ] Đếm tiến độ (e.g., 5/25 flashcards)

### FR3: Quiz

- [ ] Tạo quiz từ danh sách từ
- [ ] 4 lựa chọn trắc nghiệm
- [ ] Xáo trộn lựa chọn
- [ ] Ghi nhận câu trả lời, tính điểm
- [ ] Hiển thị kết quả sau mỗi câu hoặc sau cả quiz
- [ ] Lưu kết quả attempt (correct, total, duration, topic)

### FR4: Thống Kê

- [ ] Tính tổng từ vựng
- [ ] Tính tỷ lệ từ đã học
- [ ] Phân bố từ theo box
- [ ] Tính trung bình chính xác quiz
- [ ] Biểu đồ tiến độ theo thời gian
- [ ] Xác định từ vựng yếu nhất

### FR5: Cài Đặt

- [ ] Bật/tắt chế độ tối (dark mode)
- [ ] Lưu cài đặt vào Local Storage
- [ ] Xuất dữ liệu toàn bộ (Export JSON)
- [ ] Nhập dữ liệu từ file JSON
- [ ] Reset dữ liệu về mặc định

### FR6: Authentication

- [ ] Đăng ký tài khoản bằng email, mật khẩu và tên hiển thị
- [ ] Đăng nhập bằng email và mật khẩu đã đăng ký
- [ ] Mỗi người dùng có dữ liệu từ vựng riêng và cài đặt riêng
- [ ] Đăng xuất trở về màn hình đăng nhập

## 4. Yêu Cầu Phi Chức Năng (Non-Functional Requirements)

### NFR1: Hiệu Năng

- [ ] Trang tải < 2s
- [ ] Tìm kiếm / Lọc phản hồi < 200ms
- [ ] Quiz chuyển câu hỏi < 100ms
- [ ] Không lag khi cuộn danh sách 100+ từ

### NFR2: Tương Thích

- [ ] Chrome/Edge/Firefox mới nhất
- [ ] Safari (iOS) 14+
- [ ] Responsive: Mobile (320px), Tablet (768px), Desktop (1200px+)
- [ ] Dark mode hỗ trợ trên tất cả browser

### NFR3: Lưu Trữ

- [ ] Dữ liệu lưu Local Storage (5-10MB đủ cho ~1000 từ)
- [ ] Tuỳ chọn: Server-side sync (trong tương lai)

### NFR4: Bảo Mật

- [ ] Không gửi dữ liệu cá nhân lên server (Local-first)
- [ ] Gemini API key chỉ dùng cho tính năng tương lai (AI suggestions)

### NFR5: UX

- [ ] Giao diện trực quan, không quá phức tạp
- [ ] Hỗ trợ keyboard shortcuts (nếu có)
- [ ] Toast notifications cho hành động (add, delete, etc.)
- [ ] Loading states rõ ràng

## 5. Dữ Liệu

### Word (Từ Vựng)

```typescript
{
  id: string; // Unique ID (word_timestamp)
  word: string; // Từ tiếng Anh (e.g., "Mother")
  ipa: string; // Phát âm IPA (e.g., "/ˈmʌðər/")
  meaning: string; // Nghĩa tiếng Việt
  example: string; // Câu ví dụ
  topic: string; // Chủ đề (e.g., "Gia đình")
  learned: boolean; // Đã học hay chưa
  box: 1 - 5; // Hộp Leitner (1-5)
  nextReviewDate: ISO8601; // Ngày ôn tập tiếp theo
  createdAt: ISO8601; // Ngày tạo
}
```

### QuizAttempt (Nỗ Lực Quiz)

```typescript
{
  id: string; // Unique ID
  correct: number; // Số câu trả lời đúng
  total: number; // Tổng số câu
  duration: number; // Thời gian (ms)
  topic: string; // Chủ đề (hoặc "All")
  timestamp: ISO8601; // Khi nào làm quiz
}
```

### AppSettings (Cài Đặt Ứng Dụng)

```typescript
{
  darkMode: boolean; // Chế độ tối
  quizCount: number; // Số câu quiz (mặc định 10)
  shuffleQuestions: boolean; // Xáo trộn câu hỏi
  fontSize: "small" | "medium" | "large"; // Kích thước font
}
```

## 6. Hạn Chế Hiện Tại

- Không hỗ trợ phát âm âm thanh (tính năng tương lai)
- Không hỗ trợ hình ảnh cho từ vựng
- Không có tính năng collaboration (chia sẻ từ vựng)
- Local Storage chỉ: chỉ lưu trên thiết bị hiện tại

## 7. Tiềm Năng Mở Rộng (Future)

- AI suggestions: Dùng Gemini API để tạo ví dụ từ, câu hỏi tự động
- Audio pronunciation: Phát âm từ bằng text-to-speech
- Spaced Repetition tối ưu: Machine learning dự đoán thời gian ôn tập
- Cloud sync: Đồng bộ dữ liệu qua tài khoản
- Social: Chia sẻ từ vựng, quiz với bạn
- Themes: Thêm nhiều chủ đề (HSK, TOEIC, IELTS, v.v.)
