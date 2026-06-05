# Hướng dẫn Prompt Redesign Giao diện LingoFlow (Premium UX/UI)

Sử dụng prompt dưới đây để yêu cầu AI Agent thực hiện nâng cấp toàn diện giao diện ứng dụng LingoFlow bằng kỹ năng `frontend-design`.

---

## 📝 Nội dung Prompt mẫu

```markdown
Chào bạn, tôi muốn bạn sử dụng kỹ năng "frontend-design" để thực hiện một cuộc đại tu (redesign) toàn diện về mặt thẩm mỹ và trải nghiệm người dùng (UI/UX) cho dự án LingoFlow. Mục tiêu là biến ứng dụng thành một sản phẩm học tập cao cấp (Premium), tối giản, tinh tế và khơi gợi cảm hứng học tập.

Dưới đây là các định hướng thiết kế và yêu cầu cụ thể:

### 1. Cấu trúc Hệ màu & Typography (Thẩm mỹ chủ đạo)
- **Hệ màu Organic & Khơi gợi sự tập trung:**
  - Tránh sử dụng các tông màu nguyên bản rực rỡ (như đỏ tươi, xanh lam, xanh lá cơ bản).
  - Sử dụng tông màu xanh rêu nhạt (Organic Olive) làm màu chủ đạo (Primary) - tương tự hệ màu `--color-indigo` hiện tại trong index.css.
  - Sử dụng màu đất nung ấm áp (Terracotta) hoặc cam cháy nhạt làm màu điểm nhấn (Accent) cho các nút hành động quan trọng hoặc trạng thái nổi bật.
  - Sử dụng nền Slate xám dịu cho cả hai chế độ sáng (Light Mode) và tối (Dark Mode) để bảo vệ mắt khi học lâu.
- **Phối hợp Typography tương phản:**
  - Tiêu đề trang, tên từ vựng tiếng Anh chính và các chỉ số thống kê lớn: Sử dụng font chữ có chân (Serif) sang trọng (ví dụ: các font mang hơi hướng Playfair Display hoặc tương tự qua class `font-serif-title`).
  - Nội dung mô tả, nghĩa tiếng Việt, câu ví dụ và các văn bản điều hướng: Sử dụng font không chân (Sans-serif) gọn gàng, sắc nét (ví dụ: Inter, Outfit hoặc Roboto) để tăng tốc độ đọc hiểu.
- **Glassmorphism & Depth (Độ sâu giao diện):**
  - Áp dụng các góc bo mềm mại (`rounded-2xl` đến `rounded-3xl`).
  - Sử dụng viền siêu mỏng (`border-slate-200/50` hoặc `dark:border-slate-800/60`) kèm hiệu ứng kính mờ (`backdrop-blur-lg`) trên nền trắng hoặc đen mờ 70% để phân lớp giao diện một cách tinh tế.

### 2. Các phần cần nâng cấp cụ thể

#### A. Trang Dashboard (Dashboard.tsx)
- Thiết kế lại các thẻ thống kê từ vựng theo bố cục bất đối xứng hiện đại. Bổ sung một lớp phủ gradient mờ dạng hình tròn phía sau icon để tạo điểm nhấn.
- Chỉ số học tập hàng ngày (Daily Learning Progress) cần một thanh tiến trình (Progress Bar) hoặc vòng tròn tiến độ được thiết kế tinh xảo, có animation chạy mượt mà khi người dùng truy cập trang.

#### B. Màn hình Từ vựng (Vocabulary.tsx)
- **Cải tiến thẻ từ vựng (Vocabulary Card):**
  - Thêm hiệu ứng nâng card nhẹ (`hover:-translate-y-1 hover:shadow-lg`) và đổi màu đường viền mượt mà khi hover.
  - Phần giải nghĩa tiếng Việt nên nằm trong một khung nền riêng biệt (Card lồng trong Card) có độ tương phản dịu mắt.
  - Câu ví dụ minh họa nên được đặt trong dấu ngoặc kép nghiêng sang trọng với màu chữ trầm hơn để phân cấp thông tin.
- **Modal Form (Thêm/Sửa từ):**
  - Thiết kế form nhập liệu như một trang giấy note nhỏ nổi lên giữa màn hình, các ô input có hiệu ứng viền phát sáng nhẹ (glow effect) khi được chọn (focus).

#### C. Thẻ ghi nhớ (FlashcardsPage.tsx)
- Tối ưu hóa hiệu ứng **lật thẻ 3D (Flip Card)** để hoạt động cực kỳ trơn tru và tự nhiên trên cả thiết bị di động và máy tính.
- Mặt trước của thẻ chỉ tập trung hiển thị Từ vựng + Phiên âm một cách tối giản để tăng độ tập trung. Mặt sau mới hiển thị Nghĩa dịch và Ví dụ minh họa.
- Thêm hiệu ứng nháy màu phản hồi nhanh (Xanh lục khi chọn "Đã thuộc" và Đỏ/Cam ấm khi chọn "Chưa thuộc") để tăng tính tương tác.

#### D. Chế độ kiểm tra (QuizPage.tsx)
- Thiết kế các đáp án trắc nghiệm dưới dạng các hộp lựa chọn lớn (các ô Grid). Mỗi lựa chọn khi hover vào sẽ sáng lên và đổi màu nhẹ; khi được chọn sẽ có hiệu ứng viền màu Accent nổi bật.
- Bổ sung hiệu ứng chúc mừng (pháo hoa bằng CSS hoặc animation nhẹ) khi người dùng hoàn thành bài thi với điểm số tối đa.

### 3. Hiệu ứng Chuyển động (Micro-animations)
- Sử dụng các lớp chuyển động từ thư viện `motion/react` hoặc các thuộc tính transition của Tailwind CSS để làm mượt mà thao tác chuyển đổi Tab, đóng/mở Modal, lọc danh sách từ vựng.
- Đảm bảo độ phản hồi responsive hoàn hảo trên mọi kích thước màn hình từ Desktop cho tới Mobile.
```
