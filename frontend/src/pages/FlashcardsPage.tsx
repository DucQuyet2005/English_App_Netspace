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
  Tag,
  Volume2,
  Loader2,
  Mic,
  MicOff,
} from 'lucide-react';
import { playPronunciation } from "../utils/audioHelper";
import {
  startVoiceRecognition,
  isSpeechRecognitionSupported,
  VoiceRecognitionResult,
} from "../utils/voiceHelper";

export const FlashcardsPage: React.FC = () => {
  const { words, setWordLearned } = useApp();

  const [selectedTopic, setSelectedTopic] = useState('Tất cả');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Audio state
  const [loadingAudio, setLoadingAudio] = useState(false);

  // Voice recognition state
  const [isListening, setIsListening] = useState(false);
  const [voiceResult, setVoiceResult] = useState<VoiceRecognitionResult | null>(null);
  const [showVoiceResult, setShowVoiceResult] = useState(false);

  const handlePlayAudio = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeCard || loadingAudio) return;
    setLoadingAudio(true);
    await playPronunciation(activeCard.word);
    setLoadingAudio(false);
  };

  const handleVoiceCheck = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeCard || isListening) return;

    setVoiceResult(null);
    setShowVoiceResult(false);

    const result = await startVoiceRecognition(
      activeCard.word,
      () => setIsListening(true),
      () => setIsListening(false)
    );

    if (result) {
      setVoiceResult(result);
      setShowVoiceResult(true);
      // Tự động ẩn kết quả sau 4 giây
      setTimeout(() => setShowVoiceResult(false), 4000);
    }
  };

  // Thu thập danh sách chủ đề thực tế từ vựng
  const availableTopics = useMemo(() => {
    const topics = new Set(words.map(w => w.topic));
    return ['Tất cả', ...Array.from(topics)];
  }, [words]);

  // Bộ thẻ được sắp xếp theo Spaced Repetition đơn giản:
  const deck = useMemo(() => {
    let filtered = words;
    if (selectedTopic !== 'Tất cả') {
      filtered = words.filter(w => w.topic === selectedTopic);
    }

    return [...filtered].sort((a, b) => {
      if (a.box !== b.box) {
        return a.box - b.box;
      }
      return new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime();
    });
  }, [words, selectedTopic]);

  const activeCard = deck[currentIndex] || null;

  /**
   * [BUG FIX] Sử dụng setWordLearned thay vì toggleWordLearned để tránh race condition.
   * - "Đã nhớ" (remembered=true)  → set learned=true, nâng hộp Leitner.
   * - "Chưa nhớ" (remembered=false) → set learned=false, reset về Hộp 1.
   */
  const handleNext = async (remembered: boolean) => {
    if (!activeCard) return;

    // Gọi API set trực tiếp thay vì toggle
    await setWordLearned(activeCard.id, remembered);

    setIsFlipped(false);
    setVoiceResult(null);
    setShowVoiceResult(false);

    setTimeout(() => {
      if (currentIndex < deck.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setCurrentIndex(0);
      }
    }, 150);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setVoiceResult(null);
    setShowVoiceResult(false);
  };

  const progressPct = deck.length > 0 ? Math.round(((currentIndex) / deck.length) * 100) : 0;
  const voiceSupported = isSpeechRecognitionSupported();

  return (
    <div className="space-y-8 max-w-3xl mx-auto flex flex-col items-center">
      {/* Selector & Progress Info */}
      <div className="w-full bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white/60 dark:border-slate-800/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100/50 dark:border-indigo-500/20 shadow-inner">
            <Tag className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Chủ đề ôn tập</span>
            <select
              value={selectedTopic}
              onChange={(e) => {
                setSelectedTopic(e.target.value);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className="bg-transparent border-none p-0 text-lg font-serif-title text-slate-800 dark:text-slate-200 focus:ring-0 cursor-pointer w-full max-w-[200px]"
            >
              {availableTopics.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </div>
        </div>

        {deck.length > 0 && (
          <div className="text-left sm:text-right flex flex-col items-start sm:items-end bg-white/50 dark:bg-slate-900/50 px-5 py-3 rounded-2xl border border-slate-100 dark:border-slate-800/50">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tiến trình</span>
            <p className="text-xl font-serif-title text-indigo-600 dark:text-indigo-400 mt-1">
              {currentIndex + 1} <span className="text-sm font-sans font-medium text-slate-400">/ {deck.length}</span>
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
                className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[2.5rem] p-10 md:p-14 border border-white/60 dark:border-slate-800/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-indigo-900/10 flex flex-col items-center justify-between text-center overflow-hidden"
                style={{ backfaceVisibility: 'hidden' }}
              >
                {/* Decorative gradients */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-teal-400 to-indigo-500"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-400/5 blur-2xl rounded-bl-full pointer-events-none"></div>

                <span className="text-indigo-600 dark:text-indigo-400 text-[11px] font-bold uppercase tracking-widest bg-indigo-50/80 dark:bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-100/50 dark:border-indigo-500/20">
                  Từ vựng tiếng Anh
                </span>

                <div className="my-auto space-y-4 relative z-10 w-full">
                  {/* Từ vựng + Nút loa phát âm */}
                  <div className="flex items-center justify-center gap-4">
                    <h2 className="text-5xl md:text-6xl font-serif-title text-slate-800 dark:text-slate-100 tracking-tight">
                      {activeCard.word}
                    </h2>
                    {/* Nút phát âm */}
                    <button
                      onClick={handlePlayAudio}
                      disabled={loadingAudio}
                      className="p-3 rounded-full bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer shadow-sm hover:shadow-md disabled:opacity-50"
                      title="Nghe phát âm"
                    >
                      {loadingAudio ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <Volume2 className="w-6 h-6" />
                      )}
                    </button>
                  </div>
                  <p className="text-lg font-medium text-slate-500 dark:text-slate-400 font-serif italic">
                    {activeCard.ipa}
                  </p>

                  {/* === VOICE RECOGNITION BUTTON (US-002) === */}
                  {voiceSupported && (
                    <div className="flex flex-col items-center gap-3 pt-2">
                      <button
                        onClick={handleVoiceCheck}
                        disabled={isListening}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-sm
                          ${isListening
                            ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-700/50 animate-pulse cursor-not-allowed'
                            : 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 border border-violet-200/60 dark:border-violet-700/40 hover:bg-violet-100 dark:hover:bg-violet-800/40 hover:shadow-md'
                          }`}
                        title={isListening ? 'Đang nghe...' : 'Kiểm tra phát âm của bạn'}
                      >
                        {isListening ? (
                          <>
                            <Mic className="w-4 h-4 animate-pulse" />
                            <span>Đang nghe...</span>
                          </>
                        ) : (
                          <>
                            <Mic className="w-4 h-4" />
                            <span>Kiểm tra phát âm</span>
                          </>
                        )}
                      </button>

                      {/* Kết quả nhận diện giọng nói */}
                      <AnimatePresence>
                        {showVoiceResult && voiceResult && (
                          <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.95 }}
                            transition={{ duration: 0.25 }}
                            className={`w-full max-w-sm px-4 py-3 rounded-2xl text-xs font-semibold text-center border backdrop-blur-sm
                              ${voiceResult.isPassed
                                ? 'bg-emerald-50/90 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-700/40'
                                : 'bg-rose-50/90 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-700/40'
                              }`}
                          >
                            <div className="flex items-center justify-center gap-2 mb-1">
                              {voiceResult.isPassed ? (
                                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                              ) : (
                                <XCircle className="w-4 h-4 flex-shrink-0" />
                              )}
                              <span>{voiceResult.message}</span>
                            </div>
                            {/* Thanh tiến trình độ khớp */}
                            <div className="mt-2 h-1.5 w-full bg-white/40 dark:bg-black/20 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${voiceResult.isPassed ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                style={{ width: `${Math.round(voiceResult.similarity * 100)}%` }}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs font-bold bg-slate-50/50 dark:bg-slate-950/50 px-4 py-2 rounded-xl backdrop-blur-sm relative z-10 animate-bounce">
                  <RotateCw className="w-4 h-4" />
                  <span>Chạm để lật xem nghĩa</span>
                </div>
              </div>

              {/* FACE BACK (Nghĩa & Ví dụ) */}
              <div
                className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[2.5rem] p-10 md:p-14 border border-white/60 dark:border-slate-800/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-indigo-900/10 flex flex-col items-center justify-between text-center overflow-hidden"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                {/* Decorative gradients */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-400 to-emerald-500"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-500/5 dark:bg-teal-400/5 blur-2xl rounded-tr-full pointer-events-none"></div>

                <span className="text-teal-600 dark:text-teal-400 text-[11px] font-bold uppercase tracking-widest bg-teal-50/80 dark:bg-teal-500/10 px-4 py-2 rounded-xl border border-teal-100/50 dark:border-teal-500/20">
                  Nghĩa Tiếng Việt
                </span>

                <div className="my-auto space-y-6 w-full relative z-10">
                  <h3 className="text-4xl font-serif-title text-slate-800 dark:text-slate-100">
                    {activeCard.meaning}
                  </h3>

                  <div className="bg-slate-50/80 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80 p-6 rounded-2xl w-full relative overflow-hidden backdrop-blur-sm">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-400/50 dark:bg-amber-500/30"></div>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Ví dụ minh họa</p>
                    <p className="text-base font-serif italic text-slate-600 dark:text-slate-300 leading-relaxed">
                      <span className="text-2xl leading-none text-amber-200 dark:text-amber-900/40 mr-1">"</span>
                      {activeCard.example}
                      <span className="text-2xl leading-none text-amber-200 dark:text-amber-900/40 ml-1">"</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold relative z-10">
                  <span className="bg-amber-50/80 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100/50 dark:border-amber-500/20 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                    Chủ đề: {activeCard.topic}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons — Đã nhớ / Chưa nhớ */}
          <div className="flex gap-6 w-full max-w-md">
            <button
              onClick={() => handleNext(false)}
              className="flex-1 flex flex-col items-center justify-center gap-3 p-5 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl text-rose-600 dark:text-rose-400 border border-rose-100/60 dark:border-rose-900/40 rounded-[2rem] hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-200 dark:hover:border-rose-800/50 hover:shadow-xl hover:shadow-rose-500/10 hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 group cursor-pointer"
            >
              <div className="p-3 bg-rose-50 dark:bg-rose-500/10 rounded-2xl group-hover:bg-rose-100 dark:group-hover:bg-rose-500/20 transition-colors">
                <XCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest">Chưa nhớ</span>
            </button>
            <button
              onClick={() => handleNext(true)}
              className="flex-1 flex flex-col items-center justify-center gap-3 p-5 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl text-teal-600 dark:text-teal-400 border border-teal-100/60 dark:border-teal-900/40 rounded-[2rem] hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:border-teal-200 dark:hover:border-teal-800/50 hover:shadow-xl hover:shadow-teal-500/10 hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 group cursor-pointer"
            >
              <div className="p-3 bg-teal-50 dark:bg-teal-500/10 rounded-2xl group-hover:bg-teal-100 dark:group-hover:bg-teal-500/20 transition-colors">
                <CheckCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest">Đã nhớ ✓</span>
            </button>
          </div>

          {/* Thông tin hộp Leitner của thẻ hiện tại */}
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-400 dark:text-slate-500">
            <span className="bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-800">
              Hộp {activeCard.box} / 5
            </span>
            <span>·</span>
            <span>
              Ôn tiếp: {new Date(activeCard.nextReviewDate).toLocaleDateString('vi-VN')}
            </span>
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

      {/* Reset button */}
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
