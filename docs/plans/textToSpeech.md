# Thiết Kế Tính Năng Phát Âm Từ Vựng (Dynamic Dictionary API & Fallback TTS)

Tài liệu này đặc tả chi tiết thiết kế và giải pháp triển khai tính năng phát âm từ vựng tiếng Anh trên giao diện LingoFlow. Tính năng sử dụng cơ chế kết hợp giữa file âm thanh ghi âm thực tế từ API từ điển và bộ đọc giọng nhân tạo chuyển văn bản thành giọng nói (Text-To-Speech) làm dự phòng.

---

## 1. Luồng Hoạt Động (Data Flow & Logic)

Khi người dùng nhấn vào nút phát âm (icon chiếc loa) bên cạnh từ vựng:

1. **Hiển thị trạng thái tải (Loading)**: Đổi icon chiếc loa thành biểu tượng xoay tròn (`Loader2`) của từ vựng tương ứng và vô hiệu hóa nút bấm tạm thời để tránh click spam.
2. **Gửi yêu cầu API**: Gửi yêu cầu HTTP GET đến địa chỉ API từ điển công khai:
   `https://api.dictionaryapi.dev/api/v2/entries/en/<word>`
3. **Phân tích kết quả**:
   * **Trường hợp thành công & có file ghi âm**:
     * Duyệt qua mảng `phonetics` để tìm kiếm phần tử đầu tiên có trường `audio` không rỗng và kết thúc bằng đuôi `.mp3` (chọn giọng US hoặc UK tùy thuộc vào độ khả dụng).
     * Khởi tạo đối tượng âm thanh: `const audio = new Audio(audioUrl)`.
     * Gọi hàm phát âm thanh: `audio.play()`.
   * **Trường hợp thất bại hoặc không có file ghi âm**:
     * Khi API trả về lỗi 404 (không tìm thấy từ), gặp lỗi kết nối mạng (offline), hoặc mảng `phonetics` không chứa liên kết audio nào hợp lệ.
     * Tự động kích hoạt cơ chế dự phòng **Web Speech API** tích hợp sẵn trong trình duyệt (Text-to-Speech):
       ```typescript
       const utterance = new SpeechSynthesisUtterance(word);
       utterance.lang = 'en-US'; // Thiết lập giọng đọc Anh-Mỹ
       window.speechSynthesis.speak(utterance);
       ```
4. **Tắt trạng thái tải**: Chuyển trạng thái loading của từ vựng về `false` và khôi phục lại icon chiếc loa ban đầu.

---

## 2. Thiết Kế Giao Diện (UI/UX Design)

Nút loa phát âm sẽ được bổ sung tại hai màn hình học tập chính:

### 2.1 Trang Quản Lý Từ Vựng (`Vocabulary.tsx`)
* **Vị trí**: Nút tròn nhỏ nằm ngay cạnh chữ tiếng Anh chính trong mỗi thẻ từ vựng (Vocabulary Card).
* **Hiệu ứng**:
  * Chế độ bình thường: Trạng thái mờ nhẹ (Glassmorphism), hiển thị icon `Volume2` từ thư viện `lucide-react`. Khi di chuột vào (hover) sẽ tăng độ sáng và nâng nhẹ chiều sâu.
  * Chế độ tải: Thay thế bằng icon `Loader2` xoay tròn mịn.
  * Tích hợp tooltip "Nghe phát âm".

### 2.2 Trang Thẻ Học (`FlashcardsPage.tsx`)
* **Vị trí**: Nút phát âm kích thước lớn hơn, đặt ngay dưới phần từ vựng tiếng Anh chính ở mặt trước (Face Front) của thẻ.
* **Mục đích**: Giúp người học luyện nghe và phát âm chuẩn trước khi quyết định lật thẻ kiểm tra nghĩa tiếng Việt ở mặt sau.

---

## 3. Cấu Trúc Mã Nguồn & Thay Đổi Chi Tiết

Toàn bộ logic xử lý sẽ được triển khai ở phía **Frontend** mà không cần thay đổi Database Schema hay API Backend:

### 3.1 Tạo tệp tiện ích phát âm (`frontend/src/utils/audioHelper.ts`)
Tách biệt phần logic phát âm thành một hàm tiện ích chung để dễ dàng tái sử dụng và bảo trì:
```typescript
/**
 * Tự động tìm và phát âm thanh từ vựng.
 * Ưu tiên gọi Free Dictionary API, nếu thất bại sẽ chạy Fallback sang Web Speech API.
 * 
 * @param word Từ tiếng Anh cần phát âm
 * @returns Promise<boolean> Trả về true nếu phát thành công bằng API, false nếu phải dùng fallback
 */
export const playPronunciation = async (word: string): Promise<boolean> => {
  const trimmedWord = word.trim();
  if (!trimmedWord) return false;

  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(trimmedWord.toLowerCase())}`);
    if (!response.ok) throw new Error('Không tìm thấy từ vựng trên API');

    const data = await response.json();
    // Tìm file audio hợp lệ đầu tiên trong danh sách phonetics
    const phonetics = data[0]?.phonetics || [];
    const audioEntry = phonetics.find((p: any) => p.audio && p.audio.endsWith('.mp3'));

    if (audioEntry && audioEntry.audio) {
      const audio = new Audio(audioEntry.audio);
      await audio.play();
      return true;
    }
    
    throw new Error('API không chứa file audio');
  } catch (error) {
    // Cơ chế Fallback sang Web Speech API
    console.warn(`Đang chuyển sang bộ đọc Text-to-Speech dự phòng cho từ "${trimmedWord}":`, error);
    try {
      window.speechSynthesis.cancel(); // Hủy các câu nói cũ đang chờ đọc
      const utterance = new SpeechSynthesisUtterance(trimmedWord);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
      return false;
    } catch (ttsError) {
      console.error('Không thể kích hoạt cả bộ đọc dự phòng:', ttsError);
      return false;
    }
  }
};
```

### 3.2 Cập nhật trong `Vocabulary.tsx`
* Bổ sung state cục bộ để quản lý trạng thái tải âm thanh theo từng từ vựng:
  ```typescript
  const [loadingAudioId, setLoadingAudioId] = useState<string | null>(null);
  ```
* Viết hàm xử lý click:
  ```typescript
  const handlePlayAudio = async (word: string, id: string) => {
    setLoadingAudioId(id);
    await playPronunciation(word);
    setLoadingAudioId(null);
  };
  ```
* Chèn nút bấm loa vào giao diện hiển thị từ vựng (bên cạnh `item.word`).

### 3.3 Cập nhật trong `FlashcardsPage.tsx`
* Thêm nút loa tương tự cạnh hoặc dưới tiêu đề từ vựng ở mặt trước thẻ flashcard, sử dụng state loading cục bộ của trang để kiểm soát trạng thái xoay tròn của icon.
