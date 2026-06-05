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

### [ADDED]

- Tích hợp Free Dictionary API tự động điền phiên âm IPA chuẩn khi người dùng thêm/sửa từ mới.
- Đồng bộ hóa thanh tìm kiếm (Search Bar) hai chiều giữa Header (TopBar) và trang Quản lý từ vựng (Vocabulary).
- Placeholder cho tính năng AI suggestions (Google Gemini API in dependencies)
- Motion library cho smooth animations (placeholder)
- Express.js dependency cho backend (future-proofing)
- Thêm hệ thống đăng nhập/đăng ký cục bộ với LocalStorage cho dữ liệu người dùng riêng
- Hệ thống Backend hoàn chỉnh sử dụng Node.js, Express.js và MongoDB Atlas (Mongoose)
- Xác thực người dùng bảo mật với JSON Web Token (JWT) và mã hóa mật khẩu bằng bcryptjs
- API service layer (`apiService.ts`) đồng bộ hóa dữ liệu từ Frontend lên Cloud MongoDB thay thế LocalStorage
- Tính năng Import/Export dữ liệu học tập và Reset dữ liệu qua API
- Hỗ trợ cấu hình proxy và tệp cấu hình vercel.json sẵn sàng để deploy thực tế lên Vercel + Render

### [FIXED]

- Khắc phục lỗi đảo ngược bảng màu trong chế độ Dark theme, đảm bảo các lớp dark: hoạt động đúng chuẩn
- Loại bỏ các quy tắc CSS ép buộc `!important` trong Light theme gây mờ chữ hoặc mất độ tương phản

### [PLANNED]

- Audio pronunciation support (text-to-speech)
- AI-generated example sentences
- Cloud sync (Firebase / Supabase)
- User accounts & authentication
- Collaborative vocabulary sharing
- Advanced charts & analytics
- Mobile app (React Native)
- PWA support (offline mode)

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
