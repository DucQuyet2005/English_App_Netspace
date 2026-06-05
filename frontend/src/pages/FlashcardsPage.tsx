import React, { useState, useMemo } from 'react';
import { useApp } from '../AppContext';
import { Word } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers,
  Sparkles,
  RotateCw,
  XCircle,
  CheckCircle,
  HelpCircle,
  RefreshCw,
  Tag
} from 'lucide-react';

export const FlashcardsPage: React.FC = () => {
  const { words, toggleWordLearned } = useApp();

  const [selectedTopic, setSelectedTopic] = useState('Tất cả');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Thu thập danh sách chủ đề thực tế từ vựng
  const availableTopics = useMemo(() => {
    const topics = new Set(words.map(w => w.topic));
    return ['Tất cả', ...Array.from(topics)];
  }, [words]);

  // Bộ thẻ được sắp xếp theo Spaced Repetition đơn giản:
  // - Ưu tiên các từ có box nhỏ hơn (ôn nhiều hơn)
  // - Lọc theo chủ đề đã chọn
  // - Nếu từ đã được đánh dấu là "learned" (đã thuộc), có thể hiển thị sau, nhưng để ôn tập ta lấy toàn bộ từ thuộc chủ đề được chọn.
  const deck = useMemo(() => {
    let filtered = words;
    if (selectedTopic !== 'Tất cả') {
      filtered = words.filter(w => w.topic === selectedTopic);
    }
    
    // Thuật toán Spaced Repetition: Sắp xếp theo box tăng dần (box 1 ôn đầu tiên), nếu box bằng nhau thì ưu tiên thời gian ôn tập cũ nhất
    return [...filtered].sort((a, b) => {
      if (a.box !== b.box) {
        return a.box - b.box;
      }
      return new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime();
    });
  }, [words, selectedTopic]);

  const activeCard = deck[currentIndex] || null;

  const handleNext = (remembered: boolean) => {
    if (!activeCard) return;

    // Cập nhật Spaced Repetition thông qua toggleWordLearned
    // Nếu người dùng nhấn "Đã nhớ", ta đánh dấu là đã thuộc (nếu chưa thuộc) để nâng Spaced box.
    // Nếu nhấn "Chưa nhớ", ta kiểm tra, nếu đang thuộc thì hạ xuống chưa thuộc (box về 1), nếu chưa thuộc thì giữ nguyên chưa thuộc để ôn tiếp.
    if (remembered !== activeCard.learned) {
      toggleWordLearned(activeCard.id);
    } else if (remembered && activeCard.learned) {
      // Nếu đã thuộc rồi và vẫn nhớ, ta kích hoạt mốc nâng box tiếp tục
      toggleWordLearned(activeCard.id); // Toggle hai lần để cập nhật date/box mượt mà
      toggleWordLearned(activeCard.id);
    }

    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex < deck.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // Quay lại thẻ đầu tiên nếu hết bộ deck
        setCurrentIndex(0);
      }
    }, 150);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const progressPct = deck.length > 0 ? Math.round(((currentIndex) / deck.length) * 100) : 0;

  return (
    <div className="space-y-8 max-w-3xl mx-auto flex flex-col items-center">
      {/* Selector & Progress Info */}
      <div className="w-full bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-850/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Tag className="w-4 h-4 text-indigo-500" /> Chọn chủ đề ôn tập
          </span>
          <select
            value={selectedTopic}
            onChange={(e) => {
              setSelectedTopic(e.target.value);
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
          >
            {availableTopics.map(topic => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>
        </div>

        {deck.length > 0 && (
          <div className="text-right sm:text-right">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Tiến trình học thẻ</span>
            <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
              {currentIndex + 1} / {deck.length} thẻ
            </p>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {deck.length > 0 && (
        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200/20">
          <div
            className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}

      {/* Flashcard Component */}
      {activeCard ? (
        <div className="w-full flex flex-col items-center gap-8">
          {/* Card perspective box */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full aspect-[4/3] max-w-xl cursor-pointer select-none relative group"
            style={{ perspective: '1000px' }}
          >
            <div
              className={`w-full h-full relative transition-transform duration-500 ease-in-out`}
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'none'
              }}
            >
              {/* FACE FRONT (Tiếng Anh) */}
              <div
                className="absolute inset-0 bg-white dark:bg-slate-950 rounded-3xl p-8 md:p-12 border border-slate-200/50 dark:border-slate-850/80 shadow-lg flex flex-col items-center justify-between text-center overflow-hidden"
                style={{ backfaceVisibility: 'hidden' }}
              >
                {/* Accent band */}
                <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600" />
                
                <span className="text-indigo-600 dark:text-indigo-400 text-xs font-extrabold uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/40 px-4 py-1.5 rounded-full">
                  Tiếng Anh
                </span>

                <div className="my-auto space-y-3.5">
                  <h2 className="text-4xl md:text-5xl font-serif-title text-indigo-900/90 dark:text-slate-100 italic tracking-tight">
                    {activeCard.word}
                  </h2>
                  <p className="text-base font-bold text-slate-450 dark:text-slate-500">
                    {activeCard.ipa}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs font-semibold animate-bounce">
                  <RotateCw className="w-4 h-4" />
                  <span>Chạm để lật thẻ xem nghĩa</span>
                </div>
              </div>

              {/* FACE BACK (Nghĩa & Ví dụ) */}
              <div
                className="absolute inset-0 bg-white dark:bg-slate-950 rounded-3xl p-8 md:p-12 border border-slate-200/50 dark:border-slate-850/80 shadow-lg flex flex-col items-center justify-between text-center"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                {/* Accent band */}
                <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />

                <span className="text-emerald-600 dark:text-emerald-400 text-xs font-extrabold uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/40 px-4 py-1.5 rounded-full">
                  Nghĩa Tiếng Việt
                </span>

                <div className="my-auto space-y-6 w-full">
                  <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100">
                    {activeCard.meaning}
                  </h3>
                  
                  <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850/80 p-5 rounded-2xl w-full">
                    <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Ví dụ minh họa</p>
                    <p className="text-sm font-bold text-slate-650 dark:text-slate-300 italic leading-relaxed">
                      "{activeCard.example}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-455 text-xs font-semibold">
                  <span className="text-amber-500 text-xs font-bold">Chủ đề: {activeCard.topic}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-6 w-full max-w-md">
            <button
              onClick={() => handleNext(false)}
              className="flex-1 flex flex-col items-center justify-center gap-2.5 p-5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40 rounded-2xl hover:shadow-lg hover:shadow-rose-500/10 active:scale-95 transition-all group cursor-pointer"
            >
              <XCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black uppercase tracking-wider">Chưa nhớ thẻ</span>
            </button>
            <button
              onClick={() => handleNext(true)}
              className="flex-1 flex flex-col items-center justify-center gap-2.5 p-5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl hover:shadow-lg hover:shadow-emerald-500/10 active:scale-95 transition-all group cursor-pointer"
            >
              <CheckCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black uppercase tracking-wider">Đã nhớ thẻ</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-950 p-12 text-center rounded-2xl border border-slate-200/40 dark:border-slate-850 shadow-sm w-full max-w-md">
          <Layers className="w-16 h-16 text-slate-350 dark:text-slate-650 mx-auto animate-pulse" />
          <h3 className="text-lg font-extrabold text-slate-850 dark:text-slate-200 mt-4">Không tìm thấy thẻ vựng!</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Vui lòng nhập thêm từ mới trong trang <strong>Từ vựng</strong> hoặc chọn chủ đề ôn tập khác để nạp thẻ.
          </p>
        </div>
      )}

      {/* Tips box */}
      {deck.length > 0 && (
        <div className="w-full max-w-md text-center">
          <button
            onClick={handleReset}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 flex items-center gap-1.5 mx-auto py-2 px-4 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Quay lại thẻ đầu tiên
          </button>
        </div>
      )}
    </div>
  );
};
