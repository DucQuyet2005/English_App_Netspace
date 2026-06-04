# LingoFlow 📚

Ứng dụng học tiếng Anh thông minh sử dụng **Spaced Repetition** và **Leitner System** để tối ưu hóa việc ghi nhớ từ vựng.

## 🎯 Mục Đích Dự Án

Cung cấp một nền tảng học tiếng Anh toàn diện, không phí, hoạt động hoàn toàn offline với các tính năng:

- 📚 **Quản lý từ vựng** với IPA và ví dụ tiếng Anh
- 🎴 **Flashcard học tập** theo hệ thống Leitner (5 box)
- 🎯 **Quiz trắc nghiệm** với phân tích chi tiết
- 📊 **Thống kê tiến độ** trực quan
- ⚙️ **Cài đặt linh hoạt** (Dark mode, Export/Import dữ liệu)

## 🛠️ Công Nghệ

- **React 19** + **TypeScript 5.8** + **Vite 6.2**
- **Tailwind CSS 4.1** for styling
- **Local Storage** for data persistence (no backend needed)

## 🚀 Cài Đặt & Chạy

### Yêu cầu

- Node.js ≥ 18.0
- npm ≥ 9.0

### Bước 1: Cài đặt Dependencies

```bash
npm install
```

### Bước 2: Chạy Development Server

```bash
npm run dev
```

Mở http://localhost:3000

### Bước 3: Build Production

```bash
npm run build
```

## 📁 Cấu Trúc Chính

```
src/
├── pages/              # Dashboard, Vocabulary, Flashcards, Quiz, Stats, Settings
├── components/         # Sidebar, TopBar, MobileNav
├── services/          # storageService.ts (Local Storage)
├── AppContext.tsx     # Global state management
└── types.ts           # TypeScript interfaces
```

## 📖 Tài Liệu Chi Tiết

- [**spec.md**](./docs/spec.md) - Đặc tả tính năng
- [**architecture.md**](./docs/architecture.md) - Kiến trúc kỹ thuật
- [**changelog.md**](./docs/changelog.md) - Lịch sử phiên bản

## 💾 Lưu Trữ & Bảo Mật

- Tất cả dữ liệu lưu **Local Storage** (không gửi server)
- Hỗ trợ **Export/Import** dữ liệu dạng JSON
- **Local-first architecture** - hoạt động hoàn toàn offline

## 📝 Các Lệnh Thường Dùng

| Lệnh              | Mục đích                      |
| ----------------- | ----------------------------- |
| `npm run dev`     | Chạy dev server (HMR enabled) |
| `npm run build`   | Build production              |
| `npm run preview` | Preview production build      |
| `npm run lint`    | Type checking                 |
| `npm run clean`   | Xóa build artifacts           |

## 🌐 Trình Duyệt Hỗ Trợ

Chrome, Firefox, Safari 14+, Edge (Latest versions)

## 📄 License

MIT License

---

**Được tạo để giúp người học tiếng Anh hiệu quả hơn! ✨**
