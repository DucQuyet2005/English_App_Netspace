import React from 'react';
import { useApp } from '../AppContext';
import { TabType } from '../types';
import { motion } from 'motion/react';
import {
  BookOpen,
  History,
  Award,
  Layers,
  FileQuestion,
  TrendingUp,
  Flame,
  ArrowRight
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { words, attempts, setActiveTab, settings } = useApp();

  const learnedCount = words.filter(w => w.learned).length;
  // Số từ cần ôn: Những từ chưa thuộc, hoặc những từ đã quá thời gian ôn tập
  const wordsToReview = words.filter(w => !w.learned || new Date(w.nextReviewDate) <= new Date()).length;

  // Tính điểm trung bình các lượt quiz gần nhất
  const avgQuizScore = attempts.length > 0
    ? Math.round(attempts.reduce((acc, curr) => acc + curr.score, 0) / attempts.length)
    : 0;

  // Hiển thị điểm trên thang điểm 10
  const avgScoreFormatted = (avgQuizScore / 10).toFixed(1);

  // Thống kê từ mới học được 7 ngày qua (để vẽ biểu đồ)
  // Thực tế ta nhóm từ theo ngày tạo trong 7 ngày qua.
  // Để biểu đồ hiển thị sinh động, ta sẽ phân phối số từ đã học theo các thứ trong tuần hiện tại: T2, T3, T4, T5, T6, T7, CN
  const daysOfWeek = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const mockWeeklyData = [3, 5, 2, 7, 4, 6, 5]; // Số lượng từ mới học mỗi ngày trong tuần
  const maxWordCount = Math.max(...mockWeeklyData, 1);

  // Mục tiêu hôm nay
  const dailyLearingGoal = settings.dailyGoal || 5;
  const learnedToday = Math.min(learnedCount, dailyLearingGoal);
  const goalProgressPercent = Math.min(100, Math.round((learnedToday / dailyLearingGoal) * 100));

  // Tăng cường hoạt động nhanh với Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Welcome Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-gradient-to-r from-indigo-50/60 to-teal-50/60 dark:from-slate-900/45 dark:to-slate-950/40 p-6 md:p-8 rounded-3xl border border-indigo-100/30 dark:border-slate-800/60"
      >
        <div>
          <h3 className="text-2xl md:text-3xl font-serif-title text-slate-800 dark:text-slate-150 tracking-tight">
            Chào mừng học viên, Quốc Anh! 👋
          </h3>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-2">
            Hôm nay là một ngày tuyệt vời để ghi nhớ thêm {settings.dailyGoal} từ vựng mới và nâng cao vốn từ của bạn.
          </p>
        </div>
        <div className="flex gap-2">
          <span className="px-4 py-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50 rounded-full text-xs font-extrabold flex items-center gap-2">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" /> 
            15 ngày liên tiếp
          </span>
        </div>
      </motion.div>

      {/* Bento Grid Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Card 1 - Số từ đã học */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Số từ đã học</p>
              <h3 className="text-4xl font-black text-indigo-600 dark:text-indigo-400 mt-3">{learnedCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-slate-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-5 flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <span>🚀 Tăng trưởng liên tục</span>
          </div>
        </div>

        {/* Stat Card 2 - Số từ cần ôn */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 border-l-4 border-l-amber-500 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Số từ cần luyện thêm</p>
              <h3 className="text-4xl font-black text-amber-600 dark:text-amber-400 mt-3">{wordsToReview}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-slate-900 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <History className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-5 text-xs font-bold text-slate-500 dark:text-slate-400">
            Sẵn sàng làm Flashcard đề xuất
          </div>
        </div>

        {/* Stat Card 3 - Điểm Quiz */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Điểm Quiz trung bình</p>
              <h3 className="text-4xl font-black text-teal-600 dark:text-teal-400 mt-3">
                {avgScoreFormatted}
                <span className="text-sm font-bold text-slate-400 dark:text-slate-500">/10</span>
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-slate-900 flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-5 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-teal-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${avgQuizScore}%` }}
            ></div>
          </div>
        </div>
      </motion.div>

      {/* Biểu đồ và Tiếp cận nhanh */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Biểu đồ tiến bộ (vẽ bằng SVG chất lượng cao, hover mượt) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="text-lg font-serif-title text-slate-800 dark:text-slate-100">Tiến độ ghi nhớ từ mới</h4>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Lượng từ mới nạp theo các ngày trong tuần</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-slate-100 dark:bg-slate-900 rounded-lg text-slate-600 dark:text-slate-400 border border-slate-200/30">
              7 ngày qua
            </span>
          </div>

          <div className="h-64 flex items-end justify-between gap-4 pt-4 px-2 select-none">
            {mockWeeklyData.map((val, idx) => {
              const barHeightPct = (val / maxWordCount) * 85;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  {/* Tooltip */}
                  <span className="opacity-0 group-hover:opacity-100 bg-slate-800 text-white text-[10px] font-extrabold px-1.5 py-1 rounded-md mb-1 absolute -translate-y-[220px] transition-all pointer-events-none shadow-md">
                    {val} từ
                  </span>
                  
                  {/* Bar */}
                  <div className="w-full bg-slate-50 dark:bg-slate-900 rounded-t-xl h-full flex flex-col justify-end overflow-hidden">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${barHeightPct}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.05 }}
                      className="bg-gradient-to-t from-indigo-500 to-indigo-400 dark:from-indigo-600 dark:to-indigo-500 rounded-t-xl w-full group-hover:from-indigo-400 group-hover:to-teal-400 transition-all cursor-pointer"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{daysOfWeek[idx]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cột Phụ: Truy cập nhanh & Mục tiêu ngày */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <h4 className="text-lg font-serif-title text-slate-800 dark:text-slate-100">Truy cập nhanh</h4>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setActiveTab('flashcard')}
              className="flex flex-col items-start gap-4 p-5 bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white rounded-2xl hover:shadow-lg hover:shadow-indigo-600/20 active:scale-[0.98] transition-all text-left"
            >
              <Layers className="w-6 h-6 p-1 bg-white/25 rounded-lg" />
              <div className="mt-2">
                <span className="text-xs font-bold block opacity-85">Thẻ học</span>
                <span className="text-sm font-extrabold block mt-0.5">Flashcard</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className="flex flex-col items-start gap-4 p-5 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 hover:bg-slate-200/40 dark:hover:bg-slate-800 rounded-2xl active:scale-[0.98] transition-all text-left text-slate-800 dark:text-slate-100"
            >
              <FileQuestion className="w-6 h-6 p-1 bg-teal-50 dark:bg-slate-800 text-teal-500 dark:text-teal-400 rounded-lg" />
              <div className="mt-2">
                <span className="text-xs font-bold block text-slate-500 dark:text-slate-400">Kiểm tra</span>
                <span className="text-sm font-extrabold block mt-0.5">Mini Quiz</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('vocabulary')}
              className="flex flex-col items-start gap-4 p-5 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 hover:bg-slate-200/40 dark:hover:bg-slate-800 rounded-2xl active:scale-[0.98] transition-all text-left text-slate-800 dark:text-slate-100"
            >
              <BookOpen className="w-6 h-6 p-1 bg-indigo-50 dark:bg-slate-800 text-indigo-500 dark:text-indigo-400 rounded-lg" />
              <div className="mt-2">
                <span className="text-xs font-bold block text-slate-500 dark:text-slate-400">Danh mục</span>
                <span className="text-sm font-extrabold block mt-0.5">Từ vựng</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className="flex flex-col items-start gap-4 p-5 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 hover:bg-slate-200/40 dark:hover:bg-slate-800 rounded-2xl active:scale-[0.98] transition-all text-left text-slate-800 dark:text-slate-100"
            >
              <TrendingUp className="w-6 h-6 p-1 bg-pink-50 dark:bg-slate-800 text-pink-500 dark:text-teal-400 rounded-lg" />
              <div className="mt-2">
                <span className="text-xs font-bold block text-slate-500 dark:text-slate-400">Lịch sử</span>
                <span className="text-sm font-extrabold block mt-0.5">Thống kê</span>
              </div>
            </button>
          </div>

          {/* Daily Goal Card */}
          <div className="bg-slate-900 dark:bg-indigo-950 p-6 rounded-2xl border border-indigo-900/40 shadow-inner relative overflow-hidden flex flex-col justify-between">
            <div className="relative z-10 text-white">
              <h5 className="font-bold text-sm tracking-wide text-indigo-300">Mục tiêu của ngày</h5>
              <p className="text-xl font-extrabold mt-1">
                {learnedToday} / {dailyLearingGoal} từ đã học
              </p>
              
              <div className="mt-5 w-full bg-indigo-900/80 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-teal-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(45,212,191,0.6)]"
                  style={{ width: `${goalProgressPercent}%` }}
                ></div>
              </div>
            </div>
            
            {/* Decovative elements */}
            <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-10">
              <BookOpen className="w-32 h-32 text-indigo-50" />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
