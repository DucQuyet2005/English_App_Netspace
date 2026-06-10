# Changelog - Đã thay đổi những gì?

Tất cả các thay đổi đáng chú ý đối với project LingoFlow được ghi nhận trong tệp này.

## Format

- **[ADDED]**: Tính năng mới
- **[CHANGED]**: Thay đổi hiện có
- **[FIXED]**: Bug fixes
- **[REMOVED]**: Tính năng bị xóa
- **[DEPRECATED]**: Tính năng sắp bị xóa
- **[SECURITY]**: Các sửa chữa bảo mật

---

## [Unreleased] - Phiên bản đang phát triển

### [PLANNED]

- AI-generated example sentences (nghĩa tiếng Việt tự động cho Extension)
- Collaborative vocabulary sharing
- Advanced charts & analytics
- Mobile app (React Native)
- PWA support (offline mode)
- Firefox Extension (WebExtension API)

---

## [v0.6.0] - 2026-06-10

Hoàn thành **Sprint 2**: Triển khai Chrome Extension **LingoFlow Helper** (US-003) — cho phép người học bôi đen từ tiếng Anh trên bất kỳ trang web nào và lưu vào kho từ vựng LingoFlow tức thì.

### [ADDED]

- **Chrome Extension – LingoFlow Helper (Manifest v3)**:
  - **Floating Button**: Content script tự động hiển thị nút ⚡ **LingoFlow** nổi lên gần selection khi người dùng bôi đen từ tiếng Anh (1–5 từ) trên bất kỳ trang web nào.
  - **Lookup Popup**: Popup tra nghĩa ngay tại chỗ — hiển thị từ, IPA, định nghĩa và câu ví dụ (lấy từ `/api/words/lookup`). Có nút "💾 Lưu vào LingoFlow".
  - **Context Menu (Chuột phải)**: Fallback khi floating button bị chặn bởi CSP — menu "💾 Lưu '{từ}' vào LingoFlow" luôn hoạt động ổn định.
  - **Popup UI đăng nhập**: Giao diện `popup.html` cho phép nhập email/password để đăng nhập vào tài khoản LingoFlow. Lưu JWT token vào `chrome.storage.local`. Hiển thị tên người dùng khi đã đăng nhập.
  - **Cấu hình Backend URL**: Trường nhập API URL trong popup — hỗ trợ cả local dev (`http://localhost:5000/api`) và production server.
  - **Toast thông báo**: Thông báo màu nổi góc phải dưới màn hình theo 4 loại: `success` (xanh), `error` (đỏ), `offline` (cam), `auth` (tím).
  - **Offline Sync Queue**: Khi mất mạng, từ vựng được đưa vào hàng đợi `chrome.storage.local`. Badge icon hiển thị số đếm cam "+N". Chrome Alarm 1 phút một lần kiểm tra mạng và tự đồng bộ thầm lặng.
  - Tạo file tài liệu kỹ thuật đầy đủ tại `docs/plans/extension.md`.

- **API Backend mới `GET /api/words/lookup?word=xxx`**:
  - Endpoint tra nghĩa phía server (proxy): gọi Free Dictionary API từ backend, tránh vấn đề CORS khi extension gọi trực tiếp.
  - Trả về: `{ word, ipa, meaning, example }`. Nếu từ không tìm thấy, trả về cấu trúc rỗng với `notFound: true` để extension vẫn lưu được từ.
  - Timeout 5 giây — nếu quá hạn, extension fallback sang gọi Free Dictionary API trực tiếp.

### [CHANGED]

- **`backend/src/index.ts` — CORS**: Thêm `chrome-extension://` và `moz-extension://` vào danh sách allowed origins để Chrome Extension có thể gọi API thành công.

---

## [v0.5.0] - 2026-06-09

Hoàn thành **Sprint 1**: Tích hợp tính năng Kiểm tra Phát âm bằng Giọng nói (US-002) và sửa lỗi đồng bộ trạng thái "Đã thuộc" giữa Flashcard và Từ vựng.

### [ADDED]

