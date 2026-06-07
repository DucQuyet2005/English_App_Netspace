# Kế hoạch Triển khai Tính năng Bảng xếp hạng Tuần (Weekly Leaderboard)

Tài liệu này phác thảo chi tiết kế hoạch thiết kế, cơ chế hoạt động và các bước triển khai tính năng **Bảng xếp hạng tuần (Weekly Leaderboard)** cho ứng dụng LingoFlow. Dự án sẽ áp dụng **Phương án 1 (Tính toán động từ lịch sử thi Quiz)** để đảm bảo tính tối ưu, bảo toàn dữ liệu và dễ dàng triển khai mà không cần chỉnh sửa Schema cơ sở dữ liệu hiện có.

---

## I. Mục tiêu & Ý nghĩa của tính năng
*   **Tăng độ tương tác (Engagement):** Tạo ra động lực cạnh tranh lành mạnh giữa các học viên.
*   **Thúc đẩy tính chuyên cần:** Khuyến khích người dùng làm bài tập Quiz đều đặn mỗi ngày để tích lũy điểm số xếp hạng.
*   **Trải nghiệm người dùng tốt hơn (UX):** Giao diện Premium Glassmorphism trực quan, làm nổi bật thành tích cá nhân và vinh danh những người dẫn đầu.

---

## II. Nguyên lý tính điểm & Cơ chế xếp hạng

### 1. Công thức tính điểm tuần (Weekly Score)
Điểm xếp hạng tuần của mỗi tài khoản được tính bằng tổng số câu trả lời đúng từ tất cả bài Quiz hoàn thành trong tuần hiện tại:
$$\text{Điểm tuần này} = \sum (\text{Số câu đúng trong mỗi lượt làm bài Quiz trong tuần})$$

### 2. Chu kỳ xếp hạng & Tự động đặt lại (Auto-Reset)
*   **Mốc thời gian:** Hệ thống lọc dữ liệu từ **00:00:00 ngày Thứ Hai** đến **23:59:59 ngày Chủ Nhật** của tuần hiện tại.
*   **Cơ chế tự động reset:** Backend sử dụng thời gian hệ thống (`Date.now`) để tự động xác định mốc Thứ Hai gần nhất. Khi sang tuần mới, biến mốc thời gian tự động tịnh tiến $\rightarrow$ điểm số hiển thị trên bảng xếp hạng tự động quay về 0 đối với tất cả người dùng mà không cần tác vụ xóa DB.

### 3. Quy tắc giải quyết đồng điểm (Tie-breaker)
Nếu hai hoặc nhiều người dùng có cùng tổng số câu trả lời đúng, hệ thống sẽ xếp hạng dựa trên các tiêu chí phụ theo thứ tự ưu tiên:
1.  **Tổng thời gian làm bài (duration):** Người dùng có tổng thời gian làm bài ngắn hơn (làm nhanh hơn) sẽ được ưu tiên xếp trên.
2.  **Số lượt làm bài Quiz (quizCount):** Người dùng đạt số câu đúng đó với số lượt thi ít hơn (hiệu suất cao hơn) sẽ được xếp trên.

---

## III. Thiết kế Kỹ thuật Backend (ExpressJS & MongoDB)

### 1. API Endpoint mới
*   **URL:** `GET /api/users/leaderboard`
*   **Phân quyền (Authorization):** Bắt buộc đăng nhập (`authMiddleware`). Đính kèm JWT Token trong Authorization Header.

### 2. MongoDB Aggregation Pipeline chi tiết
Hệ thống sẽ thực hiện truy vấn gom nhóm trực tiếp trên Collection `QuizAttempt`:

```javascript
// Giai đoạn 1: Xác định Thứ Hai đầu tuần lúc 00:00:00
const now = new Date();
const dayOfWeek = now.getDay();
const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
const startOfWeek = new Date(now.setDate(diff));
startOfWeek.setHours(0, 0, 0, 0);

// Giai đoạn 2: Aggregation Pipeline
const leaderboard = await QuizAttemptModel.aggregate([
  {
    // Lọc các bản ghi thuộc tuần này
    $match: {
      date: { $gte: startOfWeek }
    }
  },
  {
    // Gom nhóm theo người dùng và tính tổng câu đúng, tổng thời gian, số lần làm bài
    $group: {
      _id: "$userId",
      totalCorrect: { $sum: "$correctAnswers" },
      totalDuration: { $sum: "$duration" },
      quizCount: { $sum: 1 }
    }
  },
  {
    // Sắp xếp: Nhiều câu đúng nhất -> Thời gian ít nhất -> Số bài ít nhất
    $sort: {
      totalCorrect: -1,
      totalDuration: 1,
      quizCount: 1
    }
  },
  {
    // Giới hạn hiển thị Top 10 người dẫn đầu
    $limit: 10
  }
]);
```

