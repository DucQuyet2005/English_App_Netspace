# Tài Liệu Kỹ Thuật: Tính Năng Nhận Diện Giọng Nói & Kiểm Tra Phát Âm (US-002)

Sprint 1 — LingoFlow v0.5.0 | 09/06/2026

---

## 1. Tổng Quan & Mục Tiêu

Tính năng **Kiểm tra phát âm bằng giọng nói** cho phép người học nhấn giữ nút Microphone trong màn hình Thẻ ghi nhớ (Flashcard), đọc to từ vựng tiếng Anh, và nhận phản hồi chấm điểm phát âm tức thì từ hệ thống.

### Mục tiêu cốt lõi (KPI từ Recall_day6)

| KPI | Mô tả | Ngưỡng |
|-----|-------|--------|
| Accuracy Threshold | Tỷ lệ tương đồng âm thanh tối thiểu để chấp nhận | ≥ 75% |
| Noise Tolerance | Chấp nhận phát âm gần đúng trong môi trường có tiếng ồn | Levenshtein-based |
| Latency | Thời gian từ lúc dừng nói đến khi hiển thị kết quả | < 500ms |

---

## 2. Kiến Trúc Hệ Thống

### 2.1 Luồng Hoạt Động

```
[Người dùng nhấn nút Mic]
        ↓
[startVoiceRecognition(targetWord)]
        ↓
[Web Speech API — SpeechRecognition (en-US)]
        ↓ (Tối đa 3 alternatives)
[Chuẩn hóa chuỗi — normalizeString()]
        ↓
[Levenshtein Distance + tính similarity]
        ↓
[So sánh với PASS_THRESHOLD = 0.75]
        ↓
[Hiển thị kết quả + Progress Bar + Thông điệp UI]
```

### 2.2 Xử Lý Trường Hợp Ngoại Lệ (Edge Cases)

| Kịch bản | Giải pháp |
|----------|-----------|
| Môi trường ồn, phát âm không chuẩn xác hoàn toàn | Dùng 3 `alternatives` từ API, chọn cái có similarity cao nhất |
| Trình duyệt không hỗ trợ Web Speech API | Ẩn nút Mic (kiểm tra bằng `isSpeechRecognitionSupported()`) |
| Không phát hiện giọng nói (`no-speech`) | Trả về thông báo gợi ý đọc to và rõ hơn |
| Quyền Microphone bị từ chối (`not-allowed`) | Hướng dẫn người dùng cấp quyền trong cài đặt trình duyệt |
| Lỗi mạng hoặc lỗi runtime | Resolve với `null`, không crash UI |

---

## 3. Thuật Toán Chấm Điểm Phát Âm

### 3.1 Chuẩn Hóa Chuỗi

Trước khi so sánh, cả chuỗi nhận diện lẫn từ mục tiêu đều được chuẩn hóa:

```typescript
const normalizeString = (str: string): string =>
  str.toLowerCase()           // Chuyển thường
     .replace(/[^a-z\s]/g, '') // Xóa ký tự đặc biệt, dấu câu
     .trim()
     .replace(/\s+/g, ' ');    // Xóa khoảng trắng thừa
```

**Ví dụ:** `"Enterprise!"` → `"enterprise"`, `"ad·ven·ture"` → `"adventure"`

### 3.2 Levenshtein Distance

```typescript
const levenshteinDistance = (a: string, b: string): number => {
  // Ma trận DP kích thước (m+1) × (n+1)
  // dp[i][j] = số lần chỉnh sửa tối thiểu để biến a[0..i-1] thành b[0..j-1]
  // Độ phức tạp: O(m × n) time, O(m × n) space
};
```

### 3.3 Tính Tỷ Lệ Tương Đồng

$$\text{similarity} = 1 - \frac{\text{levenshtein\_distance}(\text{recognized}, \text{target})}{\max(\text{len}(\text{recognized}), \text{len}(\text{target}))}$$

### 3.4 Phân Cấp Phản Hồi

| Tỷ lệ tương đồng | Kết quả | Thông điệp |
|-----------------|---------|-----------|
| ≥ 95% | ✅ Pass - Xuất sắc | "Xuất sắc! Phát âm của bạn đạt X% - Hoàn toàn chuẩn xác! 🎉" |
| 75% – 94% | ✅ Pass - Tốt | "Khá tốt! Phát âm của bạn đạt X% - Tiếp tục luyện tập! 👍" |
| < 75% | ❌ Fail | "Bạn vừa đọc: 'Y'. Độ khớp X% — Hãy thử lại! 🔄" |

---

## 4. Cấu Trúc Mã Nguồn

### 4.1 File Mới

#### `frontend/src/utils/voiceHelper.ts`

Hàm tiện ích tập trung toàn bộ logic nhận diện giọng nói:

