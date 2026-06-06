# Architecture - Xây như thế nào?

Kiến trúc của LingoFlow được thiết kế theo mô hình **MERN Stack** (MongoDB, Express, React, Node.js) hoàn chỉnh, chạy trên nền tảng đám mây thay thế cho việc chỉ lưu trữ Local Storage cục bộ như trước đây. Hệ thống phân chia rõ ràng giữa Client (Frontend) và Server (Backend), giao tiếp với nhau qua chuẩn RESTful API có bảo mật.

---

## 1. Stack Công Nghệ (Tech Stack)

### Frontend (Client-side)
* **React 19**: Thư viện UI xây dựng các thành phần giao diện, sử dụng Hooks mới nhất.
* **TypeScript 5.8**: Đảm bảo an toàn kiểu dữ liệu (Type safety) và tối ưu hóa hỗ trợ của IDE.
* **Vite 6.2**: Công cụ đóng gói (Build tool) với cơ chế HMR (Hot Module Replacement) siêu tốc.
* **Tailwind CSS 4.1**: Framework CSS tiện ích thiết kế giao diện Glassmorphism hiện đại.
* **Motion (motion/react)**: Thư viện tạo các chuyển động và hiệu ứng lật thẻ 3D mượt mà.
* **Lucide React**: Bộ thư viện icons chất lượng cao.

### Backend (Server-side)
* **Node.js**: Môi trường chạy JavaScript phía máy chủ.
* **Express.js**: Web framework tối giản dùng để xây dựng các API Endpoints và điều hướng (Routing).
* **TypeScript**: Được cấu hình đồng bộ ở cả client và server để thống nhất các kiểu dữ liệu (Interfaces).
* **JSON Web Token (JWT)**: Cơ chế tạo mã token bảo mật phục vụ xác thực người dùng.
* **Bcryptjs**: Thư viện mã hóa và so sánh mật khẩu bằng thuật toán băm (hashing).

### Database (Cơ sở dữ liệu)
* **MongoDB Atlas**: Hệ quản trị cơ sở dữ liệu NoSQL dạng tài liệu (Document) được lưu trữ trên Cloud.
* **Mongoose**: Thư viện ODM (Object Data Modeling) hỗ trợ định nghĩa Schemas, xác thực dữ liệu và thực hiện các truy vấn dữ liệu từ Node.js đến MongoDB.

---

## 2. Cấu Trúc Dự Án (Directory Structure)

```
English_App_Netspace/
├── backend/                     # Mã nguồn máy chủ (Backend)
│   ├── src/
│   │   ├── config/              # Cấu hình kết nối DB (db.ts)
│   │   ├── middleware/          # Middleware bảo mật & Auth (auth.ts)
│   │   ├── models/              # Mongoose models (User, Word, QuizAttempt)
│   │   ├── routes/              # Các đầu API (auth.ts, words.ts, quiz.ts, data.ts)
│   │   └── index.ts             # Khởi chạy Express app, cấu hình CORS & Port
│   ├── package.json             # Khai báo dependencies của server
│   └── tsconfig.json            # Cấu hình TypeScript cho backend
├── frontend/                    # Mã nguồn giao diện (Frontend)
│   ├── src/
│   │   ├── components/          # Giao diện dùng chung (Sidebar, TopBar, MobileNav)
│   │   ├── pages/               # Trang chính (Dashboard, Vocabulary, Flashcards, Quiz, Stats, Settings)
│   │   ├── services/            # Lớp API (apiService.ts) kết nối Express
│   │   ├── App.tsx              # Component gốc và phân luồng định tuyến (React Router)
│   │   ├── AppContext.tsx       # Quản lý Global State (Từ vựng, Auth, Settings)
│   │   ├── types.ts             # Interfaces TypeScript chung
│   │   └── index.css            # CSS cấu hình Dark/Light theme & Glassmorphism
│   ├── vercel.json              # Cấu hình rewrite URL cho Single Page App trên Vercel
│   └── package.json             # Khai báo dependencies của client
└── docs/                        # Tài liệu dự án (spec, architecture, changelog, plans)
```

---

## 3. Quản Lý Trạng Thái & Dữ Liệu (State & Data Management)

### Luồng Truyền Dữ Liệu (Data Flow)
Dữ liệu của người dùng được đồng bộ thời gian thực thông qua mô hình dưới đây:

