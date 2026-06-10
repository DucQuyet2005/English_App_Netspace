# extension.md — LingoFlow Helper Chrome Extension

## Tổng quan

**LingoFlow Helper** là Chrome Extension (Manifest v3) cho phép người học tiếng Anh bôi đen bất kỳ từ/cụm từ nào trên bất kỳ trang web nào, tra nghĩa ngay lập tức qua từ điển và lưu vào kho từ vựng LingoFlow chỉ với một cú nhấp chuột.

---

## Cấu trúc thư mục

```
extension/
├── manifest.json        # Manifest v3 – khai báo extension
├── background.js        # Service Worker – API calls, offline queue, badge
├── content.js           # Content Script – floating button, lookup popup
├── popup.html           # Popup UI – đăng nhập & trạng thái
├── popup.js             # Popup logic – auth, server URL config
├── styles.css           # Shared CSS – Glassmorphism dark theme
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## Cài đặt & Load Extension (Development)

1. Mở Chrome → Truy cập `chrome://extensions/`
2. Bật **Developer mode** (góc trên phải)
3. Nhấn **"Load unpacked"**
4. Chọn thư mục `extension/` trong dự án
5. Icon ⚡ xuất hiện trên thanh toolbar Chrome

---

## Cấu hình API URL

Lần đầu sử dụng, mở popup extension và nhập **Backend API URL** của LingoFlow:
- **Local dev**: `http://localhost:3000/api`
- **Production**: `https://your-backend.onrender.com/api`

Nhấn nút **"Lưu"** để lưu cấu hình vào `chrome.storage.local`.

---

## Luồng hoạt động chi tiết

### Luồng 1: Bôi đen → Floating Button

```
1. Người dùng bôi đen từ "Prosperous" trên trang web bất kỳ
2. content.js phát hiện mouseup event với selection text
3. Floating Button ⚡ nổi lên gần vị trí con trỏ
4. Click vào Floating Button → mở Lookup Popup
5. Popup tự động gọi GET /api/words/lookup?word=prosperous
6. Hiển thị: word / IPA / meaning / example
7. Nhấn "💾 Lưu vào LingoFlow"
8. background.js gọi POST /api/words + Bearer Token
9. Toast thông báo: "✅ Đã lưu 'Prosperous' (Thịnh vượng) vào LingoFlow!"
```

### Luồng 2: Context Menu (Chuột phải)

```
1. Bôi đen từ → Chuột phải
2. Chọn "💾 Lưu 'Prosperous' vào LingoFlow" trong context menu
3. background.js tự tra nghĩa + lưu
4. Toast thông báo thành công
```

### Luồng 3: Offline Mode

```
1. Bôi đen từ → Click lưu → Mạng bị ngắt
2. background.js phát hiện mất kết nối
3. Từ được đưa vào Offline Sync Queue (chrome.storage.local)
4. Badge icon hiển thị "+N" màu cam
5. Khi mạng khôi phục → Alarm 1 phút kích hoạt processSyncQueue()
6. Tất cả từ chờ được đồng bộ lên server
7. Toast: "✅ Đã đồng bộ N từ vựng lên LingoFlow!"
```

---

## API Endpoints liên quan

### Đăng nhập
```http
POST /api/auth/login
Content-Type: application/json

{ "email": "user@example.com", "password": "secret" }
```

### Tra nghĩa từ
```http
GET /api/words/lookup?word=prosperous
Authorization: Bearer <JWT>

Response:
{
  "success": true,
  "word": "prosperous",
  "ipa": "/ˈprɒs.pər.əs/",
  "meaning": "(adjective) successful in material terms; flourishing financially.",
  "example": "a prosperous businessman"
}
```

### Lưu từ vào kho từ vựng
```http
POST /api/words
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "word": "prosperous",
  "ipa": "/ˈprɒs.pər.əs/",
  "meaning": "(adjective) successful in material terms",
  "example": "a prosperous businessman",
  "topic": "Extension"
}
```

---

## Permissions sử dụng (Manifest v3)

| Permission | Lý do |
|------------|-------|
| `storage` | Lưu token JWT, API URL, offline queue vào `chrome.storage.local` |
| `contextMenus` | Tạo menu "Lưu vào LingoFlow" khi chuột phải |
| `activeTab` | Gửi message tới tab đang mở để hiển thị toast |
| `scripting` | Inject content script khi cần thiết |
| `alarms` | Kiểm tra offline queue mỗi 1 phút |
| `<all_urls>` | Content script hoạt động trên mọi trang web |

---

## Edge Cases & Xử lý lỗi

| Tình huống | Hành vi |
|-----------|---------|
| Token hết hạn | Hiển thị toast tím: "Vui lòng đăng nhập lại qua icon Extension" |
| Mất mạng khi lưu | Đưa vào offline queue, badge cam "+N", tự đồng bộ khi có mạng |
| CSP cực đoan chặn inject | Floating button không hiển thị nhưng Context Menu vẫn hoạt động |
| Từ > 5 từ được bôi đen | Toast lỗi: "Vui lòng chọn từ ngắn hơn (tối đa 5 từ)" |
| Từ không có trong từ điển | Lưu từ với `meaning=""`, người dùng có thể sửa sau trong app |
| Server timeout | Lookup fallback sang Free Dictionary API trực tiếp |

---

## CORS Backend

Để extension gọi được API, `backend/src/index.ts` đã được cập nhật cho phép origin từ:
- `chrome-extension://` (Chrome Extension)
- `moz-extension://` (Firefox Extension – tương lai)

---

## Data Flow

```
[Content Script / Context Menu]
         ↓
[background.js Service Worker]
    ├── GET /api/words/lookup   → Free Dictionary API (server-side)
    └── POST /api/words         → MongoDB (lưu vào kho từ vựng)
         ↓
[chrome.storage.local]          → Offline queue khi mất mạng
         ↓
[chrome.alarms (1 phút)]        → Tự đồng bộ khi mạng khôi phục
```

---

## Giới hạn hiện tại

- Extension chỉ nhận diện ký tự Latin (a-z, space, dấu gạch ngang). Không hỗ trợ các ngôn ngữ không dùng bảng chữ cái Latin.
- Nghĩa từ tự động dịch sang tiếng Việt: Endpoint `/api/words/lookup` và hàm fallback của extension tích hợp Google Translate để trả về nghĩa tiếng Việt và Việt hóa từ loại (ví dụ: `(tính từ) ...`).
- Popup tra nghĩa chỉ hiển thị định nghĩa đầu tiên (part of speech thứ nhất).

---

## Hướng mở rộng (v1.1+)

- **Popup AI nghĩa ngữ cảnh**: Dùng Gemini API để giải thích từ trong ngữ cảnh câu đang đọc.
- **Lịch sử bôi đen**: Hiển thị 10 từ vừa lưu trong popup extension.
- **Firefox support**: Extension đã sẵn sàng cho WebExtension API (thay `chrome.*` bằng `browser.*`).
- **Pin từ trực tiếp**: Không mở popup, lưu ngay khi bôi đen với shortcut `Alt+S`.
