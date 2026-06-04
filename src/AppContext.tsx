import React, { createContext, useContext, useState, useEffect } from 'react';
import { Word, QuizAttempt, AppSettings, TabType } from './types';
import {
  getWords,
  saveWords,
  getAttempts,
  saveAttempts,
  getSettings,
  saveSettings,
  clearLocalStorage,
  INITIAL_WORDS,
  INITIAL_ATTEMPTS,
  DEFAULT_SETTINGS
} from './services/storageService';

interface AppContextType {
  words: Word[];
  attempts: QuizAttempt[];
  settings: AppSettings;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
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

  // Load initial data
  useEffect(() => {
    setWords(getWords());
    setAttempts(getAttempts());
    
    const loadedSettings = getSettings();
    setSettings(loadedSettings);
    
    // Apply dark mode immediately on mount
    if (loadedSettings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const setActiveTab = (tab: TabType) => {
    setActiveTabState(tab);
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
    saveWords(updated);
  };

  const updateWord = (updatedWord: Word) => {
    const updated = words.map(w => w.id === updatedWord.id ? updatedWord : w);
    setWords(updated);
    saveWords(updated);
  };

  const deleteWord = (id: string) => {
    const updated = words.filter(w => w.id !== id);
    setWords(updated);
    saveWords(updated);
  };

  const toggleWordLearned = (id: string) => {
    const updated = words.map(w => {
      if (w.id === id) {
        const nextLearned = !w.learned;
        // Spaced repetition simplier logic:
        // Nếu thuộc thì nâng box (tối đa 5), lùi thời gian ôn xa hơn.
        // Nếu chưa thuộc thì hạ box xuống 1, học ngay.
        let nextBox = w.box;
        let nextReviewDays = 1;
        if (nextLearned) {
          nextBox = Math.min(5, w.box + 1);
          // 1->1 day, 2->2 days, 3->4 days, 4->7 days, 5->14 days
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
    saveWords(updated);
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
    saveAttempts(updated);
  };

  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    if (newSettings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const resetData = () => {
    clearLocalStorage();
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
      app: 'LingoFlow_English'
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
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.app !== 'LingoFlow_English' || !Array.isArray(parsed.words)) {
        return { success: false, message: 'File dữ liệu không đúng định dạng LingoFlow!' };
      }
      
      setWords(parsed.words);
      saveWords(parsed.words);
      
      if (Array.isArray(parsed.attempts)) {
        setAttempts(parsed.attempts);
        saveAttempts(parsed.attempts);
      }
      
      if (parsed.settings) {
        setSettings(parsed.settings);
        saveSettings(parsed.settings);
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
        setActiveTab,
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
