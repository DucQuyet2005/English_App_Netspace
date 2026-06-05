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
            className="bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl p-10 md:p-14 border border-white/60 dark:border-slate-800/60 rounded-[2.5rem] shadow-xl dark:shadow-none text-center space-y-8 max-w-2xl mx-auto relative overflow-hidden"
          >
            {/* Background glowing effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-400/10 blur-[80px] rounded-bl-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 dark:bg-teal-400/10 blur-[80px] rounded-tr-full pointer-events-none"></div>

            <div className="w-20 h-20 bg-indigo-50/80 dark:bg-slate-900/80 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto border border-indigo-100/50 dark:border-indigo-500/20 shadow-inner relative z-10">
              <FileQuestion className="w-10 h-10" />
            </div>

            <div className="space-y-4 relative z-10">
              <h3 className="text-3xl font-serif-title text-slate-800 dark:text-slate-100 tracking-tight">
                Mini Quiz Tiếng Anh
              </h3>
              <p className="text-base font-medium text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Hệ thống sẽ nạp ngẫu nhiên {settings.defaultQuizSize} câu hỏi trắc nghiệm nghĩa và điền từ vào ví dụ từ vốn từ của bạn để hỗ trợ ôn thuộc.
              </p>
            </div>

            {words.length < 4 ? (
              <div className="bg-rose-50/80 dark:bg-rose-950/40 backdrop-blur-sm border border-rose-200/50 dark:border-rose-900/60 p-5 rounded-2xl flex items-start gap-4 text-left max-w-md mx-auto relative z-10">
                <ShieldAlert className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-rose-700 dark:text-rose-400 leading-relaxed">
                  Bạn cần có ít nhất 4 từ vựng trong từ điển để bắt đầu Mini Quiz (Hiện tại: {words.length} từ). Hãy vào trang <strong className="font-bold underline decoration-rose-300">Từ vựng</strong> để thêm trước!
                </p>
              </div>
            ) : (
              <div className="pt-4 relative z-10">
                <button
                  onClick={handleStartQuiz}
                  className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:to-indigo-400 active:scale-95 text-white text-base font-bold rounded-2xl shadow-[0_10px_20px_-10px_rgba(79,70,229,0.5)] transition-all cursor-pointer border border-indigo-400/20"
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
            <div className="flex justify-between items-end bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white/60 dark:border-slate-800/60 shadow-sm transition-shadow">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-500/10 px-4 py-2 rounded-xl uppercase tracking-widest border border-indigo-100/50 dark:border-indigo-500/20">
                  Trình độ: Trung cấp
                </span>
                <h3 className="text-xl font-serif-title text-slate-800 dark:text-slate-100 mt-4">
                  Câu hỏi <span className="text-indigo-600 dark:text-indigo-400">{currentIndex + 1}</span> / {questions.length}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-900/50 px-5 py-3 rounded-xl border border-slate-200/40 dark:border-slate-800/50 shadow-inner">
                <TimerIcon className="w-5 h-5 text-indigo-500" />
                <span className="text-lg font-bold font-mono tracking-wider">{formatTime(seconds)}</span>
              </div>
            </div>

            {/* Progress line */}
            <div className="w-full h-2.5 bg-slate-100/80 dark:bg-slate-900/80 rounded-full overflow-hidden border border-slate-200/20 shadow-inner backdrop-blur-sm">
              <div
                className="bg-gradient-to-r from-indigo-500 to-teal-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* QUESTION BOX */}
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2.5rem] p-10 md:p-14 border border-white/60 dark:border-slate-800/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-indigo-900/10 flex flex-col items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-teal-400 to-indigo-500"></div>
              
              <div className="text-center w-full max-w-2xl mb-12 relative z-10">
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">
                  {currentQuestion.questionText}
                </p>

                {currentQuestion.type === 'choice' ? (
                  <div className="space-y-4">
                    <h2 className="text-5xl md:text-6xl font-serif-title text-indigo-600 dark:text-indigo-400 italic tracking-tight">
                      {currentQuestion.word.word}
                    </h2>
                    <p className="text-lg font-medium text-slate-400 dark:text-slate-500 font-serif italic">
                      {currentQuestion.word.ipa}
                    </p>
                  </div>
                ) : (
                  <div className="bg-slate-50/80 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80 p-8 rounded-[2rem] w-full mb-6 relative overflow-hidden backdrop-blur-sm shadow-inner">
                    <div className="absolute top-0 left-0 w-1 h-full bg-teal-400/50 dark:bg-teal-500/30"></div>
                    <p className="text-2xl font-medium text-slate-800 dark:text-slate-200 leading-relaxed font-serif italic">
                      "{currentQuestion.sentenceTemplate}"
                    </p>
                  </div>
                )}
              </div>

              {/* ANSWER OPTIONS */}
              <div className="w-full max-w-2xl relative z-10">
                {currentQuestion.type === 'choice' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {currentQuestion.options.map((option, oIdx) => {
                      const isSelected = selectedOption === option;
                      const isCorrect = option === currentQuestion.correctAnswer;
                      
                      let btnStyle = 'bg-white/80 dark:bg-slate-950/80 border-slate-200/60 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-50 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-0.5';
                      if (isAnswered) {
                        if (isCorrect) {
                          btnStyle = 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-400 text-emerald-700 dark:text-emerald-400 font-bold shadow-lg shadow-emerald-500/10';
                        } else if (isSelected) {
                          btnStyle = 'bg-rose-50 dark:bg-rose-900/30 border-rose-400 text-rose-700 dark:text-rose-400 shadow-sm';
                        } else {
                          btnStyle = 'bg-slate-50/40 dark:bg-slate-900/40 border-slate-200/20 text-slate-400 dark:text-slate-600 pointer-events-none opacity-50';
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={isAnswered}
                          onClick={() => handleOptionClick(option)}
                          className={`flex items-center justify-between p-6 border-2 rounded-[1.5rem] text-left text-base font-medium active:scale-[0.98] transition-all duration-300 cursor-pointer ${btnStyle}`}
                        >
                          <span>{option}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  /* Form điền từ */
                  <form onSubmit={handleFillSubmit} className="flex flex-col gap-5 max-w-md mx-auto w-full">
                    <input
                      disabled={isAnswered}
                      type="text"
                      placeholder="Gõ chính xác từ tiếng Anh còn thiếu..."
                      value={fillValue}
                      onChange={(e) => setFillValue(e.target.value)}
                      className={`w-full p-5 rounded-[1.5rem] border-2 text-center text-xl font-medium transition-all focus:outline-none focus:ring-0 shadow-sm ${
                        isAnswered
                          ? fillValue.trim().toLowerCase() === currentQuestion.correctAnswer
                            ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-400 text-emerald-700 dark:text-emerald-400'
                            : 'bg-rose-50 dark:bg-rose-900/30 border-rose-400 text-rose-700 dark:text-rose-400'
                          : 'bg-white/80 dark:bg-slate-950/80 border-slate-200/60 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:border-indigo-500 focus:shadow-lg focus:shadow-indigo-500/10'
                      }`}
                    />
                    
                    {!isAnswered && (
                      <button
                        type="submit"
                        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:to-indigo-400 text-white rounded-[1.5rem] text-[15px] font-bold shadow-[0_10px_20px_-10px_rgba(79,70,229,0.5)] active:scale-[0.98] transition-all cursor-pointer border border-indigo-400/20"
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
                    className={`mt-8 p-6 rounded-[1.5rem] flex flex-col sm:flex-row items-start sm:items-center gap-5 border backdrop-blur-md shadow-lg ${
                      // Đánh giá đúng sai
                      (currentQuestion.type === 'choice' && selectedOption === currentQuestion.correctAnswer) ||
                      (currentQuestion.type === 'fill' && fillValue.trim().toLowerCase() === currentQuestion.correctAnswer)
                        ? 'bg-emerald-50/80 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300'
                        : 'bg-rose-50/80 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/50 text-rose-800 dark:text-rose-300'
                    }`}
                  >
                    {((currentQuestion.type === 'choice' && selectedOption === currentQuestion.correctAnswer) ||
                      (currentQuestion.type === 'fill' && fillValue.trim().toLowerCase() === currentQuestion.correctAnswer)) ? (
                      <div className="bg-emerald-100/50 dark:bg-emerald-500/20 p-3 rounded-xl shrink-0">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
                      </div>
                    ) : (
                      <div className="bg-rose-100/50 dark:bg-rose-500/20 p-3 rounded-xl shrink-0">
                        <XCircle className="w-8 h-8 text-rose-500 dark:text-rose-400" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-serif-title tracking-tight">
                        {((currentQuestion.type === 'choice' && selectedOption === currentQuestion.correctAnswer) ||
                          (currentQuestion.type === 'fill' && fillValue.trim().toLowerCase() === currentQuestion.correctAnswer))
                            ? 'Chính xác! Làm tốt lắm.'
                            : `Rất tiếc, câu trả lời chưa đúng.`}
                      </p>
                      <p className="text-sm opacity-90 mt-1 font-medium">
                        Từ vựng: <strong className="underline decoration-current underline-offset-2 font-bold">{currentQuestion.word.word}</strong> mang ý nghĩa "{currentQuestion.word.meaning}".
                      </p>
                    </div>

                    <button
                      onClick={handleNextQuestion}
                      className="mt-4 sm:mt-0 ml-auto w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-sm font-bold px-6 py-3 rounded-xl shadow-md active:scale-95 transition-all cursor-pointer"
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
            className="text-center py-6 space-y-10 max-w-3xl mx-auto"
          >
            <div className="relative inline-block mt-8">
              {/* Blur accent glow */}
              <div className="absolute inset-x-0 bottom-0 top-1/4 bg-teal-500/30 dark:bg-indigo-500/20 blur-[80px] rounded-full" />
              <div className="relative z-10 w-48 h-48 rounded-[3rem] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 shadow-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto rotate-3">
                <Award className="w-24 h-24 drop-shadow-md animate-pulse" />
              </div>
            </div>

            <div className="space-y-3 relative z-10">
              <h2 className="text-4xl md:text-5xl font-serif-title text-slate-800 dark:text-slate-100 tracking-tight">
                Hoàn thành <span className="text-indigo-600 dark:text-indigo-400 italic">xuất sắc!</span>
              </h2>
              <p className="text-base font-medium text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Bạn đã hoàn thành bài Mini Quiz. Thường xuyên ôn luyện sẽ giúp bạn ghi nhớ từ vựng lâu hơn.
              </p>
            </div>

            {/* Stats list */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
              <div className="bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl p-8 rounded-[2rem] border border-white/60 dark:border-slate-800/60 shadow-sm hover:shadow-md transition-shadow hover:-translate-y-1">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100/50 dark:border-indigo-500/20">
                  <Award className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Điểm số</p>
                <p className="text-3xl font-serif-title text-slate-800 dark:text-slate-100 mt-2">
                  {Math.round((correctCount / questions.length) * 100)}<span className="text-lg text-slate-400">/100</span>
                </p>
              </div>

              <div className="bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl p-8 rounded-[2rem] border border-white/60 dark:border-slate-800/60 shadow-sm hover:shadow-md transition-shadow hover:-translate-y-1">
                <div className="w-12 h-12 bg-teal-50 dark:bg-teal-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-teal-100/50 dark:border-teal-500/20">
                  <TimerIcon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Thời gian</p>
                <p className="text-3xl font-serif-title text-slate-800 dark:text-slate-100 mt-2">
                  {formatTime(seconds)}
                </p>
              </div>

              <div className="bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl p-8 rounded-[2rem] border border-white/60 dark:border-slate-800/60 shadow-sm hover:shadow-md transition-shadow hover:-translate-y-1">
                <div className="w-12 h-12 bg-pink-50 dark:bg-pink-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-pink-100/50 dark:border-pink-500/20">
                  <TrendingUp className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                </div>
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Độ chính xác</p>
                <p className="text-3xl font-serif-title text-slate-800 dark:text-slate-100 mt-2">
                  {correctCount} <span className="text-lg text-slate-400">/ {questions.length}</span>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-5 justify-center pt-6 relative z-10">
              <button
                onClick={handleStartQuiz}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:to-indigo-400 text-white rounded-2xl font-bold text-sm shadow-[0_10px_20px_-10px_rgba(79,70,229,0.5)] active:scale-95 transition-all cursor-pointer border border-indigo-400/20"
              >
                <RefreshCw className="w-4 h-4" />
                Làm lại quiz mới
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800/60 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-sm shadow-sm active:scale-95 transition-all cursor-pointer"
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
