import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  Palette,
  School,
  Database,
  Trash2,
  AlertTriangle,
  Heart,
  ChevronRight,
  BookMarked
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetData, words, attempts } = useApp();
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [quizSize, setQuizSize] = useState(settings.defaultQuizSize || 10);
  const [dailyGoal, setDailyGoal] = useState(settings.dailyGoal || 5);

  const handleDarkModeToggle = () => {
    updateSettings({
      ...settings,
      darkMode: !settings.darkMode
    });
  };

  const handleQuizSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextSize = parseInt(e.target.value);
    setQuizSize(nextSize);
    updateSettings({
      ...settings,
      defaultQuizSize: nextSize
    });
  };

  const handleDailyGoalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextGoal = parseInt(e.target.value);
    setDailyGoal(nextGoal);
    updateSettings({
      ...settings,
      dailyGoal: nextGoal
    });
  };

  const handleConfirmedReset = () => {
    resetData();
    setShowConfirmModal(false);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* 1. Theme Configuration */}
      <section className="space-y-4">
        <h4 className="text-lg font-serif-title text-slate-800 dark:text-slate-150 flex items-center gap-2">
          <Palette className="w-5 h-5 text-indigo-500" /> Bảng màu & Giao diện
        </h4>

        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <h5 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Chế độ giao diện (Dark Mode)</h5>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Chuyển đổi giữa chế độ sáng và tối giúp bảo vệ mắt vào ban đêm.</p>
          </div>

          {/* Switch toggle Button */}
          <button
            onClick={handleDarkModeToggle}
            className={`w-14 h-8 flex items-center rounded-full p-1 transition-all duration-300 ${
              settings.darkMode ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'
            }`}
          >
            <motion.div
              layout
              className="bg-white w-6 h-6 rounded-full shadow-md"
              animate={{ x: settings.darkMode ? 24 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>
      </section>

      {/* 2. Study options */}
      <section className="space-y-4">
        <h4 className="text-lg font-serif-title text-slate-800 dark:text-slate-150 flex items-center gap-2">
          <School className="w-5 h-5 text-indigo-500" /> Tùy chọn học tập
        </h4>

        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm space-y-6">
          {/* Default Quiz questions count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h5 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Số câu hỏi mặc định</h5>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Số lượng câu thi khi tạo mới Mini Quiz của bạn.</p>
            </div>

            <select
              value={quizSize}
              onChange={handleQuizSizeChange}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-extrabold text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 cursor-pointer max-w-[120px]"
            >
              <option value="5">5 câu</option>
              <option value="10">10 câu</option>
              <option value="15">15 câu</option>
              <option value="20">20 câu</option>
            </select>
          </div>

          <hr className="border-slate-100 dark:border-slate-905" />

          {/* Daily Goal questions count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h5 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Chỉ tiêu mỗi ngày</h5>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Mục tiêu số từ vựng cần học thuộc lòng mỗi ngày.</p>
            </div>

            <select
              value={dailyGoal}
              onChange={handleDailyGoalChange}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-extrabold text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 cursor-pointer max-w-[120px]"
            >
              <option value="3">3 từ</option>
              <option value="5">5 từ</option>
              <option value="10">10 từ</option>
              <option value="15">15 từ</option>
            </select>
          </div>
        </div>
      </section>

      {/* 3. Data management */}
      <section className="space-y-4">
        <h4 className="text-lg font-serif-title text-slate-800 dark:text-slate-150 flex items-center gap-2">
          <Database className="w-5 h-5 text-rose-500" /> Quản lý danh bạ dữ liệu (Danger Zone)
        </h4>

        <div className="bg-rose-50/20 dark:bg-rose-950/10 border border-rose-200/50 dark:border-rose-900/40 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1 max-w-xl">
            <h5 className="font-extrabold text-sm text-rose-600 dark:text-rose-400 flex items-center gap-2">
              Xóa sạch cơ sở dữ liệu học tập
            </h5>
            <p className="text-xs font-semibold text-slate-550 dark:text-slate-400 leading-normal">
              Hành động này sẽ <strong>xóa vĩnh viễn</strong> toàn bộ từ vựng đã nạp, mọi lịch sử ôn tập và thống kê tích lũy của bạn. Cơ sở dữ liệu sẽ khôi phục về trạng thái mẫu ban đầu.
            </p>
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs tracking-wider rounded-xl shadow-lg shadow-rose-600/20 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            XÓA TOÀN BỘ DỮ LIỆU
          </button>
        </div>
      </section>

      {/* Banner trang trí chân trang */}
      <div className="relative h-48 rounded-3xl overflow-hidden shadow-2xl border border-indigo-900/30 flex items-center justify-center text-center p-8 select-none bg-gradient-to-tr from-indigo-950 via-slate-900 to-indigo-900">
        <div className="absolute inset-0 bg-indigo-900/20 backdrop-blur-2xs" />
        
        {/* Banner Content */}
        <div className="relative z-10 text-white space-y-2">
          <h4 className="text-xl md:text-2xl font-black text-indigo-200 tracking-wide font-sans">
            Dòng chảy kiến thức không bao giờ ngừng
          </h4>
          <p className="text-xs md:text-sm text-slate-350 opacity-90 font-medium">
            Cảm ơn bạn đã tin tưởng <strong>LingoFlow</strong> đồng hành trên chặng đường chinh phục ranh giới tiếng Anh!
          </p>
        </div>

        {/* Decor */}
        <div className="absolute right-0 bottom-0 translate-x-6 translate-y-6 opacity-5">
          <BookMarked className="w-36 h-36" />
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 relative z-10 text-center space-y-6 shadow-2xl"
            >
              <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/20 rounded-2xl flex items-center justify-center text-rose-600 dark:text-rose-450 mx-auto border border-rose-100/40">
                <AlertTriangle className="w-8 h-8 animate-bounce" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-slate-850 dark:text-slate-100">
                  Xác nhận Khôi phục dữ liệu?
                </h3>
                <p className="text-xs font-semibold text-slate-450 dark:text-slate-500 leading-normal max-w-sm mx-auto">
                  Tất cả tiến trình học tập, lịch sử thi và từ vựng mới bạn thêm sẽ bị xóa đi. Chúng tôi đề xuất bạn nên <strong>Xuất JSON</strong> để lưu trữ trước khi xác nhận.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleConfirmedReset}
                  className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm rounded-xl shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  Ok, Xác nhận xóa hết
                </button>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="w-full py-3.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-350 border border-slate-200 dark:border-slate-800 font-extrabold text-sm rounded-xl active:scale-95 transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
