/**
 * Tự động tìm và phát âm thanh từ vựng.
 * Ưu tiên gọi Free Dictionary API, nếu thất bại sẽ chạy Fallback sang Web Speech API.
 */
export const playPronunciation = async (word: string): Promise<boolean> => {
    const trimmedWord = word.trim();
    if (!trimmedWord) return false;

    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(trimmedWord.toLowerCase())}`);
        if (!response.ok) throw new Error('Không tìm thấy từ vựng trên API');

        const data = await response.json();
        // Tìm file audio hợp lệ đầu tiên
        const phonetics = data[0]?.phonetics || [];
        const audioEntry = phonetics.find((p: any) => p.audio && p.audio.endsWith('.mp3'));

        if (audioEntry && audioEntry.audio) {
            const audio = new Audio(audioEntry.audio);
            await audio.play();
            return true;
        }

        throw new Error('API không chứa file audio');
    } catch (error) {
        console.warn(`Chuyển sang bộ đọc Text-to-Speech dự phòng cho từ "${trimmedWord}":`, error);
        try {
            window.speechSynthesis.cancel(); // Hủy các câu nói cũ đang chờ đọc
            const utterance = new SpeechSynthesisUtterance(trimmedWord);
            utterance.lang = 'en-US';
            window.speechSynthesis.speak(utterance);
            return false;
        } catch (ttsError) {
            console.error('Không thể kích hoạt bộ đọc dự phòng:', ttsError);
            return false;
        }
    }
};
