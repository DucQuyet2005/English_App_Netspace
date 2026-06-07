import React from 'react';
import { useApp } from '../AppContext';
import { TabType } from '../types';
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  FileQuestion,
  TrendingUp,
  Trophy
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const navItems = [
    { id: 'dashboard' as TabType, label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'vocabulary' as TabType, label: 'Từ vựng', icon: BookOpen },
    { id: 'flashcard' as TabType, label: 'Học tập', icon: Layers },
    { id: 'quiz' as TabType, label: 'Kiểm tra', icon: FileQuestion },
    { id: 'leaderboard' as TabType, label: 'Xếp hạng', icon: Trophy },
    { id: 'stats' as TabType, label: 'Thống kê', icon: TrendingUp },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-3 pt-2.5 bg-white/90 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/60 dark:border-slate-800 md:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.04)] rounded-t-3xl transition-colors duration-300">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => handleTabChange(item.id)}
            className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 min-w-[64px] ${
              isActive
                ? 'bg-indigo-50 dark:bg-slate-800/80 text-indigo-600 dark:text-indigo-400 font-bold scale-105'
                : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
          >
            <Icon className="w-5.5 h-5.5" />
            <span className="text-[10px] font-medium mt-1 uppercase tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