- **Tính năng Kiểm tra Phát âm bằng Giọng nói (Voice Recognition - US-002)**:
  - Thêm nút **Microphone** (🎤 Kiểm tra phát âm) trên mặt trước thẻ Flashcard, cạnh nút loa phát âm.
  - Tích hợp **Web Speech API** (`SpeechRecognition`) với cấu hình `lang='en-US'`, `maxAlternatives=3` để lấy phương án nhận diện tốt nhất.
  - Thuật toán **Levenshtein Distance** chấm điểm phát âm: tính tỷ lệ tương đồng (0–100%) sau khi chuẩn hóa chuỗi (lowercase, xóa dấu câu).
  - Ngưỡng chấp nhận **75%**: phân 3 mức phản hồi (Xuất sắc ≥95%, Tốt 75–94%, Cần cải thiện <75%).
  - Kết quả hiển thị với **AnimatePresence** mượt mà (fade + slide), thanh progress bar trực quan, tự động ẩn sau 4 giây.
  - Nút Microphone ẩn hoàn toàn nếu trình duyệt không hỗ trợ Web Speech API (tự động kiểm tra `isSpeechRecognitionSupported()`).
  - Xử lý đầy đủ các edge case: `no-speech`, `not-allowed` (mic bị chặn), lỗi runtime.
  - Tạo tệp tiện ích tập trung `frontend/src/utils/voiceHelper.ts` với các hàm: `normalizeString`, `levenshteinDistance`, `calculateSimilarity`, `startVoiceRecognition`.
  - Lập tài liệu kỹ thuật đầy đủ tại `docs/plans/voice.md`.

- **API Backend mới `PATCH /api/words/:id/set-learned`**:
  - Endpoint set trực tiếp trạng thái `learned` (không toggle) kèm cập nhật hộp Leitner đúng chiều.
  - Được sử dụng bởi Flashcard thay thế endpoint toggle cũ để đảm bảo tính nhất quán dữ liệu.

### [FIXED]

- **Sửa lỗi đồng bộ trạng thái "Đã thuộc" giữa Flashcard và Từ vựng**:
  - **Mô tả lỗi**: Khi người dùng nhấn "Đã nhớ" trong Flashcard, trạng thái "Đã thuộc" trong trang Từ vựng không cập nhật đúng. Nguyên nhân: logic cũ dùng `toggleWordLearned` (đảo ngược), gây race condition — nếu từ đã `learned=true`, toggle sẽ set lại thành `false`.
  - **Giải pháp**: Tạo hàm `setWordLearned(id, learned)` trong `AppContext.tsx` gọi endpoint `PATCH /api/words/:id/set-learned` để **set trực tiếp** giá trị `learned=true/false`.
  - "Đã nhớ" ✓ → luôn set `learned=true`, nâng hộp Leitner.
  - "Chưa nhớ" ✗ → luôn set `learned=false`, reset về Hộp 1.

---

## [v0.4.0] - 2026-06-07


Bổ sung hệ thống Gamification với tính năng Bảng xếp hạng tuần (Weekly Leaderboard) giúp tăng cường độ tương tác và động lực học tập của người dùng.

### [ADDED]

- **Tính năng Bảng Xếp Hạng Tuần (Weekly Leaderboard)**:
  - Thiết kế UI/UX trang `Leaderboard.tsx` theo phong cách Premium Glassmorphism, làm nổi bật Top 3 người dẫn đầu (Vinh danh Huy chương Vàng, Bạc, Đồng) và hiệu ứng viền sáng (glow) đối với hạng của người dùng hiện tại.
  - Xây dựng thuật toán tính điểm xếp hạng tự động qua API `GET /api/users/leaderboard` bằng kỹ thuật MongoDB Aggregation Pipeline (gom nhóm bài thi Quiz theo tuần và tổng hợp câu đúng).
  - Thiết lập cơ chế Time-Windowing tự động tính điểm từ 00:00 Thứ Hai đến 23:59 Chủ Nhật, tự động tạo chu kỳ xếp hạng mới mà không cần can thiệp dọn dẹp DB.
  - Cập nhật thanh điều hướng `Sidebar.tsx` và `MobileNav.tsx` để hiển thị menu "Xếp hạng" (biểu tượng Trophy), hỗ trợ dịch ngôn ngữ i18n.
  - Lập đặc tả tài liệu triển khai Bảng xếp hạng tuần tại `docs/plans/rank.md`.

---

## [v0.3.0] - 2026-06-07

Bổ sung tính năng chuyển đổi ngôn ngữ hiển thị toàn diện (đa ngôn ngữ i18n) cho giao diện người dùng và lưu trữ cấu hình trên client-side.

### [ADDED]

