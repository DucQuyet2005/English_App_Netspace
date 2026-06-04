import React, { createContext, useContext, useState, useEffect } from 'react';
import { Word, QuizAttempt, AppSettings, TabType, User } from './types';
import {
  getWords,
  saveWords,
  getAttempts,
  saveAttempts,
  getSettings,
  saveSettings,
  clearLocalStorage,
  getCurrentUserId,
  getUserById,
  loginUser,
  registerUser,
  logoutUser,
  INITIAL_WORDS,
  INITIAL_ATTEMPTS,
  DEFAULT_SETTINGS
} from './services/storageService';

interface AppContextType {
  words: Word[];
  attempts: QuizAttempt[];
  settings: AppSettings;
  activeTab: TabType;
  currentUser: User | null;
  isAuthenticated: boolean;
  setActiveTab: (tab: TabType) => void;
  login: (email: string, password: string) => { success: boolean; message: string };
  register: (email: string, password: string, displayName: string) => { success: boolean; message: string };
  logout: () => void;
  addWord: (wordData: Omit<Word, 'id' | 'createdAt' | 'box' | 'nextReviewDate'>) => void;
  updateWord: (word: Word) => void;
  deleteWord: (id: string) => void;
  addAttempt: (correct: number, total: number, duration: number, topic: string) => void;
  updateSettings: (settings: AppSettings) => void;
  resetData: () => void;
  toggleWordLearned: (id: string) => void;
  exportData: () => void;
  importData: (jsonData: string) => { success: boolean; message: string };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [words, setWords] = useState<Word[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTabState] = useState<TabType>('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadUserData = (userId: string) => {
    const loadedWords = getWords(userId);
    const loadedAttempts = getAttempts(userId);
    const loadedSettings = getSettings(userId);

    setWords(loadedWords);
    setAttempts(loadedAttempts);
    setSettings(loadedSettings);

    if (loadedSettings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    const currentUserId = getCurrentUserId();
    if (currentUserId) {
      const user = getUserById(currentUserId);
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        loadUserData(user.id);
      }
    }
  }, []);

  const setActiveTab = (tab: TabType) => {
    setActiveTabState(tab);
  };

  const login = (email: string, password: string) => {
    const result = loginUser(email, password);
    if (!result.success) {
      return result;
    }

    if (result.user) {
      setCurrentUser(result.user);
      setIsAuthenticated(true);
      loadUserData(result.user.id);
    }

    return { success: true, message: result.message };
  };

  const register = (email: string, password: string, displayName: string) => {
    const result = registerUser(email, password, displayName);
    if (!result.success) {
      return result;
    }

    if (result.user) {
      setCurrentUser(result.user);
      setIsAuthenticated(true);
      loadUserData(result.user.id);
    }

    return { success: true, message: result.message };
  };

  const logout = () => {
    logoutUser();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setWords([]);
    setAttempts([]);
    setSettings(DEFAULT_SETTINGS);
    document.documentElement.classList.remove('dark');
    setActiveTabState('dashboard');
  };

  const addWord = (wordData: Omit<Word, 'id' | 'createdAt' | 'box' | 'nextReviewDate'>) => {
    const newWord: Word = {
      ...wordData,
      id: 'word_' + Date.now().toString(),
      box: 1,
      nextReviewDate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    const updated = [newWord, ...words];
    setWords(updated);
    saveWords(updated, currentUser?.id || undefined);
  };

  const updateWord = (updatedWord: Word) => {
    const updated = words.map(w => (w.id === updatedWord.id ? updatedWord : w));
    setWords(updated);
    saveWords(updated, currentUser?.id || undefined);
  };

  const deleteWord = (id: string) => {
    const updated = words.filter(w => w.id !== id);
    setWords(updated);
    saveWords(updated, currentUser?.id || undefined);
  };

  const toggleWordLearned = (id: string) => {
    const updated = words.map(w => {
      if (w.id === id) {
        const nextLearned = !w.learned;
        let nextBox = w.box;
        let nextReviewDays = 1;
        if (nextLearned) {
          nextBox = Math.min(5, w.box + 1);
          nextReviewDays = Math.pow(2, nextBox - 1);
        } else {
          nextBox = 1;
          nextReviewDays = 0;
        }

        const nextReviewDate = new Date();
        nextReviewDate.setDate(nextReviewDate.getDate() + nextReviewDays);

        return {
          ...w,
          learned: nextLearned,
          box: nextBox,
          nextReviewDate: nextReviewDate.toISOString()
        };
      }
      return w;
    });
    setWords(updated);
    saveWords(updated, currentUser?.id || undefined);
  };

  const addAttempt = (correct: number, total: number, duration: number, topic: string) => {
    const score = Math.round((correct / total) * 100);
    const newAttempt: QuizAttempt = {
      id: 'attempt_' + Date.now().toString(),
      date: new Date().toISOString(),
      score,
      totalQuestions: total,
      correctAnswers: correct,
      wrongAnswers: total - correct,
      duration,
      topic
    };
    const updated = [newAttempt, ...attempts];
    setAttempts(updated);
    saveAttempts(updated, currentUser?.id || undefined);
  };

  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings, currentUser?.id || undefined);
    if (newSettings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const resetData = () => {
    if (currentUser?.id) {
      clearLocalStorage(currentUser.id);
      saveWords(INITIAL_WORDS, currentUser.id);
      saveAttempts(INITIAL_ATTEMPTS, currentUser.id);
      saveSettings(DEFAULT_SETTINGS, currentUser.id);
    }

    setWords(INITIAL_WORDS);
    setAttempts(INITIAL_ATTEMPTS);
    setSettings(DEFAULT_SETTINGS);
    document.documentElement.classList.remove('dark');
    setActiveTabState('dashboard');
  };

  const exportData = () => {
    const stateObj = {
      words,
      attempts,
      settings,
      exportDate: new Date().toISOString(),
      app: 'LingoFlow_English',
      user: currentUser
        ? {
            id: currentUser.id,
            email: currentUser.email,
            displayName: currentUser.displayName
          }
        : null
    };
    const blob = new Blob([JSON.stringify(stateObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lingoflow_data_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (jsonData: string): { success: boolean; message: string } => {
    if (!currentUser?.id) {
      return { success: false, message: 'Vui lòng đăng nhập trước khi nhập dữ liệu.' };
    }

    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.app !== 'LingoFlow_English' || !Array.isArray(parsed.words)) {
        return { success: false, message: 'File dữ liệu không đúng định dạng LingoFlow!' };
      }

      setWords(parsed.words);
      saveWords(parsed.words, currentUser.id);

      if (Array.isArray(parsed.attempts)) {
        setAttempts(parsed.attempts);
        saveAttempts(parsed.attempts, currentUser.id);
      }

      if (parsed.settings) {
        setSettings(parsed.settings);
        saveSettings(parsed.settings, currentUser.id);
        if (parsed.settings.darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }

      return { success: true, message: 'Khôi phục dữ liệu học tập thành công!' };
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
        currentUser,
        isAuthenticated,
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
        exportData,
        importData
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
