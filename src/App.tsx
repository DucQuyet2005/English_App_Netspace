import React, { useState } from 'react';
import { AppProvider, useApp } from './AppContext';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { MobileNav } from './components/MobileNav';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Vocabulary } from './pages/Vocabulary';
import { FlashcardsPage } from './pages/FlashcardsPage';
import { QuizPage } from './pages/QuizPage';
import { StatsPage } from './pages/StatsPage';
import { SettingsPage } from './pages/SettingsPage';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();
  
  // Trạng thái chia sẻ tìm kiếm thông qua nhập liệu ở TopBar hướng tới Vocabulary
  const [globalSearch, setGlobalSearch] = useState('');

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'vocabulary':
        // Truyền giá trị tìm kiếm thông minh từ TopBar
        return <Vocabulary />;
      case 'flashcard':
        return <FlashcardsPage />;
      case 'quiz':
        return <QuizPage />;
      case 'stats':
        return <StatsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex transition-colors duration-300">
      {/* 1. Sidebar bên trái cho desktop */}
      <Sidebar />

      {/* 2. Toàn bộ bên phải */}
      <div className="flex-1 flex flex-col md:pl-72 pb-24 md:pb-0 min-h-screen relative">
        {/* Top Header */}
        <TopBar
          searchValue={globalSearch}
          onSearchChange={(val) => {
            setGlobalSearch(val);
          }}
        />

        {/* Vùng nội dung chính */}
        <main className="flex-1 pt-24 px-6 md:px-12 py-8 overflow-y-auto w-full transition-all">
          <div className="max-w-7xl mx-auto w-full">
            {renderActivePage()}
          </div>
        </main>

        {/* 3. Navigation Board bên dưới cho Mobile */}
        <MobileNav />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