- **Tính năng Đa ngôn ngữ (i18n - Internationalization)**:
  - Cho phép người dùng chuyển đổi ngôn ngữ giao diện linh hoạt giữa **Tiếng Việt** (mặc định) và **Tiếng Anh**.
  - Thiết lập bộ quản lý trạng thái ngôn ngữ `LanguageContext.tsx` lưu trữ lựa chọn của người dùng trong `localStorage` để tải nhanh tức thì (zero latency), tránh giật/nháy giao diện khi tải trang.
  - Xây dựng tệp từ điển dịch thuật tập trung `translations.ts` chứa đầy đủ từ khóa và chuỗi hiển thị cho Sidebar, TopBar, Dashboard và trang Xác thực (Auth).
  - Tích hợp nút chuyển đổi đơn (Single Toggle Button) hiển thị cờ quốc gia linh hoạt (Mỹ 🇺🇸 / Việt Nam 🇻🇳) tại Sidebar để chuyển đổi trực quan.
  - Cập nhật toàn bộ các chuỗi văn bản tĩnh trong các component chính như `Sidebar.tsx`, `TopBar.tsx`, và `Dashboard.tsx` thông qua hàm dịch `t()`.
  - Tạo tài liệu đặc tả thiết kế chi tiết tại `docs/plans/languageapp.md`.

---

## [v0.2.0] - 2026-06-06

Tích hợp tính năng phát âm từ vựng (Text-to-Speech) và cập nhật hệ thống tài liệu đồng bộ kiến trúc MERN stack.

### [ADDED]

- **Tính năng Phát âm Từ vựng (Audio Pronunciation)**:
  - Thêm tiện ích `audioHelper.ts` gọi API từ điển để phát âm thanh người thật (.mp3) hoặc tự động chuyển sang bộ đọc Web Speech API (TTS) làm dự phòng khi lỗi mạng hoặc không có file âm thanh.
  - Tích hợp nút loa phát âm kèm loading spinner xoay tròn sinh động trên trang quản lý Từ vựng (`Vocabulary.tsx`) và thẻ học `FlashcardsPage.tsx`.
  - Tạo tài liệu đặc tả thiết kế tại `docs/plans/textToSpeech.md`.
- **Đồng bộ hóa tài liệu dự án (Docs)**:
  - Cập nhật toàn diện `spec.md` và `architecture.md` mô tả chuẩn xác cấu trúc MERN Stack, các MongoDB schemas thực tế, xác thực JWT cục bộ và quy trình triển khai đám mây.
  - Cập nhật hướng dẫn cài đặt và khởi chạy chi tiết cho cả Frontend và Backend trong `README.md`.

### [FIXED]

- **Sửa lỗi giao diện Responsive trên Di động**:
  - Khắc phục lỗi Sidebar bị ẩn cứng trên di động bằng cách chuyển sang dạng trượt (Drawer sidebar) kèm lớp phủ mờ (Backdrop overlay) và nút đóng `X`.
  - Liên kết sự kiện Hamburger Menu trên TopBar giúp mở Sidebar dễ dàng trên màn hình nhỏ.
  - Sửa lỗi không hiển thị phần **Cài đặt** và thông tin tài khoản trên di động bằng cách tích hợp trực tiếp chúng vào Sidebar di động và tự động thu gọn sau khi chuyển tab.

---

## [v0.1.0] - 2026-06-05

Bản cập nhật quan trọng tích hợp hệ thống Backend (Client-Server), xác thực người dùng bảo mật và nâng cấp giao diện người dùng.

### [ADDED]

- **Hệ thống Backend (Express & MongoDB)**:
  - Khởi tạo Express server kết nối cơ sở dữ liệu MongoDB Atlas (Mongoose).
  - Cập nhật `apiService.ts` để đồng bộ hóa dữ liệu từ Frontend lên Cloud DB (thay thế LocalStorage).
  - Thêm API xuất/nhập (Import/Export) dữ liệu và reset tài khoản.
- **Xác thực người dùng (Auth)**:
  - Thêm chức năng Đăng ký / Đăng nhập, bảo mật API bằng JWT và mã hóa mật khẩu qua `bcryptjs`.
- **UI/UX & Giao diện**:
  - Thiết kế Premium Glassmorphism mượt mà với `motion/react`, font Serif cao cấp cho từ vựng.
  - Tích hợp Free Dictionary API tự động điền phiên âm IPA khi tạo/sửa từ mới.
  - Đồng bộ tìm kiếm hai chiều thời gian thực giữa TopBar và màn quản lý Vocabulary.
  - Cấu hình chế độ tối (Dark Mode) làm mặc định và cải thiện Light Mode.