```
[React UI Page] 
      ↓ (Gọi Action)
[AppContext.tsx] 
      ↓ (Yêu cầu API)
[apiService.ts] ──(Gửi JWT Token trong Header)──> [Express API Server]
                                                           ↓
                                                    [Mongoose Model]
                                                           ↓
                                                    [MongoDB Atlas]
```

### Cơ chế Quản lý State cục bộ (`AppContext.tsx`)
* **`words`**: Mảng chứa danh sách từ vựng hiện tại của người dùng đăng nhập.
* **`attempts`**: Mảng chứa lịch sử các bài kiểm tra (quiz) đã hoàn thành.
* **`settings`**: Lưu thông tin Dark Mode và các cài đặt hiển thị/quiz.
* **`currentUser`** và **`isAuthenticated`**: Trạng thái phiên đăng nhập của người dùng.
* **Optimistic UI Updates (Cập nhật giao diện lạc quan)**: Khi người dùng thao tác Thêm/Sửa/Xóa từ vựng, Frontend sẽ lập tức cập nhật state local để hiển thị UI mượt mà, đồng thời gửi API chạy ngầm lên server. Nếu server trả về lỗi, Frontend sẽ tự động roll-back về dữ liệu cũ.

### Lớp Kết Nối API (`apiService.ts`)
Định nghĩa hàm bao bọc `apiFetch` để tự động đính kèm mã bảo mật JWT vào header của mỗi HTTP request:
```typescript
const token = localStorage.getItem('lingoflow_token');
if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}
```

---

## 4. Cơ Chế Xác Thực & Phân Quyền (Authentication Flow)

```
[Đăng ký / Đăng nhập] ──> [Băm mật khẩu bằng bcryptjs] ──> [Lưu DB / Kiểm tra DB]
                                                                  ↓
[Lưu trữ Token cục bộ] <── [Gửi Token JWT về Client] <── [Tạo Token JWT (Ký mã)]
```

### Chi tiết các bước:
1. **Xác thực phiên**: Khi đăng nhập hoặc đăng ký thành công, server trả về mã token JWT. Token được lưu trữ ở Local Storage dưới key `lingoflow_token`.
2. **Kiểm tra phiên đăng nhập tự động**: Khi ứng dụng khởi tạo (F5 tải lại trang), client gọi API `/api/auth/me`. 
   * Nếu Token hợp lệ, server trả về thông tin cá nhân và cài đặt của User, ứng dụng chuyển sang trạng thái `isAuthenticated = true` và tải dữ liệu học tập.
   * Nếu Token hết hạn hoặc không hợp lệ, client xóa token và chuyển hướng về màn hình đăng nhập.
3. **Bảo vệ Endpoint (Protected Routes)**: File `backend/src/middleware/auth.ts` cung cấp `authMiddleware` để chặn các request trái phép. Chỉ những request có token hợp lệ mới lấy được dữ liệu ứng với `userId` được giải mã từ token.

---

## 5. Cấu Trúc Dữ Liệu & Models (MongoDB / Mongoose)

Dự án có 3 Model chính tương tác với MongoDB Atlas:

### 5.1 User Model (`User.ts`)
Quản lý thông tin tài khoản và cấu hình của người dùng.
```typescript
const UserSchema = new Schema({
  email: { type: String, required: true, unique: true, trim: true },
  passwordHash: { type: String, required: true },
  displayName: { type: String, required: true },
  settings: {
    darkMode: { type: Boolean, default: true },
    theme: { type: String, default: 'dark' },
    defaultQuizSize: { type: Number, default: 10 },
    dailyGoal: { type: Number, default: 5 }
  }
}, { timestamps: true });
```

### 5.2 Word Model (`Word.ts`)
Lưu danh sách từ vựng riêng của từng người dùng và các thuộc tính phục vụ thuật toán Spaced Repetition.
```typescript
const WordSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  word: { type: String, required: true, trim: true },
  ipa: { type: String, default: '' },
  meaning: { type: String, required: true },
  example: { type: String, default: '' },
  topic: { type: String, default: 'Chung' },
  learned: { type: Boolean, default: false },
  box: { type: Number, min: 1, max: 5, default: 1 },
  nextReviewDate: { type: Date, default: Date.now }
}, { timestamps: true });

// Thiết lập indexes để tăng tốc độ tìm kiếm & lọc dữ liệu
WordSchema.index({ userId: 1, word: 1 });
WordSchema.index({ userId: 1, nextReviewDate: 1 });
```