| Export | Kiểu | Mô tả |
|--------|------|-------|
| `VoiceRecognitionResult` | interface | Kiểu dữ liệu kết quả trả về |
| `normalizeString(str)` | function | Chuẩn hóa chuỗi |
| `levenshteinDistance(a, b)` | function | Tính khoảng cách Levenshtein |
| `calculateSimilarity(recognized, target)` | function | Tính tỷ lệ tương đồng 0.0–1.0 |
| `isSpeechRecognitionSupported()` | function | Kiểm tra hỗ trợ trình duyệt |
| `startVoiceRecognition(word, onStart, onEnd)` | async function | Bắt đầu nhận diện và trả kết quả |

### 4.2 File Thay Đổi

#### `frontend/src/pages/FlashcardsPage.tsx`

**Thay đổi chính:**
- Import `startVoiceRecognition`, `isSpeechRecognitionSupported`, `VoiceRecognitionResult` từ `voiceHelper`
- Thêm states: `isListening`, `voiceResult`, `showVoiceResult`
- Thêm handler `handleVoiceCheck()` — bắt đầu ghi âm và hiển thị kết quả
- Render nút Microphone với trạng thái animation `animate-pulse` khi đang nghe
- Render kết quả với `AnimatePresence` (hiện/ẩn mượt mà, tự động ẩn sau 4 giây)
- Thanh progress bar trực quan cho tỷ lệ phần trăm

---

## 5. Thiết Kế Giao Diện (UI/UX)

### 5.1 Trạng thái nút Microphone

```
[Trạng thái bình thường]
  🎤  Kiểm tra phát âm
  Màu: Violet — border nhẹ, hover tăng nền

[Đang lắng nghe]
  🎤  Đang nghe... (animate-pulse)
  Màu: Rose — viền đỏ, không cho click thêm

[Trình duyệt không hỗ trợ]
  Nút được ẩn hoàn toàn (không chiếm không gian UI)
```

### 5.2 Hiển thị kết quả

```
[Pass ≥ 75%]
  ✅ Nền xanh lá (emerald)
  Thông điệp tích cực
  Progress bar xanh lá tương ứng %

[Fail < 75%]
  ❌ Nền đỏ nhạt (rose)
  Cho xem lại chuỗi người dùng đã nói
  Progress bar đỏ tương ứng %

  → Kết quả tự động ẩn sau 4 giây (setTimeout)
  → Hiệu ứng motion: fade + slide từ trên xuống
```

---

## 6. Acceptance Criteria (Gherkin)

### Kịch bản 1: Phát âm chuẩn xác (≥ 95%)

```gherkin
Given Người học đang học thẻ từ "Enterprise" và đã cấp quyền Microphone
When Người học nhấn nút "Kiểm tra phát âm" và đọc to "Enterprise"
Then Hệ thống hiển thị viền xanh lá và thông báo "Xuất sắc! Phát âm của bạn đạt 100%"
```

### Kịch bản 2: Phát âm gần đúng (75% – 94%)

```gherkin
Given Thẻ từ đang hiển thị là "Adventure"
When Người học đọc "Advent-ure" (có chút lệch giọng)
Then Hệ thống hiển thị "Khá tốt! Phát âm của bạn đạt 82%"
And Nút "Đã nhớ" / "Chưa nhớ" vẫn hoạt động bình thường
```

### Kịch bản 3: Phát âm sai quá ngưỡng (< 75%)

```gherkin
Given Thẻ từ đang hiển thị là "Adventure"
When Người học đọc "Advertisement"
Then Hệ thống báo đỏ: "Bạn vừa đọc: 'advertisement'. Độ khớp 65% — Hãy thử lại!"
And Kết quả tự động ẩn sau 4 giây
```

### Kịch bản 4: Trình duyệt không hỗ trợ

```gherkin
Given Người học đang dùng trình duyệt không hỗ trợ Web Speech API
When Người học mở trang Thẻ ghi nhớ
Then Nút Microphone không hiển thị (ẩn hoàn toàn)
And Trải nghiệm lật thẻ vẫn hoạt động bình thường
```

---

## 7. Giới Hạn Hiện Tại & Hướng Mở Rộng

### Giới hạn
- Web Speech API **chỉ hoạt động trên HTTPS** và trên Chrome/Edge. Firefox và Safari có hỗ trợ hạn chế.
- Độ chính xác nhận diện phụ thuộc vào chất lượng Microphone và tốc độ mạng (API gọi server-side của Google).
- Hiện chưa lưu lịch sử điểm phát âm vào database.

### Hướng mở rộng (v0.6.0+)
- **Lưu lịch sử phát âm**: Ghi lại số lần thử và điểm trung bình vào model `WordPronunciationLog`.
- **Chế độ luyện tập liên tục**: Sau khi nhận diện thành công, tự động chuyển sang thẻ tiếp theo.
- **Nhận diện đa từ**: Hỗ trợ nhận diện cả câu ví dụ (`example`) thay vì chỉ một từ.
- **Phân tích âm vị**: Dùng AI để phân tích từng âm tiết sai (phoneme-level feedback).
