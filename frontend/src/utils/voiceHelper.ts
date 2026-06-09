/**
 * Voice Recognition Helper - LingoFlow Sprint 1 (US-002)
 * 
 * Hỗ trợ nhận diện giọng nói qua Web Speech API và chấm điểm phát âm
 * bằng thuật toán Levenshtein Distance, với ngưỡng chấp nhận 75%.
 */

// ─── Khai báo type mở rộng cho Web Speech API (chưa có trong TypeScript mặc định) ─────
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

// ─── Kết quả trả về của một lần nhận diện giọng nói ─────────────────────────────────
export interface VoiceRecognitionResult {
  /** Phiên bản chuẩn hóa của chuỗi người dùng đã nói */
  transcript: string;
  /** Tỷ lệ tương đồng so với từ mục tiêu (0.0 – 1.0) */
  similarity: number;
  /** Đã vượt ngưỡng 75% chấp nhận chưa */
  isPassed: boolean;
  /** Thông báo kết quả để hiển thị UI */
  message: string;
}

// ─── Ngưỡng tỷ lệ tương đồng tối thiểu để chấp nhận phát âm đúng ─────────────────
const PASS_THRESHOLD = 0.75;

/**
 * Chuẩn hóa chuỗi để so sánh: lowercase, xóa dấu câu, xóa khoảng trắng thừa.
 */
export const normalizeString = (str: string): string =>
  str.toLowerCase().replace(/[^a-z\s]/g, '').trim().replace(/\s+/g, ' ');

/**
 * Tính khoảng cách Levenshtein giữa hai chuỗi.
 * Trả về số lần chỉnh sửa (thêm, xóa, thay thế ký tự) tối thiểu để biến
 * chuỗi `a` thành chuỗi `b`.
 */
export const levenshteinDistance = (a: string, b: string): number => {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
};

/**
 * Tính tỷ lệ tương đồng (0.0 – 1.0) giữa chuỗi nhận diện và từ mục tiêu.
 * Công thức: 1 - (khoảng_cách / độ_dài_chuỗi_dài_hơn)
 */
export const calculateSimilarity = (recognized: string, target: string): number => {
  const a = normalizeString(recognized);
  const b = normalizeString(target);
  if (!a && !b) return 1.0;
  if (!a || !b) return 0.0;
  const maxLen = Math.max(a.length, b.length);
  const distance = levenshteinDistance(a, b);
  return Math.max(0, 1 - distance / maxLen);
};

/**
 * Kiểm tra xem trình duyệt có hỗ trợ Web Speech API không.
 */
export const isSpeechRecognitionSupported = (): boolean =>
  typeof window !== 'undefined' &&
  !!(window.SpeechRecognition || window.webkitSpeechRecognition);

/**
 * Bắt đầu ghi âm và nhận diện giọng nói, sau đó tự động chấm điểm phát âm.
 * 
 * @param targetWord  Từ tiếng Anh cần phát âm
 * @param onStart     Callback khi mic bắt đầu lắng nghe
 * @param onEnd       Callback khi kết thúc (dù thành công hay lỗi)
 * @returns Promise<VoiceRecognitionResult | null> — null nếu trình duyệt không hỗ trợ hoặc bị lỗi
 */
export const startVoiceRecognition = (
  targetWord: string,
  onStart?: () => void,
  onEnd?: () => void
): Promise<VoiceRecognitionResult | null> => {
  return new Promise((resolve) => {
    if (!isSpeechRecognitionSupported()) {
      resolve(null);
      return;
    }

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();

    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    recognition.continuous = false;

    recognition.onstart = () => {
      onStart?.();
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // Lấy kết quả nhận diện tốt nhất từ tất cả các alternatives
      let bestTranscript = '';
      let bestSimilarity = 0;

      for (let i = 0; i < event.results[0].length; i++) {
        const transcript = event.results[0][i].transcript;
        const similarity = calculateSimilarity(transcript, targetWord);
        if (similarity > bestSimilarity) {
          bestSimilarity = similarity;
          bestTranscript = transcript;
        }
      }

      const isPassed = bestSimilarity >= PASS_THRESHOLD;
      const pct = Math.round(bestSimilarity * 100);

      let message: string;
      if (bestSimilarity >= 0.95) {
        message = `Xuất sắc! Phát âm của bạn đạt ${pct}% - Hoàn toàn chuẩn xác! 🎉`;
      } else if (isPassed) {
        message = `Khá tốt! Phát âm của bạn đạt ${pct}% - Tiếp tục luyện tập! 👍`;
      } else {
        message = `Bạn vừa đọc: "${bestTranscript}". Độ khớp ${pct}% — Hãy thử lại! 🔄`;
      }

      resolve({ transcript: bestTranscript, similarity: bestSimilarity, isPassed, message });
      onEnd?.();
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.warn('Voice recognition error:', event.error);
      let message = 'Không nhận diện được giọng nói. Vui lòng thử lại.';
      if (event.error === 'not-allowed') {
        message = 'Quyền truy cập Microphone bị từ chối. Vui lòng cấp quyền trong cài đặt trình duyệt.';
      } else if (event.error === 'no-speech') {
        message = 'Không phát hiện giọng nói. Vui lòng đọc to và rõ hơn.';
      }
      resolve({ transcript: '', similarity: 0, isPassed: false, message });
      onEnd?.();
    };

    recognition.onend = () => {
      onEnd?.();
    };

    try {
      recognition.start();
    } catch (err) {
      console.error('Failed to start recognition:', err);
      resolve(null);
      onEnd?.();
    }
  });
};
