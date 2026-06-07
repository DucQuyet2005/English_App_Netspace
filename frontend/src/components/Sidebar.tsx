import React from 'react';
import { useApp } from '../AppContext';
import { TabType } from '../types';
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  FileQuestion,
  TrendingUp,
  Settings,
  User,
  X,
  Trophy
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { activeTab, setActiveTab, words, currentUser, settings } = useApp();
  const { language, toggleLanguage, t } = useLanguage();

  const theme = settings.theme ?? (settings.darkMode ? 'dark' : 'normal');
  const sidebarThemeClasses =
    theme === 'light'
      ? 'bg-white border-slate-200 text-slate-900'
      : theme === 'dark'
        ? 'bg-slate-950 border-slate-800 text-slate-100'
        : 'bg-sidebar border-slate-200 text-slate-900';

  const menuItems = [
    { id: 'dashboard' as TabType, label: 'Bảng điều khiển', icon: LayoutDashboard },
    { id: 'vocabulary' as TabType, label: 'Từ vựng', icon: BookOpen },
    { id: 'flashcard' as TabType, label: 'Thẻ ghi nhớ', icon: Layers },
    { id: 'quiz' as TabType, label: 'Kiểm tra', icon: FileQuestion },
    { id: 'leaderboard' as TabType, label: 'Xếp hạng', icon: Trophy },
    { id: 'stats' as TabType, label: 'Thống kê', icon: TrendingUp },
  ];

  const learnedCount = words.filter(w => w.learned).length;
  // Cấp độ tự động tính dựa trên số từ đã học
  const getLevel = (count: number) => {
    if (count >= 20) return 'Cao cấp';
    if (count >= 10) return 'Trung cấp';
    return 'Cơ bản';
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-45 md:hidden"
        />
      )}

      <aside className={`fixed left-0 top-0 h-full w-72 h-screen flex flex-col border-r z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 ${sidebarThemeClasses}`}>
        {/* Brand Logo & Close Button */}
        <div className="p-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif-title text-indigo-600 dark:text-indigo-300 italic tracking-tight">
              LingoFlow
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
              Hành trình học tiếng Anh
            </p>
          </div>
          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl md:hidden transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center gap-4 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 ${isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 dark:shadow-indigo-600/10 scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/60 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-indigo-600'}`} />
                <span>{t('sidebar.' + item.id)}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Controls & User Info */}
        <div className="p-4 border-t border-slate-200/60 dark:border-slate-800 space-y-4">
          <button
            onClick={() => {
              setActiveTab('settings');
              if (onClose) onClose();
            }}
            className={`w-full flex items-center gap-4 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'settings'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 hover:text-indigo-600'
              }`}
          >
            <Settings className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            <span>{t('sidebar.settings')}</span> {/* Đổi sang dùng hàm t() */}
          </button>
          {/* NÚT CHUYỂN ĐỔI NGÔN NGỮ */}
          <button
            onClick={toggleLanguage}
            className="w-full flex items-center justify-between px-6 py-3 rounded-xl text-sm font-semibold border border-slate-200/50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-200/60 dark:hover:bg-slate-800/80 transition-all duration-300 group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              {language === 'vi' ? (
                <>
                  <span className="text-lg leading-none" role="img" aria-label="English">🇺🇸</span>
                  <span className="text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    English
                  </span>
                </>
              ) : (
                <>
                  <span className="text-lg leading-none" role="img" aria-label="Tiếng Việt">🇻🇳</span>
                  <span className="text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Tiếng Việt
                  </span>
                </>
              )}
            </div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800">
              {language === 'vi' ? 'EN' : 'VI'}
            </span>
          </button>

          {/* User Card */}
          <div className="flex items-center gap-4 px-4 py-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-sm transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100/40 dark:border-slate-700">
              <User className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{currentUser?.displayName ?? 'Người dùng'}</p>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[180px]">
                {currentUser?.email ?? 'Chưa đăng nhập'}
              </p>
              <p className="text-3xs font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">
                Cấp độ: {getLevel(learnedCount)}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
