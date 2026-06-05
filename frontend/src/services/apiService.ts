import { Word, QuizAttempt, AppSettings } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const TOKEN_KEY = 'lingoflow_token';

// ─── Token helpers ───────────────────────────────────────────────
export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = (): void => localStorage.removeItem(TOKEN_KEY);

// ─── Fetch wrapper ───────────────────────────────────────────────
async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Lỗi kết nối server.');
  }

  return data;
}

// ─── Auth API ────────────────────────────────────────────────────
export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    displayName: string;
    settings: AppSettings;
    createdAt: string;
  };
}

export const apiLogin = async (email: string, password: string): Promise<AuthResponse> => {
  const data = await apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data.token) setToken(data.token);
  return data;
};

export const apiRegister = async (
  email: string,
  password: string,
  displayName: string
): Promise<AuthResponse> => {
  const data = await apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, displayName }),
  });
  if (data.token) setToken(data.token);
  return data;
};

export const apiGetMe = async (): Promise<AuthResponse> => {
  return apiFetch<AuthResponse>('/auth/me');
};

export const apiLogout = (): void => {
  removeToken();
};

// ─── Words API ───────────────────────────────────────────────────
export const apiGetWords = async (): Promise<Word[]> => {
  const data = await apiFetch<{ success: boolean; words: Word[] }>('/words');
  return data.words;
};

export const apiCreateWord = async (
  wordData: Omit<Word, 'id' | 'createdAt' | 'box' | 'nextReviewDate'>
): Promise<Word> => {
  const data = await apiFetch<{ success: boolean; word: Word }>('/words', {
    method: 'POST',
    body: JSON.stringify(wordData),
  });
  return data.word;
};

export const apiUpdateWord = async (word: Word): Promise<Word> => {
  const data = await apiFetch<{ success: boolean; word: Word }>(`/words/${word.id}`, {
    method: 'PUT',
    body: JSON.stringify(word),
  });
  return data.word;
};

export const apiToggleWordLearned = async (id: string): Promise<Word> => {
  const data = await apiFetch<{ success: boolean; word: Word }>(`/words/${id}/learned`, {
    method: 'PATCH',
  });
  return data.word;
};

export const apiDeleteWord = async (id: string): Promise<void> => {
  await apiFetch(`/words/${id}`, { method: 'DELETE' });
};

// ─── Quiz API ────────────────────────────────────────────────────
export const apiGetAttempts = async (): Promise<QuizAttempt[]> => {
  const data = await apiFetch<{ success: boolean; attempts: QuizAttempt[] }>('/quiz/attempts');
  return data.attempts;
};

export const apiCreateAttempt = async (attempt: {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  duration: number;
  topic: string;
}): Promise<QuizAttempt> => {
  const data = await apiFetch<{ success: boolean; attempt: QuizAttempt }>('/quiz/attempts', {
    method: 'POST',
    body: JSON.stringify(attempt),
  });
  return data.attempt;
};

// ─── Settings API ────────────────────────────────────────────────
export const apiUpdateSettings = async (settings: Partial<AppSettings>): Promise<AppSettings> => {
  const data = await apiFetch<{ success: boolean; settings: AppSettings }>('/users/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
  return data.settings;
};

// ─── Data Sync API ───────────────────────────────────────────────
export const apiExportData = async (): Promise<any> => {
  const data = await apiFetch<{ success: boolean; data: any }>('/data/export');
  return data.data;
};

export const apiImportData = async (importPayload: {
  words: any[];
  attempts?: any[];
  settings?: any;
}): Promise<{ success: boolean; message: string }> => {
  return apiFetch('/data/import', {
    method: 'POST',
    body: JSON.stringify(importPayload),
  });
};

export const apiResetData = async (): Promise<{ success: boolean; message: string }> => {
  return apiFetch('/data/reset', { method: 'DELETE' });
};
