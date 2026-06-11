import React, { useState, useMemo, useEffect } from "react";
import { useApp } from "../AppContext";
import { Word } from "../types";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "motion/react";
import {
  Layers,
  Sparkles,
  RotateCw,
  XCircle,
  CheckCircle,
  RefreshCw,
  Tag,
  Volume2,
  Loader2,
  Mic,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { playPronunciation } from "../utils/audioHelper";
import {
  startVoiceRecognition,
  isSpeechRecognitionSupported,
  VoiceRecognitionResult,
} from "../utils/voiceHelper";

export const FlashcardsPage: React.FC = () => {
  const { words, setWordLearned } = useApp();

  const [selectedTopic, setSelectedTopic] = useState("Tất cả");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionDeck, setSessionDeck] = useState<Word[]>([]);
  const [actionHistory, setActionHistory] = useState<
    {
      cardId: string;
      previousIndex: number;
      previousLearned: boolean;
      previousBox: number;
      previousNextReviewDate: string;
      previousFlipped: boolean;
      remembered: boolean;
    }[]
  >([]);

  // Audio state
  const [loadingAudio, setLoadingAudio] = useState(false);

  // Voice recognition state
  const [isListening, setIsListening] = useState(false);
  const [voiceResult, setVoiceResult] = useState<VoiceRecognitionResult | null>(
    null,
  );
  const [showVoiceResult, setShowVoiceResult] = useState(false);

  // Spaced repetition & Session states
  const [dueOnly, setDueOnly] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    total: 0,
    remembered: 0,
    forgotten: 0,
  });
  const [sessionWrongIds, setSessionWrongIds] = useState<string[]>([]);
  const [isRestudyMode, setIsRestudyMode] = useState(false);
  const [restudyDeck, setRestudyDeck] = useState<Word[]>([]);

  // Motion values for swipe gesture
  const dragX = useMotionValue(0);
  const dragRotate = useTransform(dragX, [-200, 200], [-15, 15]);
  const dragOpacity = useTransform(
    dragX,
    [-200, -150, 0, 150, 200],
    [0.5, 0.8, 1, 0.8, 0.5],
  );
  const leftIndicatorOpacity = useTransform(dragX, [-120, -30], [1, 0]);
  const rightIndicatorOpacity = useTransform(dragX, [30, 120], [0, 1]);

  const handlePlayAudio = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!activeCard || loadingAudio) return;
    setLoadingAudio(true);
    await playPronunciation(activeCard.word);
    setLoadingAudio(false);
  };

  const handleVoiceCheck = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!activeCard || isListening) return;

    setVoiceResult(null);
    setShowVoiceResult(false);

    const result = await startVoiceRecognition(
      activeCard.word,
      () => setIsListening(true),
      () => setIsListening(false),
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
    const topics = new Set(words.map((w) => w.topic));
    return ["Tất cả", ...Array.from(topics)];
  }, [words]);

  // Bộ thẻ được sắp xếp theo Spaced Repetition đơn giản:
  const currentDeck = useMemo(() => {
    if (isRestudyMode) {
      return restudyDeck;
    }

    let filtered = words;
    if (selectedTopic !== "Tất cả") {
      filtered = words.filter((w) => w.topic === selectedTopic);
    }

    if (dueOnly) {
      const now = new Date().getTime();
      filtered = filtered.filter(
        (w) => new Date(w.nextReviewDate).getTime() <= now,
      );
    }

    return [...filtered].sort((a, b) => {
      if (a.box !== b.box) {
        return a.box - b.box;
      }
      return (
        new Date(a.nextReviewDate).getTime() -
        new Date(b.nextReviewDate).getTime()
      );
    });
  }, [words, selectedTopic, dueOnly, isRestudyMode, restudyDeck]);

  const activeCard = sessionDeck[currentIndex] || null;

  // Compute the session deck once when filters or restudy mode change.
  useEffect(() => {
    const deck = currentDeck;
    setSessionDeck(deck);
    setSessionStats({
      total: deck.length,
      remembered: 0,
      forgotten: 0,
    });
    setSessionWrongIds([]);
    setActionHistory([]);
    setShowSummary(false);
    setCurrentIndex(0);
    setIsFlipped(false);
    dragX.set(0);
  }, [selectedTopic, dueOnly, isRestudyMode, restudyDeck]);

  // Keep session deck entries fresh when word data changes.
  useEffect(() => {
    setSessionDeck((prev) =>
      prev.map((card) => {
        const fresh = words.find((w) => w.id === card.id);
        return fresh || card;
      }),
    );
  }, [words]);

  const handleNext = async (remembered: boolean) => {
    if (!activeCard) return;

    // Cập nhật thống kê phiên học
    setSessionStats((prev) => ({
      ...prev,
      remembered: prev.remembered + (remembered ? 1 : 0),
      forgotten: prev.forgotten + (remembered ? 0 : 1),
    }));

    if (!remembered) {
      setSessionWrongIds((prev) => {
        if (!prev.includes(activeCard.id)) {
          return [...prev, activeCard.id];
        }
        return prev;
      });
    }

    // Gọi API set trực tiếp
    await setWordLearned(activeCard.id, remembered);

    setIsFlipped(false);
    setVoiceResult(null);
    setShowVoiceResult(false);
    dragX.set(0); // Reset vị trí kéo thẻ

    setActionHistory((prev) => [
      ...prev,
      {
        cardId: activeCard.id,
        previousIndex: currentIndex,
        previousLearned: activeCard.learned,
        previousBox: activeCard.box,
        previousNextReviewDate: activeCard.nextReviewDate,
        previousFlipped: isFlipped,
        remembered,
      },
    ]);

    if (currentIndex < sessionDeck.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handleDragEnd = async (event: any, info: any) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset < -120 || velocity < -500) {
      await handleNext(false); // Chưa nhớ (vuốt trái)
    } else if (offset > 120 || velocity > 500) {
      await handleNext(true); // Đã nhớ (vuốt phải)
    } else {
      dragX.set(0); // Trở lại vị trí cũ nếu kéo chưa đủ lực
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setVoiceResult(null);
    setShowVoiceResult(false);
    setSessionStats({
      total: sessionDeck.length,
      remembered: 0,
      forgotten: 0,
    });
    setSessionWrongIds([]);
    setActionHistory([]);
    setIsRestudyMode(false);
    setShowSummary(false);
    dragX.set(0);
  };

  const handleUndo = async () => {
    const lastAction = actionHistory[actionHistory.length - 1];
    if (!lastAction) return;

    const {
      cardId,
      previousIndex,
      previousLearned,
      previousBox,
      previousNextReviewDate,
      previousFlipped,
      remembered,
    } = lastAction;

    await setWordLearned(cardId, previousLearned);

    setSessionDeck((prev) =>
      prev.map((card) =>
        card.id === cardId
          ? {
              ...card,
              learned: previousLearned,
              box: previousBox,
              nextReviewDate: previousNextReviewDate,
            }
          : card,
      ),
    );

    setCurrentIndex(previousIndex);
    setIsFlipped(previousFlipped);
    setSessionStats((prev) => ({
      ...prev,
      remembered: Math.max(0, prev.remembered - (remembered ? 1 : 0)),
      forgotten: Math.max(0, prev.forgotten - (remembered ? 0 : 1)),
    }));

    if (!remembered) {
      setSessionWrongIds((prev) => prev.filter((id) => id !== cardId));
    }

    setActionHistory((prev) => prev.slice(0, -1));
    setShowSummary(false);
    setVoiceResult(null);
    setShowVoiceResult(false);
    dragX.set(0);
  };

  const progressPct =
    sessionDeck.length > 0
      ? Math.round((currentIndex / sessionDeck.length) * 100)
      : 0;
  const voiceSupported = isSpeechRecognitionSupported();

  // Đăng ký phím tắt bàn phím
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bỏ qua nếu người dùng đang gõ trong các ô nhập liệu
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "SELECT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (!activeCard || showSummary) return;

      switch (e.key) {
        case " ": // Phím cách - Lật thẻ
          e.preventDefault();
          setIsFlipped((prev) => !prev);
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          handleNext(false);
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          handleNext(true);
          break;
        case "ArrowUp":
        case "w":
        case "W":
        case "r":
        case "R":
          e.preventDefault();
          handlePlayAudio();
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          if (voiceSupported && !isListening) {
            handleVoiceCheck();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeCard, isListening, voiceSupported, showSummary, sessionDeck]);

  // Phân bổ Leitner Boxes
  const boxDistribution = useMemo(() => {
    const dist = [0, 0, 0, 0, 0];
    words.forEach((w) => {
      if (w.box >= 1 && w.box <= 5) {
        dist[w.box - 1]++;
      }
    });
    return dist;
  }, [words]);

  const totalWordsCount = words.length;

  return (
    <div className="space-y-8 max-w-3xl mx-auto flex flex-col items-center">
      {/* Selector & Progress Info */}
      <div className="w-full bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white/60 dark:border-slate-800/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full md:w-auto">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100/50 dark:border-indigo-500/20 shadow-inner">
              <Tag className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                Chủ đề ôn tập
              </span>
              <select
                value={selectedTopic}
                onChange={(e) => {
                  setSelectedTopic(e.target.value);
                }}
                disabled={isRestudyMode}
                className="bg-transparent border-none p-0 text-lg font-serif-title text-slate-800 dark:text-slate-200 focus:ring-0 cursor-pointer w-full max-w-[200px] disabled:opacity-50"
              >
                {availableTopics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!isRestudyMode && (
            <div className="flex items-center gap-3 bg-slate-50/50 dark:bg-slate-900/30 px-4 py-2.5 rounded-2xl border border-slate-100/50 dark:border-slate-800/30">
              <input
                type="checkbox"
                id="dueOnlyToggle"
                checked={dueOnly}
                onChange={(e) => setDueOnly(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-350 dark:border-slate-700 bg-transparent"
              />
              <label
                htmlFor="dueOnlyToggle"
                className="text-xs font-bold text-slate-500 dark:text-slate-400 cursor-pointer select-none"
              >
                Chỉ từ đến hạn ôn tập (Spaced Repetition)
              </label>
            </div>
          )}
        </div>

        {sessionDeck.length > 0 && !showSummary && (
          <div className="text-left md:text-right flex flex-col items-start md:items-end bg-white/50 dark:bg-slate-900/50 px-5 py-3 rounded-2xl border border-slate-100 dark:border-slate-800/50">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {isRestudyMode ? "Học lại từ khó" : "Tiến trình"}
            </span>
            <p className="text-xl font-serif-title text-indigo-600 dark:text-indigo-400 mt-1">
              {currentIndex + 1}{" "}
              <span className="text-sm font-sans font-medium text-slate-400">
                / {sessionDeck.length}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {sessionDeck.length > 0 && !showSummary && (
        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200/20">
          <div
            className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}

      {/* Main Study Area / Session Summary */}
      {showSummary ? (
        <div className="w-full max-w-xl mx-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 border border-white/60 dark:border-slate-800/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] text-center flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20 text-indigo-500 mb-2">
            <Sparkles className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-serif-title text-slate-800 dark:text-slate-100">
              {isRestudyMode
                ? "Hoàn thành ôn từ khó!"
                : "Hoàn thành phiên học!"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Chúc mừng bạn đã ôn luyện xong nhóm từ vựng này.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 w-full bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/50 p-6 rounded-2xl">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Đã ôn
              </span>
              <span className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">
                {sessionStats.total}
              </span>
            </div>
            <div className="flex flex-col items-center border-x border-slate-200/50 dark:border-slate-800/50">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Đã nhớ
              </span>
              <span className="text-2xl font-bold text-teal-600 dark:text-teal-400 mt-1">
                {sessionStats.remembered}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Độ chính xác
              </span>
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                {sessionStats.total > 0
                  ? Math.round(
                      (sessionStats.remembered / sessionStats.total) * 100,
                    )
                  : 0}
                %
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full mt-2">
            {sessionWrongIds.length > 0 && (
              <button
                onClick={() => {
                  const wrongWords = words.filter((w) =>
                    sessionWrongIds.includes(w.id),
                  );
                  setRestudyDeck(wrongWords);
                  setIsRestudyMode(true);
                  setSessionStats({
                    total: wrongWords.length,
                    remembered: 0,
                    forgotten: 0,
                  });
                  setSessionWrongIds([]);
                  setCurrentIndex(0);
                  setIsFlipped(false);
                  setShowSummary(false);
                }}
                className="flex-1 py-4 px-6 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-500/20 hover:shadow-rose-600/30 transition-all duration-200 cursor-pointer"
              >
                Ôn lại {sessionWrongIds.length} từ chưa nhớ
              </button>
            )}
            <button
              onClick={() => {
                setSessionStats({
                  total: sessionDeck.length,
                  remembered: 0,
                  forgotten: 0,
                });
                setSessionWrongIds([]);
                setIsRestudyMode(false);
                setCurrentIndex(0);
                setIsFlipped(false);
                setShowSummary(false);
              }}
              className="flex-1 py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-700/30 transition-all duration-200 cursor-pointer"
            >
              Học lại từ đầu
            </button>
          </div>
        </div>
      ) : activeCard ? (
        <div className="w-full flex flex-col items-center gap-8">
          {/* Card drag wrapper */}
          <div className="w-full flex items-center justify-center relative px-4">
            {/* Swipe hints */}
            <motion.div
              style={{ opacity: leftIndicatorOpacity }}
              className="absolute left-10 top-1/2 -translate-y-1/2 z-20 pointer-events-none px-6 py-3 border-4 border-rose-500 text-rose-500 text-xl font-bold rounded-2xl uppercase tracking-widest bg-white/90 dark:bg-slate-900/90 shadow-lg"
            >
              Chưa nhớ
            </motion.div>
            <motion.div
              style={{ opacity: rightIndicatorOpacity }}
              className="absolute right-10 top-1/2 -translate-y-1/2 z-20 pointer-events-none px-6 py-3 border-4 border-teal-500 text-teal-500 text-xl font-bold rounded-2xl uppercase tracking-widest bg-white/90 dark:bg-slate-900/90 shadow-lg"
            >
              Đã nhớ ✓
            </motion.div>

            <motion.div
              key={activeCard.id}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.65}
              onDragEnd={handleDragEnd}
              style={{
                x: dragX,
                rotate: dragRotate,
                opacity: dragOpacity,
                cursor: "grab",
              }}
              whileDrag={{ cursor: "grabbing" }}
              onClick={() => {
                if (Math.abs(dragX.get()) < 5) {
                  setIsFlipped(!isFlipped);
                }
              }}
              className="w-full aspect-[4/3] max-w-xl select-none card-perspective"
            >
              <div
                className="w-full h-full relative card-inner"
                style={{
                  transform: isFlipped ? "rotateY(180deg)" : "none",
                }}
              >
                {/* FACE FRONT (Tiếng Anh) */}
                <div
                  className={`absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[2.5rem] p-10 md:p-14 border border-white/60 dark:border-slate-800/80 card-face flex flex-col items-center justify-between text-center overflow-hidden card-glow-${activeCard.box || 1}`}
                >
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-teal-450 to-indigo-500"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-400/5 blur-2xl rounded-bl-full pointer-events-none"></div>

                  <div className="flex items-center gap-2">
                    <span className="text-indigo-650 dark:text-indigo-400 text-[11px] font-bold uppercase tracking-widest bg-indigo-50/80 dark:bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-100/50 dark:border-indigo-500/20">
                      Từ vựng tiếng Anh
                    </span>
                    {activeCard.box === 5 && (
                      <span className="text-amber-600 dark:text-amber-400 text-[11px] font-bold uppercase tracking-widest bg-amber-50/80 dark:bg-amber-500/10 px-4 py-2 rounded-xl border border-amber-100/50 dark:border-amber-500/20 flex items-center gap-1">
                        🏆 Hộp 5
                      </span>
                    )}
                  </div>

                  <div className="my-auto space-y-4 relative z-10 w-full">
                    {/* Từ vựng + Nút loa phát âm */}
                    <div className="flex items-center justify-center gap-4">
                      <h2 className="text-5xl md:text-6xl font-serif-title text-slate-800 dark:text-slate-100 tracking-tight">
                        {activeCard.word}
                      </h2>
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

                    {/* VOICE RECOGNITION BUTTON */}
                    {voiceSupported && (
                      <div className="flex flex-col items-center gap-3 pt-2">
                        <button
                          onClick={handleVoiceCheck}
                          disabled={isListening}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-sm
                            ${
                              isListening
                                ? "bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-700/50 animate-pulse cursor-not-allowed"
                                : "bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 border border-violet-200/60 dark:border-violet-700/40 hover:bg-violet-100 dark:hover:bg-violet-800/40 hover:shadow-md"
                            }`}
                          title={
                            isListening
                              ? "Đang nghe..."
                              : "Kiểm tra phát âm của bạn"
                          }
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
                                ${
                                  voiceResult.isPassed
                                    ? "bg-emerald-50/90 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-700/40"
                                    : "bg-rose-50/90 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-700/40"
                                }`}
                            >
                              <div className="flex items-center justify-center gap-2 mb-1">
                                {voiceResult.isPassed ? (
                                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                ) : (
                                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                )}
                                <span>{voiceResult.message}</span>
                              </div>
                              <div className="mt-2 h-1.5 w-full bg-white/40 dark:bg-black/20 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${voiceResult.isPassed ? "bg-emerald-500" : "bg-rose-500"}`}
                                  style={{
                                    width: `${Math.round(voiceResult.similarity * 100)}%`,
                                  }}
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
                    <span>Chạm hoặc kéo vuốt để xem nghĩa</span>
                  </div>
                </div>

                {/* FACE BACK (Nghĩa & Ví dụ) */}
                <div
                  className={`absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[2.5rem] p-10 md:p-14 border border-white/60 dark:border-slate-800/80 card-face flex flex-col items-center justify-between text-center overflow-hidden card-glow-${activeCard.box || 1}`}
                  style={{
                    transform: "rotateY(180deg)",
                  }}
                >
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
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                        Ví dụ minh họa
                      </p>
                      <p className="text-base font-serif italic text-slate-600 dark:text-slate-300 leading-relaxed">
                        <span className="text-2xl leading-none text-amber-200 dark:text-amber-900/40 mr-1">
                          "
                        </span>
                        {activeCard.example}
                        <span className="text-2xl leading-none text-amber-200 dark:text-amber-900/40 ml-1">
                          "
                        </span>
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
            </motion.div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-6 w-full max-w-md flex-col sm:flex-row">
            <div className="flex-1 flex flex-col sm:flex-row gap-6">
              <button
                onClick={() => handleNext(false)}
                className="flex-1 flex flex-col items-center justify-center gap-3 p-5 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl text-rose-600 dark:text-rose-400 border border-rose-100/60 dark:border-rose-900/40 rounded-[2rem] hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-200 dark:hover:border-rose-800/50 hover:shadow-xl hover:shadow-rose-500/10 hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 group cursor-pointer"
              >
                <div className="p-3 bg-rose-50 dark:bg-rose-500/10 rounded-2xl group-hover:bg-rose-100 dark:group-hover:bg-rose-500/20 transition-colors">
                  <XCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest">
                  Chưa nhớ (A)
                </span>
              </button>
              <button
                onClick={() => handleNext(true)}
                className="flex-1 flex flex-col items-center justify-center gap-3 p-5 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl text-teal-600 dark:text-teal-400 border border-teal-100/60 dark:border-teal-900/40 rounded-[2rem] hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:border-teal-200 dark:hover:border-teal-800/50 hover:shadow-xl hover:shadow-teal-500/10 hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 group cursor-pointer"
              >
                <div className="p-3 bg-teal-50 dark:bg-teal-500/10 rounded-2xl group-hover:bg-teal-100 dark:group-hover:bg-teal-500/20 transition-colors">
                  <CheckCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest">
                  Đã nhớ (D)
                </span>
              </button>
            </div>
            <button
              onClick={handleUndo}
              disabled={actionHistory.length === 0}
              className="flex-1 flex items-center justify-center gap-3 p-5 bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-[2rem] hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCw className="w-6 h-6" />
              <span className="text-[11px] font-bold uppercase tracking-widest">
                Quay lại thẻ trước
              </span>
            </button>
          </div>

          {/* Leitner Box / Next review Info */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-slate-400 dark:text-slate-500">
            <span className="bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-800">
              Hộp Leitner: {activeCard.box || 1} / 5
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Ôn tiếp:{" "}
              {new Date(activeCard.nextReviewDate).toLocaleDateString("vi-VN")}
            </span>
            <span>·</span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-900 px-2.5 py-1.5 rounded-md">
              [Space] Lật · [W] Phát âm · [S] Nói
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-950 p-12 text-center rounded-[2.5rem] border border-slate-200/40 dark:border-slate-850 shadow-sm w-full max-w-md">
          <Layers className="w-16 h-16 text-slate-350 dark:text-slate-650 mx-auto animate-pulse" />
          <h3 className="text-xl font-bold text-slate-850 dark:text-slate-200 mt-4">
            {dueOnly
              ? "Không có từ nào cần ôn tập!"
              : "Không tìm thấy thẻ vựng!"}
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 leading-relaxed">
            {dueOnly
              ? 'Tất cả từ vựng trong chủ đề này đều đã được ôn tập đầy đủ. Hãy tắt bộ lọc "Chỉ từ đến hạn" để ôn lại toàn bộ.'
              : "Vui lòng nhập thêm từ mới trong trang Từ vựng hoặc chọn chủ đề ôn tập khác để nạp thẻ."}
          </p>
          {dueOnly && (
            <button
              onClick={() => setDueOnly(false)}
              className="mt-6 px-5 py-2.5 bg-indigo-650 hover:bg-indigo-750 text-white font-bold text-xs uppercase tracking-widest rounded-2xl transition-all shadow-md shadow-indigo-500/10 cursor-pointer"
            >
              Tắt bộ lọc đến hạn
            </button>
          )}
        </div>
      )}

      {/* Leitner Box Distribution Chart */}
      {totalWordsCount > 0 && (
        <div className="w-full bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white/60 dark:border-slate-800/60 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Phân bổ hộp ghi nhớ (Leitner)
            </span>
            <span className="text-xs font-medium text-slate-450 dark:text-slate-500">
              Tổng cộng: {totalWordsCount} từ
            </span>
          </div>
          <div className="grid grid-cols-5 gap-2 pt-2">
            {boxDistribution.map((count, index) => {
              const pct =
                totalWordsCount > 0 ? (count / totalWordsCount) * 100 : 0;
              const boxColors = [
                "bg-rose-500", // Box 1
                "bg-amber-500", // Box 2
                "bg-teal-500", // Box 3
                "bg-indigo-500", // Box 4
                "bg-violet-500", // Box 5
              ];
              return (
                <div key={index} className="flex flex-col items-center gap-1.5">
                  <div className="w-full h-12 bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden flex items-end">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`w-full ${boxColors[index]}`}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    Hộp {index + 1}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reset button */}
      {sessionDeck.length > 0 && (
        <div className="w-full max-w-md text-center">
          <button
            onClick={handleReset}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 flex items-center gap-1.5 mx-auto py-2 px-4 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Bắt đầu lại từ thẻ đầu tiên
          </button>
        </div>
      )}
    </div>
  );
};
