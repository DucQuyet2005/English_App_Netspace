# Báo cáo Cập nhật Dự án LingoFlow - Ngày 05/06/2026

**Người thực hiện:** Đội ngũ Phát triển LingoFlow  
**Phiên bản:** Cập nhật nội bộ (Tiền phát hành - Pre-release)

Trong phiên làm việc ngày hôm nay, dự án LingoFlow đã có những bước tiến quan trọng trong việc chuyển đổi kiến trúc từ lưu trữ cục bộ (Local Storage) sang mô hình Client-Server hoàn chỉnh, đồng thời hoàn thiện cấu hình để sẵn sàng triển khai (Deploy) lên môi trường Production thực tế.

Dưới đây là chi tiết các hạng mục công việc đã hoàn thành:

## 1. Xây dựng và Tích hợp Hệ thống Backend (Node.js & MongoDB)
Trước đây, ứng dụng lưu trữ dữ liệu hoàn toàn bằng LocalStorage ở phía trình duyệt. Hôm nay, chúng tôi đã tích hợp thành công hệ thống Backend hoàn chỉnh:
- **Khởi tạo Server:** Xây dựng máy chủ bằng Node.js và Express.js, cấu hình đầy đủ các route cơ bản (`/api/auth`, `/api/words`, `/api/quiz`,...).
- **Cơ sở dữ liệu đám mây:** Tích hợp và kết nối thành công với MongoDB Atlas thông qua Mongoose.
- **Lớp dịch vụ API (API Service Layer):** Cập nhật `apiService.ts` trên Frontend để đồng bộ hóa dữ liệu từ ứng dụng lên hệ thống Cloud MongoDB, thay thế hoàn toàn cho LocalStorage.
- **Quản lý dữ liệu:** Bổ sung tính năng Import/Export dữ liệu học tập và Reset dữ liệu người dùng thông qua các API chuyên biệt.

## 2. Hoàn thiện Hệ thống Xác thực Người dùng (Authentication)
Để đảm bảo mỗi người dùng có không gian học tập riêng tư và dữ liệu được lưu trữ an toàn:
- Phát triển tính năng **Đăng ký / Đăng nhập** cục bộ.
- Triển khai mã hóa mật khẩu an toàn sử dụng thư viện **bcryptjs**.
- Xây dựng hệ thống phân quyền và xác thực phiên đăng nhập bằng **JSON Web Token (JWT)**.
- Gắn bảo mật cho các Endpoints (Protected Routes), đảm bảo chỉ những người dùng đã đăng nhập hợp lệ mới có thể truy vấn và chỉnh sửa bộ từ vựng hay kết quả Quiz của mình.

## 3. Hoàn thiện Trải nghiệm Người dùng (UX) & Tìm kiếm
Chúng tôi cũng đã tiến hành nâng cấp lớn cho giao diện và trải nghiệm tương tác với từ vựng:
- **Đồng bộ hóa thanh tìm kiếm (Search Bar) hai chiều:** Thiết lập cơ chế binding dữ liệu thời gian thực giữa ô Tìm kiếm trên thanh tiêu đề (`TopBar`) và ô tìm kiếm chính trong màn quản lý (`Vocabulary.tsx`), tạo sự nhất quán và phản hồi nhanh chóng cho người dùng.
- **Tự động điền phiên âm IPA:** Tích hợp với **Free Dictionary API** công khai. Khi người dùng nhập một từ tiếng Anh mới, hệ thống sẽ tự động gọi API ở sự kiện `onBlur` để tìm kiếm và điền sẵn phiên âm chuẩn IPA tương ứng, giúp tiết kiệm thời gian nhập liệu đáng kể mà vẫn giữ được tính linh hoạt khi cần chỉnh sửa thủ công.
- **Khắc phục lỗi hiển thị Dark Mode:** Sửa lỗi đảo ngược bảng màu khi chuyển sang chế độ tối, đảm bảo các class `dark:` của TailwindCSS hoạt động chuẩn xác trên toàn hệ thống.
- **Tối ưu hiển thị Light Mode:** Loại bỏ các quy tắc CSS ép buộc (`!important`) không cần thiết gây mờ chữ hoặc giảm độ tương phản ở giao diện sáng, giúp chữ hiển thị sắc nét và dễ đọc hơn.

## 4. Chuẩn bị Môi trường Deploy & Sửa Lỗi Tích hợp
Hệ thống đã được thiết lập sẵn sàng để triển khai lên các dịch vụ đám mây công cộng (Vercel cho Frontend và Render cho Backend):
- Bổ sung tài liệu thiết kế và hướng dẫn triển khai (`deploy.md`).
- Thêm file cấu hình `vercel.json` để hỗ trợ điều hướng SPA (Single Page Application) tránh lỗi 404 khi tải lại trang.
- **Khắc phục lỗi Tích hợp hệ thống:**
  - *Fix lỗi biên dịch Local:* Khắc phục sự cố không nhận diện được package `express` và `nodemon` trên môi trường Windows PowerShell thông qua việc xử lý Execution Policy và xung đột port (`EADDRINUSE 5000`).
  - *Sửa lỗi Gọi API trên Production (Lỗi 405 Method Not Allowed & Parsing JSON):* Đã điều tra và tìm ra nguyên nhân gây lỗi khi gọi hàm login/register lúc deploy. Lỗi bắt nguồn từ việc thiết lập thiếu biến môi trường `VITE_API_URL` trên host static, khiến Request POST bị trả về mã HTML thay vì JSON. Đã đưa ra quy trình chuẩn để cấu hình lại CORS trên Backend (`FRONTEND_URL`) và biến môi trường trên Frontend, đảm bảo kết nối mượt mà khi hệ thống lên sóng.

---

**Kết luận:** 
Ngày làm việc hôm nay đánh dấu bước ngoặt đưa LingoFlow từ một ứng dụng Frontend đơn giản trở thành một hệ thống Fullstack vững chắc, sẵn sàng phục vụ nhiều người dùng với cơ sở dữ liệu và xác thực bảo mật an toàn. Các lỗi về giao tiếp API giữa Frontend và Backend ở cả môi trường Local và Production đều đã được xử lý triệt để.