### 3. Kết hợp thông tin tên hiển thị (User Populate)
Sau khi có danh sách Top 10, tiến hành truy vấn thông tin từ bảng `UserModel` để lấy `displayName` hiển thị lên giao diện, đồng thời so sánh ID để đánh dấu người dùng hiện tại (`isCurrentUser`).

---

## IV. Thiết kế Giao diện Frontend (ReactJS)

### 1. Vị trí hiển thị & Menu Điều hướng
*   **Sidebar & MobileNav:** Thêm một tab điều hướng mới có tên là **"Bảng xếp hạng"** (Sử dụng biểu tượng `Trophy` hoặc `Award` từ thư viện `lucide-react`).
*   **Dashboard Quick Access:** Bổ sung một nút truy cập nhanh vào Bảng xếp hạng từ trang Dashboard để người dùng dễ dàng kiểm tra vị trí của mình.

### 2. Giao diện trang Leaderboard (`Leaderboard.tsx`)
Trang được thiết kế theo phong cách **Premium Glassmorphism** đồng bộ với thiết kế hiện tại của LingoFlow:
*   **Top 3 Vinh Danh:**
    *   Hiển thị nổi bật ở phần đầu trang với biểu tượng Cup Vàng (Hạng 1), Huy chương Bạc (Hạng 2), Huy chương Đồng (Hạng 3).
    *   Tên người dùng hiển thị cỡ lớn kèm theo tổng số điểm (XP/Câu đúng).
*   **Bảng danh sách Top 10:**
    *   Các vị trí tiếp theo hiển thị dưới dạng hàng ngang bo góc mềm mại.
    *   Nếu là hàng của **Chính người dùng hiện tại**, hàng đó sẽ có hiệu ứng viền sáng mờ (Glow border) hoặc đổi màu nền sang tông ấm (như vàng/indigo nhẹ) để phân biệt rõ ràng.
*   **Bảng thông tin phụ:** Hiển thị thêm các chỉ số phụ như số lượt Quiz đã làm và tốc độ trả lời trung bình.

---

## V. Kế hoạch triển khai từng bước (Implementation Roadmap)

### Bước 1: Phát triển Backend (API Leaderboard)
- Tạo file router hoặc bổ sung vào `backend/src/routes/users.ts` endpoint `/leaderboard`.
- Viết logic xác định ngày đầu tuần và pipeline MongoDB.
- Tích hợp route này vào máy chủ chính `backend/src/app.ts` hoặc `backend/server.ts`.

### Bước 2: Thiết lập Giao diện Frontend (React Component)
- Tạo file component mới: `frontend/src/pages/Leaderboard.tsx`.
- Viết CSS/Tailwind (theo phong cách kính mờ) để hiển thị danh sách xếp hạng.
- Xử lý trạng thái tải (Loading) và trạng thái trống (khi chưa có ai làm quiz trong tuần).

### Bước 3: Đăng ký Router & Menu Điều hướng trên Client
- Thêm giá trị `'leaderboard'` vào danh sách `TabType` trong `frontend/src/types.ts`.
- Cập nhật `frontend/src/components/Sidebar.tsx` và `MobileNav.tsx` để thêm nút "Xếp hạng".
- Cập nhật hàm `renderActivePage` trong `frontend/src/App.tsx` để render màn hình `Leaderboard`.

### Bước 4: Tự động chạy thử nghiệm (Testing & Verification)
- Tạo tài khoản phụ để thực hiện làm bài Quiz giả lập.
- Kiểm tra tính chính xác của việc tính điểm dồn, cơ chế sắp xếp thứ hạng, giải quyết đồng điểm và làm nổi bật hàng của chính mình.
- Kiểm tra độ mượt mà của hiệu ứng lướt và chuyển tab.