### [FIXED]

- Sửa lỗi hiển thị Dark Mode (đảo ngược màu) và tối ưu độ tương phản Light Mode.
- Khắc phục lỗi chặn CORS (hỗ trợ dynamic subdomains trên Vercel) và lỗi gọi API khi deploy.
- Sửa lỗi chạy local (nodemon, port) trên Windows.

---

## [v0.0.0] - 2026-06-04

### Project Initialization

Khởi tạo dự án LingoFlow từ AI Studio template.

### [ADDED]

#### Core Infrastructure

- React 19 + TypeScript 5.8 setup với Vite
- Tailwind CSS 4.1 với Dark mode support
- Responsive design framework (Desktop/Tablet/Mobile)
- Local Storage persistence layer

#### Page Components

- **Dashboard** (`src/pages/Dashboard.tsx`)
  - Quick stats overview
  - Today's learning summary
  - Quick action buttons

- **Vocabulary Management** (`src/pages/Vocabulary.tsx`)
  - Add new words with word, IPA, meaning, example, topic
  - Display words in table format
  - Search by word or meaning (case-insensitive)
  - Filter by topic, learning status, box
  - Sort by creation date, word name, status
  - Edit word details
  - Delete words
  - Mark as learned/not learned
  - Responsive grid layout on mobile

- **Flashcard Learning** (`src/pages/FlashcardsPage.tsx`)
  - Display cards with flip animation
  - Front: word + IPA + example
  - Back: meaning (Vietnamese)
  - Mark "Learned" (move up box) / "Not learned" (move down box)
  - Spaced repetition based on Leitner System
  - Progress counter (X/Y cards)
  - Only show due cards (nextReviewDate <= today)

- **Quiz Mode** (`src/pages/QuizPage.tsx`)
  - Multiple choice questions (4 options)
  - One correct answer + 3 random distractors
  - Shuffle options
  - Instant feedback (correct/incorrect)
  - Final score and accuracy percentage
  - Save attempts to attempts[]
  - Quiz filters: All words / By topic / Due words / Unlearned

- **Statistics** (`src/pages/StatsPage.tsx`)
  - Total words count
  - Learned vs. to-learn breakdown
  - Box distribution (1-5)
  - Quiz attempt history
  - Accuracy trend
  - Most/least learned topics
  - Words with lowest accuracy (weak words)
  - Today's stats summary

- **Settings** (`src/pages/SettingsPage.tsx`)
  - Dark mode toggle (saves to AppSettings)
  - Quiz count configuration (default 10)
  - Shuffle questions toggle
  - Font size selector (small/medium/large)
  - Export data as JSON file
  - Import data from JSON file with validation
  - Reset all data confirmation dialog
  - Settings persisted to Local Storage

#### UI Components

- **Sidebar** (`src/components/Sidebar.tsx`)
  - Fixed left navigation (desktop only)
  - Links: Dashboard, Vocabulary, Flashcards, Quiz, Stats, Settings
  - Active tab indicator
  - Responsive hide on mobile

- **TopBar** (`src/components/TopBar.tsx`)
  - Header with logo/title
  - Search input (integrated with Vocabulary page)
  - Dark mode toggle button
  - Settings icon
  - Responsive hamburger menu (mobile)

- **Mobile Navigation** (`src/components/MobileNav.tsx`)
  - Bottom fixed navigation (mobile only)
  - Icons + labels for main pages
  - Active indicator
  - Touch-friendly spacing

#### State Management

- **AppContext** (`src/AppContext.tsx`)
  - Global state for words, attempts, settings, activeTab
  - Actions: addWord, updateWord, deleteWord, addAttempt, updateSettings, etc.
  - Local Storage persistence (getWords, saveWords, etc.)
  - Automatic dark mode application on mount
  - Import/export functionality with error handling

#### Storage Service

- **storageService.ts** (`src/services/storageService.ts`)
  - getWords() / saveWords()
  - getAttempts() / saveAttempts()
  - getSettings() / saveSettings()
  - clearLocalStorage()
  - Initial data with 8 family-related words (Vietnamese)
  - Keys: lingoflow_words, lingoflow_attempts, lingoflow_settings

#### Type Definitions

