import React from 'react';
import { useApp } from '../AppContext';
import { TabType } from '../types';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
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
  const { words, attempts, setActiveTab, settings, currentUser } = useApp();
  const { language, t } = useLanguage();

  const learnedCount = words.filter(w => w.learned).length;
  const wordsToReview = words.filter(w => !w.learned || new Date(w.nextReviewDate) <= new Date()).length;

  const avgQuizScore = attempts.length > 0
    ? Math.round(attempts.reduce((acc, curr) => acc + curr.score, 0) / attempts.length)
    : 0;

  const avgScoreFormatted = (avgQuizScore / 10).toFixed(1);

  // Dịch các Thứ trong biểu đồ
  const daysOfWeek = language === 'vi' 
    ? ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] 
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const mockWeeklyData = [3, 5, 2, 7, 4, 6, 5]; 
  const maxWordCount = Math.max(...mockWeeklyData, 1);

  const dailyLearingGoal = settings.dailyGoal || 5;
  const learnedToday = Math.min(learnedCount, dailyLearingGoal);
  const goalProgressPercent = Math.min(100, Math.round((learnedToday / dailyLearingGoal) * 100));

  const userName = currentUser?.displayName || (language === 'vi' ? 'học viên' : 'student');

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
        className="relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-8 md:p-10 rounded-[2rem] border border-white/60 dark:border-slate-800/60 shadow-lg shadow-indigo-900/5"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-400/10 dark:bg-indigo-500/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-48 h-48 bg-teal-400/10 dark:bg-teal-500/10 blur-3xl rounded-full pointer-events-none"></div>
        
        <div className="relative z-10">
          <h3 className="text-3xl md:text-4xl font-serif-title text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
            {t('dashboard.welcome')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-teal-600 dark:from-indigo-400 dark:to-teal-400">{userName}</span> 👋
          </h3>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-3 max-w-lg leading-relaxed">
            {t('dashboard.descPart1')}{settings.dailyGoal || 5}{t('dashboard.descPart2')}
          </p>
        </div>
        <div className="relative z-10 flex gap-2">
          <span className="px-5 py-2.5 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm">
            <Flame className="w-5 h-5 fill-amber-500 text-amber-500 animate-pulse" /> 
            15 {t('dashboard.streakInfo')}
          </span>
        </div>
      </motion.div>

      {/* Bento Grid Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Card 1 */}
        <div className="relative overflow-hidden bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-7 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 dark:bg-indigo-400/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('dashboard.learnedWords')}</p>
              <h3 className="text-5xl font-serif-title text-slate-800 dark:text-slate-100 mt-2">{learnedCount}</h3>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-indigo-50/80 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-500/20 shadow-inner">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
          <div className="relative z-10 mt-6 flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/10 w-fit px-3 py-1.5 rounded-lg">
            <span>🚀 {t('dashboard.growth')}</span>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="relative overflow-hidden bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-7 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 dark:bg-amber-400/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('dashboard.reviewNeed')}</p>
              <h3 className="text-5xl font-serif-title text-slate-800 dark:text-slate-100 mt-2">{wordsToReview}</h3>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-amber-50/80 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-100/50 dark:border-amber-500/20 shadow-inner">
              <History className="w-6 h-6" />
            </div>
          </div>
          <div className="relative z-10 mt-6 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50/80 dark:bg-slate-900 w-fit px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-800">
            {t('dashboard.recommendFlashcard')}
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="relative overflow-hidden bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-7 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 dark:bg-teal-400/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('dashboard.quizScore')}</p>
              <h3 className="text-5xl font-serif-title text-slate-800 dark:text-slate-100 mt-2">
                {avgScoreFormatted}
                <span className="text-lg font-medium text-slate-400 dark:text-slate-500 ml-1">/10</span>
              </h3>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-teal-50/80 dark:bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400 border border-teal-100/50 dark:border-teal-500/20 shadow-inner">
              <Award className="w-6 h-6" />
            </div>
          </div>
          <div className="relative z-10 mt-6 w-full bg-slate-100 dark:bg-slate-800/80 rounded-full h-2 overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
            <div
              className="bg-gradient-to-r from-teal-400 to-teal-500 h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${avgQuizScore}%` }}
            ></div>
          </div>
        </div>
      </motion.div>

      {/* Biểu đồ và Tiếp cận nhanh */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Biểu đồ tiến bộ */}
        <div className="lg:col-span-8 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl p-8 rounded-[2rem] border border-slate-200/60 dark:border-slate-800/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h4 className="text-xl font-serif-title text-slate-800 dark:text-slate-100">{t('dashboard.chartTitle')}</h4>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{t('dashboard.chartSub')}</p>
            </div>
            <span className="text-xs font-bold px-4 py-2 bg-white dark:bg-slate-900 rounded-xl text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800/80 shadow-sm">
              {t('dashboard.chartDuration')}
            </span>
          </div>

          <div className="h-64 flex items-end justify-between gap-3 md:gap-6 pt-4 px-2 select-none">
            {mockWeeklyData.map((val, idx) => {
              const barHeightPct = (val / maxWordCount) * 85;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-3 group h-full justify-end">
                  {/* Tooltip */}
                  <span className="opacity-0 group-hover:opacity-100 bg-slate-800/90 backdrop-blur text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg mb-2 absolute -translate-y-[230px] transition-all pointer-events-none shadow-lg">
                    {val} {t('dashboard.wordsUnit')}
                  </span>
                  
                  {/* Bar */}
                  <div className="w-full bg-slate-100/50 dark:bg-slate-800/30 rounded-2xl h-full flex flex-col justify-end overflow-hidden relative">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${barHeightPct}%` }}
                      transition={{ duration: 1, type: "spring", bounce: 0.3, delay: idx * 0.05 }}
                      className="bg-gradient-to-t from-indigo-500 to-indigo-400 dark:from-indigo-600 dark:to-indigo-400 rounded-2xl w-full group-hover:from-teal-400 group-hover:to-teal-300 transition-colors cursor-pointer relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/20 w-full h-full transform -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                    </motion.div>
                  </div>
                  <span className="text-[13px] font-semibold text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">{daysOfWeek[idx]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cột Phụ: Truy cập nhanh & Mục tiêu ngày */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <h4 className="text-xl font-serif-title text-slate-800 dark:text-slate-100 px-1">{t('dashboard.quickAccess')}</h4>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setActiveTab('flashcard')}
              className="group flex flex-col items-start gap-4 p-5 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-3xl hover:shadow-xl hover:shadow-indigo-500/30 active:scale-[0.98] transition-all duration-300 text-left border border-indigo-400/30 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-125"></div>
              <Layers className="w-7 h-7 p-1.5 bg-white/20 backdrop-blur-md rounded-xl" />
              <div className="mt-2 relative z-10">
                <span className="text-xs font-medium block text-indigo-100">{t('dashboard.flashcardBtn')}</span>
                <span className="text-base font-bold block mt-0.5">Flashcard</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className="group flex flex-col items-start gap-4 p-5 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 hover:bg-white dark:hover:bg-slate-900 rounded-3xl active:scale-[0.98] transition-all duration-300 text-left text-slate-800 dark:text-slate-100 hover:shadow-md hover:-translate-y-1"
            >
              <FileQuestion className="w-7 h-7 p-1.5 bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl group-hover:scale-110 transition-transform" />
              <div className="mt-2">
                <span className="text-xs font-medium block text-slate-500 dark:text-slate-400">{t('dashboard.quizBtn')}</span>
                <span className="text-base font-bold block mt-0.5">{t('dashboard.miniQuiz')}</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('vocabulary')}
              className="group flex flex-col items-start gap-4 p-5 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 hover:bg-white dark:hover:bg-slate-900 rounded-3xl active:scale-[0.98] transition-all duration-300 text-left text-slate-800 dark:text-slate-100 hover:shadow-md hover:-translate-y-1"
            >
              <BookOpen className="w-7 h-7 p-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl group-hover:scale-110 transition-transform" />
              <div className="mt-2">
                <span className="text-xs font-medium block text-slate-500 dark:text-slate-400">{t('dashboard.vocabBtn')}</span>
                <span className="text-base font-bold block mt-0.5">{t('sidebar.vocabulary')}</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className="group flex flex-col items-start gap-4 p-5 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 hover:bg-white dark:hover:bg-slate-900 rounded-3xl active:scale-[0.98] transition-all duration-300 text-left text-slate-800 dark:text-slate-100 hover:shadow-md hover:-translate-y-1"
            >
              <TrendingUp className="w-7 h-7 p-1.5 bg-rose-50 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400 rounded-xl group-hover:scale-110 transition-transform" />
              <div className="mt-2">
                <span className="text-xs font-medium block text-slate-500 dark:text-slate-400">{t('dashboard.statsBtn')}</span>
                <span className="text-base font-bold block mt-0.5">{t('dashboard.historyStats')}</span>
              </div>
            </button>
          </div>

          {/* Daily Goal Card */}
          <div className="bg-slate-900 dark:bg-slate-950 p-7 rounded-[2rem] border border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between mt-2">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 blur-2xl rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/10 blur-xl rounded-full pointer-events-none"></div>
            <div className="relative z-10 text-white">
              <div className="flex justify-between items-start">
                <h5 className="font-semibold text-sm tracking-wide text-slate-400">{t('dashboard.dailyGoal')}</h5>
                <div className="p-2 bg-white/10 backdrop-blur rounded-xl">
                  <Award className="w-4 h-4 text-teal-400" />
                </div>
              </div>
              <p className="text-4xl font-serif-title mt-4">
                {learnedToday} <span className="text-xl text-slate-500 font-sans font-medium">/ {dailyLearingGoal}</span>
              </p>
              <p className="text-xs text-slate-400 mt-1 font-medium">{t('dashboard.memorized')}</p>
              
              <div className="mt-6 w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden border border-slate-700/50">
                <div
                  className="bg-gradient-to-r from-teal-500 to-teal-300 h-full rounded-full transition-all duration-1000 ease-out relative"
                  style={{ width: `${goalProgressPercent}%` }}
                >
                  <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-l from-white/30 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
