import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Search, Bell, Menu, GraduationCap, LogOut } from 'lucide-react';

interface TopBarProps {
  onSearchChange?: (val: string) => void;
  searchValue?: string;
  onMenuClick?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onSearchChange,
  searchValue = '',
  onMenuClick
}) => {
  const { activeTab, setActiveTab, words, currentUser, logout } = useApp();
  const [localSearch, setLocalSearch] = useState(searchValue);

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Bảng điều khiển';
      case 'vocabulary':
        return 'Quản lý từ vựng';
      case 'flashcard':
        return 'Thẻ ghi nhớ (Flashcard)';
      case 'quiz':
        return 'Kiểm tra (Quiz)';
      case 'stats':
        return 'Thống kê & Tiến hành';
      case 'settings':
        return 'Cài đặt hệ thống';
      default:
        return 'LingoFlow';
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab !== 'vocabulary') {
      setActiveTab('vocabulary');
    }
    if (onSearchChange) {
      onSearchChange(localSearch);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSearch(val);
    if (onSearchChange) {
      onSearchChange(val);
    }
  };

  const learnedCount = words.filter(w => w.learned).length;

  return (
    <header className="fixed top-0 right-0 z-40 flex items-center justify-between px-6 md:px-12 w-full md:pl-80 h-20 bg-white/70 dark:bg-slate-950/70 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-800/80 transition-colors duration-300">
      {/* Off-canvas menu trigger (Mobile) */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl md:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-xl md:text-2xl font-serif-title text-slate-800 dark:text-slate-150 tracking-tight">
          {getTitle()}
        </h2>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-6">
        {/* Search Bar - Hidden on small screen, visible on medium+ or only on specific pages */}
        {(activeTab === 'dashboard' || activeTab === 'vocabulary') && (
          <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
            <Search className="w-5.5 h-5.5 absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Tìm kiếm từ vựng..."
              value={localSearch}
              onChange={handleInputChange}
              className="pl-12 pr-6 py-2.5 bg-slate-100 dark:bg-slate-900 border-none rounded-full text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-slate-850 dark:text-slate-200 w-64 md:w-80 transition-all shadow-inner"
            />
          </form>
        )}

        {/* Dynamic Streak Display or Badge */}
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-slate-900 border border-indigo-100/50 dark:border-slate-850 rounded-2xl">
          <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
            {learnedCount} đã học
          </span>
        </div>

        {/* Notifications Icon (Mock) */}
        <button className="relative p-2.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100/60 dark:bg-slate-900/60 transition-colors duration-200 rounded-2xl">
          <Bell className="w-5.5 h-5.5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {currentUser?.displayName ?? 'Người dùng'}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[160px]">
              {currentUser?.email ?? 'Chưa đăng nhập'}
            </span>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
};
