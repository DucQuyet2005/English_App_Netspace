import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Word, QuizAttempt, AppSettings, TabType } from './types';
import {
  apiLogin,
  apiRegister,
  apiGetMe,
  apiLogout,
  apiGetWords,
  apiCreateWord,
  apiUpdateWord as apiUpdateWordReq,
  apiDeleteWord as apiDeleteWordReq,
  apiToggleWordLearned as apiToggleLearned,
  apiSetWordLearned,
  apiGetAttempts,
  apiCreateAttempt,
  apiUpdateSettings as apiUpdateSettingsReq,
  apiExportData,
  apiImportData,
  apiResetData,
  getToken,
} from './services/apiService';

// User type for frontend (no passwordHash)
interface FrontendUser {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: false,
  theme: 'normal',
  defaultQuizSize: 10,
  dailyGoal: 5,
};

interface AppContextType {
  words: Word[];
  attempts: QuizAttempt[];
  settings: AppSettings;
  activeTab: TabType;
  currentUser: FrontendUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  setActiveTab: (tab: TabType) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (email: string, password: string, displayName: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  addWord: (wordData: Omit<Word, 'id' | 'createdAt' | 'box' | 'nextReviewDate'>) => Promise<void>;
  updateWord: (word: Word) => Promise<void>;
  deleteWord: (id: string) => Promise<void>;
  addAttempt: (correct: number, total: number, duration: number, topic: string) => Promise<void>;
  updateSettings: (settings: AppSettings) => Promise<void>;
  resetData: () => Promise<void>;
  toggleWordLearned: (id: string) => Promise<void>;
  setWordLearned: (id: string, learned: boolean) => Promise<void>;
  exportData: () => Promise<void>;
  importData: (jsonData: string) => Promise<{ success: boolean; message: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const applyTheme = (theme?: AppSettings['theme'], preferDark?: boolean) => {
  const t = theme ?? (preferDark ? 'dark' : 'dark');
  if (t === 'dark') {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('theme-light');
  } else if (t === 'light') {
    document.documentElement.classList.add('theme-light');
    document.documentElement.classList.remove('dark');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.remove('theme-light');
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [words, setWords] = useState<Word[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTabState] = useState<TabType>('dashboard');
  const [currentUser, setCurrentUser] = useState<FrontendUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load all user data from API
  const loadUserData = useCallback(async (userSettings?: AppSettings) => {
    try {
      const [wordsData, attemptsData] = await Promise.all([
        apiGetWords(),
        apiGetAttempts(),
      ]);
      setWords(wordsData);
      setAttempts(attemptsData);
      if (userSettings) {
        setSettings(userSettings);
        applyTheme(userSettings.theme, userSettings.darkMode);
      } else {
        applyTheme(DEFAULT_SETTINGS.theme, DEFAULT_SETTINGS.darkMode);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  }, []);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      if (!token) {
        applyTheme(DEFAULT_SETTINGS.theme, DEFAULT_SETTINGS.darkMode);
        setLoading(false);
        return;
      }

      try {
        const result = await apiGetMe();
        if (result.success && result.user) {
          setCurrentUser({
            id: result.user.id,
            email: result.user.email,
            displayName: result.user.displayName,
            createdAt: result.user.createdAt,
          });
          setIsAuthenticated(true);
          await loadUserData(result.user.settings);
        }
      } catch (error) {
        // Token expired or invalid
        apiLogout();
        applyTheme(DEFAULT_SETTINGS.theme, DEFAULT_SETTINGS.darkMode);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [loadUserData]);

  const setActiveTab = (tab: TabType) => {
    setActiveTabState(tab);
  };

  const login = async (email: string, password: string) => {
    try {
      const result = await apiLogin(email, password);
      if (result.success && result.user) {
        setCurrentUser({
          id: result.user.id,
          email: result.user.email,
          displayName: result.user.displayName,
          createdAt: result.user.createdAt,
        });
        setIsAuthenticated(true);
        await loadUserData(result.user.settings);
        return { success: true, message: result.message };
      }
      return { success: false, message: result.message };
    } catch (error: any) {
      return { success: false, message: error.message || 'Lỗi đăng nhập.' };
    }
  };

  const register = async (email: string, password: string, displayName: string) => {
    try {
      const result = await apiRegister(email, password, displayName);
      if (result.success && result.user) {
        setCurrentUser({
          id: result.user.id,
          email: result.user.email,
          displayName: result.user.displayName,
          createdAt: result.user.createdAt,
        });
        setIsAuthenticated(true);
        await loadUserData(result.user.settings);
        return { success: true, message: result.message };
      }
      return { success: false, message: result.message };
    } catch (error: any) {
      return { success: false, message: error.message || 'Lỗi đăng ký.' };
    }
  };

  const logout = () => {
    apiLogout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setWords([]);
    setAttempts([]);
    setSettings(DEFAULT_SETTINGS);
    applyTheme(DEFAULT_SETTINGS.theme, DEFAULT_SETTINGS.darkMode);
    setActiveTabState('dashboard');
  };

  const addWord = async (wordData: Omit<Word, 'id' | 'createdAt' | 'box' | 'nextReviewDate'>) => {
    try {
      const newWord = await apiCreateWord(wordData);
      setWords((prev) => [newWord, ...prev]);
    } catch (error) {
      console.error('Failed to add word:', error);
    }
  };

  const updateWord = async (updatedWord: Word) => {
    try {
      const result = await apiUpdateWordReq(updatedWord);
      setWords((prev) => prev.map((w) => (w.id === result.id ? result : w)));
    } catch (error) {
      console.error('Failed to update word:', error);
    }
  };

  const deleteWord = async (id: string) => {
    try {
      await apiDeleteWordReq(id);
      setWords((prev) => prev.filter((w) => w.id !== id));
    } catch (error) {
      console.error('Failed to delete word:', error);
    }
  };

  const toggleWordLearned = async (id: string) => {
    try {
      const updated = await apiToggleLearned(id);
      setWords((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
    } catch (error) {
      console.error('Failed to toggle learned:', error);
    }
  };

  // Set learned status trực tiếp (dùng cho Flashcard, không toggle)
  const setWordLearned = async (id: string, learned: boolean) => {
    try {
      const updated = await apiSetWordLearned(id, learned);
      setWords((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
    } catch (error) {
      console.error('Failed to set learned:', error);
    }
  };

  const addAttempt = async (correct: number, total: number, duration: number, topic: string) => {
    try {
      const score = Math.round((correct / total) * 100);
      const newAttempt = await apiCreateAttempt({
        score,
        totalQuestions: total,
        correctAnswers: correct,
        wrongAnswers: total - correct,
        duration,
        topic,
      });
      setAttempts((prev) => [newAttempt, ...prev]);
    } catch (error) {
      console.error('Failed to add attempt:', error);
    }
  };

  const updateSettings = async (newSettings: AppSettings) => {
    try {
      const result = await apiUpdateSettingsReq(newSettings);
      setSettings(result);
      applyTheme(result.theme, result.darkMode);
    } catch (error) {
      console.error('Failed to update settings:', error);
      // Apply locally anyway for responsiveness
      setSettings(newSettings);
      applyTheme(newSettings.theme, newSettings.darkMode);
    }
  };

  const resetData = async () => {
    try {
      await apiResetData();
      // Reload data from server
      await loadUserData(DEFAULT_SETTINGS);
      applyTheme(DEFAULT_SETTINGS.theme, DEFAULT_SETTINGS.darkMode);
      setActiveTabState('dashboard');
    } catch (error) {
      console.error('Failed to reset data:', error);
    }
  };

  const exportData = async () => {
    try {
      const data = await apiExportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lingoflow_data_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const importData = async (jsonData: string): Promise<{ success: boolean; message: string }> => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.app !== 'LingoFlow_English' || !Array.isArray(parsed.words)) {
        return { success: false, message: 'File dữ liệu không đúng định dạng LingoFlow!' };
      }

      const result = await apiImportData({
        words: parsed.words,
        attempts: parsed.attempts,
        settings: parsed.settings,
      });

      if (result.success) {
        // Reload all data
        await loadUserData(parsed.settings);
      }

      return result;
    } catch (e) {
      return { success: false, message: 'Không thể giải mã dữ liệu JSON. File bị hỏng!' };
    }
  };

  return (
    <AppContext.Provider
      value={{
        words,
        attempts,
        settings,
        activeTab,
        currentUser: currentUser as any,
        isAuthenticated,
        loading,
        setActiveTab,
        login,
        register,
        logout,
        addWord,
        updateWord,
        deleteWord,
        addAttempt,
        updateSettings,
        resetData,
        toggleWordLearned,
        setWordLearned,
        exportData,
        importData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
