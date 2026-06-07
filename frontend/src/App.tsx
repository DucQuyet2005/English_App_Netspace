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
import { Leaderboard } from './pages/Leaderboard';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, isAuthenticated, loading } = useApp();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [globalSearch, setGlobalSearch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'vocabulary':
        return <Vocabulary searchValue={globalSearch} onSearchChange={setGlobalSearch} />;
      case 'flashcard':
        return <FlashcardsPage />;
      case 'quiz':
        return <QuizPage />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'stats':
        return <StatsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex items-center justify-center px-4 py-10">
        {authMode === 'login' ? (
          <LoginPage onSwitch={() => setAuthMode('register')} />
        ) : (
          <RegisterPage onSwitch={() => setAuthMode('login')} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex transition-colors duration-300">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col md:pl-72 pb-24 md:pb-0 min-h-screen relative">
        <TopBar
          searchValue={globalSearch}
          onSearchChange={(val) => {
            setGlobalSearch(val);
          }}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        <main className="flex-1 pt-24 px-6 md:px-12 py-8 overflow-y-auto w-full transition-all">
          <div className="max-w-7xl mx-auto w-full">{renderActivePage()}</div>
        </main>
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