### 5.3 QuizAttempt Model (`QuizAttempt.ts`)
Ghi nhận kết quả của mỗi bài quiz để tính toán các chỉ số biểu đồ trong trang Thống kê.
```typescript
const QuizAttemptSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, required: true, min: 0, max: 100 },
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  wrongAnswers: { type: Number, required: true },
  duration: { type: Number, required: true }, // giây
  topic: { type: String, default: 'Hỗn hợp' },
  date: { type: Date, default: Date.now }
});
```

---

## 6. Thuật Toán Lặp Lại Cách Khoảng (Leitner 5-Box)

Luồng nghiệp vụ xử lý trạng thái học thẻ flashcard được kiểm soát tại API `/api/words/:id/learned` như sau:

* **Khi người học nhấn "Đã nhớ" (Chưa thuộc -> Đã thuộc hoặc Đã thuộc tiếp tục nâng box)**:
  * Từ vựng được tăng thêm 1 Hộp (tối đa Hộp 5): `nextBox = Math.min(5, currentBox + 1)`.
  * Khoảng cách ngày ôn tập được tính lũy thừa theo cấp số nhân: `nextReviewDays = 2^(nextBox - 1)` (1 ngày, 2 ngày, 4 ngày, 7 ngày, 14 ngày).
  * Lên lịch ngày ôn tập tiếp theo: `nextReviewDate = Hôm nay + nextReviewDays`.
* **Khi người học nhấn "Chưa nhớ"**:
  * Từ vựng bị đẩy lập tức về Hộp 1: `nextBox = 1`.
  * Đặt lịch ôn tập lại vào ngày hôm sau: `nextReviewDate = Ngày mai`.

---

## 7. Quy Trình Sinh Đề Trắc Nghiệm (Quiz Generation)

Quá trình sinh câu hỏi diễn ra hoàn toàn ở phía client để đảm bảo tốc độ phản hồi < 100ms:
1. **Lọc kho từ vựng**: Lọc danh sách từ dựa trên chủ đề hoặc trạng thái do người học chọn.
2. **Xác định đáp án**: Với mỗi từ vựng được chọn làm câu hỏi, đáp án đúng là nghĩa (`meaning`) của từ đó.
3. **Trộn đáp án nhiễu (Distractors)**: Hệ thống lấy ngẫu nhiên 3 nghĩa khác từ kho từ vựng hiện có để làm các đáp án sai.
4. **Xáo trộn**: Dùng thuật toán Fisher-Yates để xáo trộn thứ tự các câu hỏi và thứ tự các đáp án hiển thị của mỗi câu để đảm bảo tính khách quan.
5. **Ghi nhận lịch sử**: Kết thúc bài quiz, client gọi API `POST /api/quiz/attempts` để cập nhật lịch sử lên MongoDB.

---

## 8. Triển Khai Thực Tế (Deployment & Environment)

Hệ thống được cấu hình tối ưu để chạy trên các môi trường đám mây miễn phí:

### 8.1 Frontend (Vercel)
* **Cấu hình định tuyến SPA**: Tệp `frontend/vercel.json` định cấu hình rewrite để chuyển hướng mọi URL con (ví dụ: `/vocabulary`, `/quiz`) về file chạy chính `index.html`. Việc này ngăn chặn lỗi 404 khi người dùng tải lại trang trực tiếp từ trình duyệt.
* **Biến môi trường**: `VITE_API_URL` trỏ đến địa chỉ API của Backend (ví dụ: `https://lingoflow-backend.onrender.com/api`).

### 8.2 Backend (Render)
* **Root Directory**: `backend` (để Render tập trung chạy đúng mã nguồn Node.js).
* **Build Command**: `npm install && npm run build` (Biên dịch tệp `.ts` sang thư mục chạy `dist/`).
* **Start Command**: `node dist/index.js`.
* **Cấu hình CORS**: Tệp `backend/src/index.ts` thiết lập CORS động:
  ```typescript
  const corsOptions = {
    origin: (origin, callback) => {
      // Cho phép truy cập từ localhost và tất cả các subdomain của vercel.app của dự án
      if (!origin || /https?:\/\/localhost:\d+/.test(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error('Bị chặn bởi cấu hình bảo mật CORS'));
      }
    },
    credentials: true
  };
  ```
* **Biến môi trường chính**:
  * `MONGODB_URI`: Đường dẫn kết nối MongoDB Atlas đã được mã hóa password.
  * `JWT_SECRET`: Khóa bí mật dùng để tạo chữ ký cho token JWT.
  * `FRONTEND_URL`: Địa chỉ trang web Frontend chính để bảo mật CORS.