- **types.ts** (`src/types.ts`)
  - Word interface (id, word, ipa, meaning, example, topic, learned, box, nextReviewDate, createdAt)
  - QuizAttempt interface (id, correct, total, duration, topic, timestamp)
  - AppSettings interface (darkMode, quizCount, shuffleQuestions, fontSize)
  - TabType union type

#### Styling

- **Global CSS** (`src/index.css`)
  - Tailwind CSS directives
  - Custom animations (flip, fade, etc.)
  - Dark mode variables

- **Responsive Design**
  - Mobile-first approach
  - Tailwind breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
  - Flex layouts for centering and spacing
  - Adaptive font sizes and padding

#### Tooling & Configuration

- **vite.config.ts**
  - React plugin
  - Tailwind CSS plugin
  - Path alias (@)
  - HMR disabled in AI Studio (DISABLE_HMR env var)

- **tsconfig.json**
  - Target: ES2020
  - JSX: react-jsx
  - Strict mode enabled
  - Path alias configuration

- **package.json**
  - Scripts: dev, build, preview, clean, lint
  - Dependencies: React, ReactDOM, Vite, Tailwind, TypeScript, etc.
  - Metadata: name (react-example), version (0.0.0), type (module)

- **metadata.json**
  - App name: LingoFlow
  - Description: "Ứng dụng học tiếng Anh thông minh với Flashcard, Quiz sinh động, Quản lý từ vựng khoa học và Thống kê tiến độ trực quan"
  - Major capability: MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API

#### Documentation

- **README.md**
  - Setup instructions (npm install, set GEMINI_API_KEY, npm run dev)
  - Link to AI Studio app

- **docs/spec.md** (này chính là specification file)
  - Feature specification
  - Requirements (functional & non-functional)
  - Data models
  - Future roadmap

- **docs/architecture.md** (này chính là architecture file)
  - Technology stack
  - Project structure
  - Component architecture
  - Storage service design
  - Responsive design patterns
  - Dark mode implementation
  - Performance considerations

- **docs/changelog.md** (chính tệp này)
  - Change history log

#### Initial Data

- **8 Family Words** (seed data in storageService.ts)
  - Mother, Father, Brother, Sister, Grandmother, Grandfather, Uncle, Aunt
  - Each with: IPA, Vietnamese meaning, example sentence, "Gia đình" topic
  - Some marked as learned (box 2-3), others not learned (box 1)

#### Default Settings

- **Default AppSettings**
  - darkMode: false (Light mode by default)
  - quizCount: 10 (10 questions per quiz)
  - shuffleQuestions: true
  - fontSize: 'medium'

#### Known Limitations

- Local Storage only (no cloud sync)
- No audio pronunciation
- No images for words
- No real-time collaboration
- Leitner System simplified (fixed intervals)
- Quiz doesn't update word status (manual flashcard learning only)

---

## Version Strategy

This project follows semantic versioning:

- **Major.Minor.Patch** (e.g., 1.2.3)
- 0.x.x = Active development
- 1.0.0 = First stable release
- x.y.z = No breaking changes within major version

---

## Future Release Plans

### v0.1.0 (Q3 2026)

- [ ] Audio pronunciation with Web Audio API
- [ ] AI-generated example sentences (Gemini API)
- [ ] Improved quiz analytics

### v0.2.0 (Q4 2026)

- [ ] Backend API (Node.js + Database)
- [ ] User authentication
- [ ] Cloud sync

### v1.0.0 (2027)

- [ ] Stable feature set
- [ ] Mobile app (React Native)
- [ ] PWA offline support

---

## Migration Guide

### Upgrade from pre-release to v1.0.0

- All Local Storage keys remain unchanged (backward compatible)
- New features are additive (no breaking changes expected)
- Data export/import ensures portability

### Backup Your Data

```bash
# Export data before major upgrades:
1. Go to Settings
2. Click "Export Data"
3. Save the JSON file safely
```

---

## Contributors

- **Initial Development**: AI Studio Generated Code (June 2026)
- **Refinements**: [Your name here]

---

## Reporting Issues

Found a bug? Please document:

1. Version: v0.0.0
2. Browser: Chrome 126.0
3. OS: Windows 11
4. Steps to reproduce:
   - Step 1
   - Step 2
   - Step 3
5. Expected vs. Actual result
6. Screenshots/screen recording (if applicable)

---

## License

To be determined.
