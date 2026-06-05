import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../AppContext';
import { Word } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileQuestion,
  Award,
  Timer as TimerIcon,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  LayoutDashboard,
  ShieldAlert
} from 'lucide-react';

interface Question {
  type: 'choice' | 'fill';
  word: Word;
  questionText: string;
  correctAnswer: string;
  options: string[]; // Chỉ dùng cho dạng 'choice'
  sentenceTemplate?: string; // Dùng cho dạng 'fill'
}

export const QuizPage: React.FC = () => {
  const { words, settings, addAttempt, setActiveTab } = useApp();

  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [fillValue, setFillValue] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  
  // Timer states
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Màn hình kết quả
  const [showResult, setShowResult] = useState(false);

  // Tạo câu hỏi thông minh khi nhấn Bắt đầu
  const handleStartQuiz = () => {
    if (words.length < 4) return;

    const quizSize = settings.defaultQuizSize || 10;
    // Chọn ngẫu nhiên ra tối đa quizSize từ vựng
    const shuffledWords = [...words].sort(() => 0.5 - Math.random());
    const selectedWords = shuffledWords.slice(0, Math.min(quizSize, words.length));

    const generatedQuestions: Question[] = selectedWords.map((currentWord) => {
      // Quyết định ngẫu nhiên loại câu hỏi (choice hoặc fill)
      // Điều kiện để làm câu điền từ: Ví dụ phải chứa từ gốc (không phân biệt hoa thường)
      const hasValidSentence = currentWord.example.toLowerCase().includes(currentWord.word.toLowerCase());
      const type = (hasValidSentence && Math.random() > 0.5) ? 'fill' : 'choice';

      if (type === 'fill') {
        // Thay thế từ vựng trong ví dụ bằng ______
        const regex = new RegExp(currentWord.word, 'gi');
        const sentenceTemplate = currentWord.example.replace(regex, '______');
        return {
          type: 'fill',
          word: currentWord,
          questionText: 'Điền từ tiếng Anh còn thiếu vào câu dưới đây:',
          correctAnswer: currentWord.word.toLowerCase(),
          options: [],
          sentenceTemplate
        };
      } else {
        // Multiple choice: chọn 3 nghĩa nhiễu từ các câu khác
        const otherWords = words.filter(w => w.id !== currentWord.id);
        const shuffledOthers = otherWords.sort(() => 0.5 - Math.random());
        const distractors = shuffledOthers.slice(0, 3).map(w => w.meaning);
        
        // Trộn đáp án đúng và đáp án nhiễu
        const options = [currentWord.meaning, ...distractors].sort(() => 0.5 - Math.random());

        return {
          type: 'choice',
          word: currentWord,
          questionText: 'Chọn nghĩa tiếng Việt đúng của từ sau:',
          correctAnswer: currentWord.meaning,
          options
        };
      }
    });

    setQuestions(generatedQuestions);
    setCurrentIndex(0);
    setSelectedOption(null);
    setFillValue('');
    setIsAnswered(false);
    setCorrectCount(0);
    setSeconds(0);
    setShowResult(false);
    setQuizStarted(true);

    // Kích hoạt Timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
  };

  // Hủy Timer khi unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (secs: number) => {
    const min = Math.floor(secs / 60);
    const rm = secs % 60;
    return `${min.toString().padStart(2, '0')}:${rm.toString().padStart(2, '0')}`;
  };

  const handleOptionClick = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    const activeQuestion = questions[currentIndex];
    if (option === activeQuestion.correctAnswer) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const handleFillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnswered || !fillValue.trim()) return;

    setIsAnswered(true);
    const activeQuestion = questions[currentIndex];
    if (fillValue.trim().toLowerCase() === activeQuestion.correctAnswer) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const currentQuestion = questions[currentIndex] || null;

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setFillValue('');
      setIsAnswered(false);
    } else {
      // Dừng timer
      if (timerRef.current) clearInterval(timerRef.current);
      setShowResult(true);
      
      // Tính chủ đề làm quiz đại diện
      // Ta đếm chủ đề của các câu hỏi, lấy chủ đề nhiều nhất hoặc gọi là 'Kiểm tra tổng hợp'
      const topicsUsed = questions.map(q => q.word.topic);
      const isSingleTopic = topicsUsed.every(t => t === topicsUsed[0]);
      const quizTopic = isSingleTopic ? topicsUsed[0] : 'Hỗn hợp';

      // Lưu kết quả vào storage
      addAttempt(correctCount, questions.length, seconds, quizTopic);
    }
  };

  // Tính thanh tiến trình làm bài
  const progressPercent = questions.length > 0
    ? Math.round(((currentIndex + 1) / questions.length) * 100)
    : 0;

  return (
    <div className="max-w-4xl mx-auto min-h-[70vh] flex flex-col justify-center">
      <AnimatePresence mode="wait">
        {/* CASE 1: Chưa bắt đầu Quiz */}
        {!quizStarted && !showResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-950 p-8 md:p-12 border border-slate-200/55 dark:border-slate-850 rounded-3xl shadow-lg text-center space-y-6 max-w-2xl mx-auto"
          >
            <div className="w-16 h-16 bg-indigo-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto border border-indigo-150/50">
              <FileQuestion className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">
                Mini Quiz Tiếng Anh
              </h3>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Hệ thống sẽ nạp ngẫu nhiên {settings.defaultQuizSize} câu hỏi trắc nghiệm nghĩa và điền từ vào ví dụ từ vốn từ của bạn để hỗ trợ ôn thuộc.
              </p>
            </div>

            {words.length < 4 ? (
              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/60 p-4 rounded-2xl flex items-center gap-3 text-left max-w-md mx-auto">
                <ShieldAlert className="w-6 h-6 text-rose-500 shrink-0" />
                <p className="text-xs font-bold text-rose-700 dark:text-rose-400 leading-normal">
                  Bạn cần có ít nhất 4 từ vựng trong từ điển để bắt đầu Mini Quiz (Hiện tại: {words.length} từ). Hãy vào trang <strong>Từ vựng</strong> để thêm trước!
                </p>
              </div>
            ) : (
              <div className="pt-4">
                <button
                  onClick={handleStartQuiz}
                  className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-base font-extrabold rounded-2xl shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
                >
                  Bắt đầu kiểm tra nhanh
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* CASE 2: Đang làm Quiz */}
        {quizStarted && !showResult && currentQuestion && (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {/* Header progress & Timer */}
            <div className="flex justify-between items-end bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-850/80 shadow-sm">
              <div>
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                  Trình độ: Trung cấp
                </span>
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mt-3">
                  Câu hỏi {currentIndex + 1} / {questions.length}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200/20">
                <TimerIcon className="w-4 h-4 text-slate-450 dark:text-slate-500" />
                <span className="text-sm font-extrabold font-mono">{formatTime(seconds)}</span>
              </div>
            </div>

            {/* Progress line */}
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200/20">
              <div
                className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* QUESTION BOX */}
            <div className="bg-white dark:bg-slate-950 rounded-3xl p-8 md:p-12 border border-slate-200/50 dark:border-slate-850/80 shadow-lg flex flex-col items-center">
              <div className="text-center w-full max-w-2xl mb-10">
                <p className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                  {currentQuestion.questionText}
                </p>

                {currentQuestion.type === 'choice' ? (
                  <div className="space-y-2.5">
                    <h2 className="text-4xl font-serif-title text-indigo-600 dark:text-indigo-300 italic tracking-tight">
                      {currentQuestion.word.word}
                    </h2>
                    <p className="text-sm font-bold text-slate-400 dark:text-slate-500 italic">
                      {currentQuestion.word.ipa}
                    </p>
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 rounded-2xl w-full mb-6">
                    <p className="text-xl font-bold text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                      "{currentQuestion.sentenceTemplate}"
                    </p>
                  </div>
                )}
              </div>

              {/* ANSWER OPTIONS */}
              <div className="w-full max-w-2xl">
                {currentQuestion.type === 'choice' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQuestion.options.map((option, oIdx) => {
                      const isSelected = selectedOption === option;
                      const isCorrect = option === currentQuestion.correctAnswer;
                      
                      let btnStyle = 'bg-slate-50 dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-850 hover:border-slate-300';
                      if (isAnswered) {
                        if (isCorrect) {
                          btnStyle = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-extrabold';
                        } else if (isSelected) {
                          btnStyle = 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-700 dark:text-rose-450';
                        } else {
                          btnStyle = 'bg-slate-50/40 dark:bg-slate-900/40 border-slate-200/20 text-slate-400 dark:text-slate-600 pointer-events-none';
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={isAnswered}
                          onClick={() => handleOptionClick(option)}
                          className={`flex items-center justify-between p-5 border-2 rounded-2xl text-left text-sm font-semibold active:scale-[0.98] transition-all cursor-pointer ${btnStyle}`}
                        >
                          <span>{option}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  /* Form điền từ */
                  <form onSubmit={handleFillSubmit} className="flex flex-col gap-4 max-w-md mx-auto w-full">
                    <input
                      disabled={isAnswered}
                      type="text"
                      placeholder="Gõ chính xác từ tiếng Anh còn thiếu..."
                      value={fillValue}
                      onChange={(e) => setFillValue(e.target.value)}
                      className={`w-full p-4 rounded-xl border-2 text-center text-lg font-bold transition-all focus:outline-none focus:ring-0 ${
                        isAnswered
                          ? fillValue.trim().toLowerCase() === currentQuestion.correctAnswer
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-700 dark:text-emerald-400'
                            : 'bg-rose-50 dark:bg-rose-950/30 border-rose-500 text-rose-700 dark:text-rose-400'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:border-indigo-500'
                      }`}
                    />
                    
                    {!isAnswered && (
                      <button
                        type="submit"
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-extrabold shadow-md active:scale-95 transition-all cursor-pointer"
                      >
                        Kiểm tra đáp án
                      </button>
                    )}
                  </form>
                )}

                {/* FEEDBACK BOTTOM (Chỉ hiện khi đã chọn/gõ đáp án xong) */}
                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-8 p-5 rounded-2xl flex items-center gap-4 border ${
                      // Đánh giá đúng sai
                      (currentQuestion.type === 'choice' && selectedOption === currentQuestion.correctAnswer) ||
                      (currentQuestion.type === 'fill' && fillValue.trim().toLowerCase() === currentQuestion.correctAnswer)
                        ? 'bg-emerald-50/60 dark:bg-slate-900/60 border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400'
                        : 'bg-rose-50/60 dark:bg-slate-900/60 border-rose-100 dark:border-rose-900/30 text-rose-800 dark:text-rose-400'
                    }`}
                  >
                    {((currentQuestion.type === 'choice' && selectedOption === currentQuestion.correctAnswer) ||
                      (currentQuestion.type === 'fill' && fillValue.trim().toLowerCase() === currentQuestion.correctAnswer)) ? (
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="w-8 h-8 text-rose-500 shrink-0" />
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-extrabold">
                        {((currentQuestion.type === 'choice' && selectedOption === currentQuestion.correctAnswer) ||
                          (currentQuestion.type === 'fill' && fillValue.trim().toLowerCase() === currentQuestion.correctAnswer))
                            ? 'Chúc mừng! Bạn đã trả lời đúng.'
                            : `Opps! Sai mất rồi.`}
                      </p>
                      <p className="text-xs opacity-85 mt-0.5">
                        Từ vựng: <strong className="underline">{currentQuestion.word.word}</strong> mang ý nghĩa "{currentQuestion.word.meaning}".
                      </p>
                    </div>

                    <button
                      onClick={handleNextQuestion}
                      className="ml-auto flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black px-5 py-2.5 rounded-xl shadow-md transition-colors cursor-pointer"
                    >
                      <span>Tiếp tục</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* CASE 3: Mini Quiz đã xong - Hiện Màn kết quả (Result Screen) */}
        {showResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6 space-y-8 max-w-2xl mx-auto"
          >
            <div className="relative inline-block">
              {/* Blur accent glow */}
              <div className="absolute inset-x-0 bottom-0 top-1/2 bg-teal-500/20 dark:bg-indigo-500/10 blur-[60px] rounded-full" />
              <div className="relative z-10 w-44 h-44 rounded-full bg-slate-50 dark:bg-slate-900 border-8 border-indigo-50 dark:border-slate-800/80 shadow-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto">
                <Award className="w-20 h-20 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                Chúc mừng bạn đã hoàn thành!
              </h2>
              <p className="text-sm font-semibold text-slate-550 dark:text-slate-400 max-w-md mx-auto">
                Bạn đã nỗ lực làm bài Mini Quiz tuyệt vời. Hãy duy trì thói quen rèn luyện hàng ngày.
              </p>
            </div>

            {/* Stats list */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm">
                <Award className="w-7 h-7 text-indigo-600 dark:text-indigo-400 mx-auto mb-2" />
                <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tổng điểm đạt</p>
                <p className="text-2xl font-black text-slate-850 dark:text-slate-100 mt-1">
                  {Math.round((correctCount / questions.length) * 100)}/100
                </p>
              </div>

              <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm">
                <TimerIcon className="w-7 h-7 text-teal-600 dark:text-teal-400 mx-auto mb-2" />
                <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Thời gian làm</p>
                <p className="text-2xl font-black text-slate-850 dark:text-slate-100 mt-1">
                  {formatTime(seconds)}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm">
                <TrendingUp className="w-7 h-7 text-pink-600 dark:text-pink-400 mx-auto mb-2" />
                <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Đáp án đúng</p>
                <p className="text-2xl font-black text-slate-850 dark:text-slate-100 mt-1">
                  {correctCount} / {questions.length} câu
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button
                onClick={handleStartQuiz}
                className="flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Làm lại quiz mới
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 rounded-2xl font-bold text-sm active:scale-95 transition-all cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4" />
                Quay lại Dashboard
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
