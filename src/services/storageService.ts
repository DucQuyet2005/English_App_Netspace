import { Word, QuizAttempt, AppSettings, User } from '../types';

const WORDS_KEY_BASE = 'lingoflow_words';
const ATTEMPTS_KEY_BASE = 'lingoflow_attempts';
const SETTINGS_KEY_BASE = 'lingoflow_settings';
const USERS_KEY = 'lingoflow_users';
const CURRENT_USER_KEY = 'lingoflow_current_user';

const getNamespacedKey = (base: string, userId?: string) => {
  const id = userId?.trim() || 'default';
  return `${base}_${id}`;
};

const hashPassword = (password: string) => {
  return btoa(unescape(encodeURIComponent(password)));
};

export const INITIAL_WORDS: Word[] = [
  {
    id: 'mother',
    word: 'Mother',
    ipa: '/ˈmʌðər/',
    meaning: 'Mẹ, người mẹ',
    example: 'Every mother wants the best for her children.',
    topic: 'Gia đình',
    learned: true,
    box: 3,
    nextReviewDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'father',
    word: 'Father',
    ipa: '/ˈfɑːðər/',
    meaning: 'Bố, cha, tía',
    example: 'He looks up to his father as a role model.',
    topic: 'Gia đình',
    learned: true,
    box: 3,
    nextReviewDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'brother',
    word: 'Brother',
    ipa: '/ˈbrʌðər/',
    meaning: 'Anh trai, em trai',
    example: 'My elder brother is currently studying in Japan.',
    topic: 'Gia đình',
    learned: false,
    box: 1,
    nextReviewDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sister',
    word: 'Sister',
    ipa: '/ˈsɪstər/',
    meaning: 'Chị gái, em gái',
    example: 'She shares a very close bond with her younger sister.',
    topic: 'Gia đình',
    learned: false,
    box: 1,
    nextReviewDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'grandmother',
    word: 'Grandmother',
    ipa: '/ˈɡræn.mʌð.ər/',
    meaning: 'Bà (nội hoặc ngoại)',
    example: 'My grandmother cooks the most delicious traditional meals.',
    topic: 'Gia đình',
    learned: true,
    box: 2,
    nextReviewDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'grandfather',
    word: 'Grandfather',
    ipa: '/ˈɡræn.fɑː.ðər/',
    meaning: 'Ông (nội hoặc ngoại)',
    example: 'Our grandfather enjoys reading newspapers in the garden.',
    topic: 'Gia đình',
    learned: false,
    box: 1,
    nextReviewDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'uncle',
    word: 'Uncle',
    ipa: '/ˈʌŋ.kl̩/',
    meaning: 'Chú, bác trai, cậu, dượng',
    example: 'My uncle lives in London and represents an international firm.',
    topic: 'Gia đình',
    learned: false,
    box: 2,
    nextReviewDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'aunt',
    word: 'Aunt',
    ipa: '/ænt/',
    meaning: 'Cô, dì, bác gái, mợ, thím',
    example: 'My aunt always sends me beautiful handmade birthday cards.',
    topic: 'Gia đình',
    learned: true,
    box: 3,
    nextReviewDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cousin',
    word: 'Cousin',
    ipa: '/ˈkʌz.n̩/',
    meaning: 'Anh chị em họ',
    example: 'I have a cousin who is an exceptional graphic designer.',
    topic: 'Gia đình',
    learned: false,
    box: 1,
    nextReviewDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'parent',
    word: 'Parent',
    ipa: '/ˈpeə.rənt/',
    meaning: 'Bố hoặc mẹ (phụ huynh)',
    example: 'The school held an active discussion with each parent.',
    topic: 'Gia đình',
    learned: true,
    box: 2,
    nextReviewDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'resilience',
    word: 'Resilience',
    ipa: '/rɪˈzɪl.jəns/',
    meaning: 'Sự kiên cường, khả năng phục hồi',
    example: 'She showed great resilience in overcoming her illness.',
    topic: 'IELTS',
    learned: true,
    box: 3,
    nextReviewDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'itinerary',
    word: 'Itinerary',
    ipa: '/aɪˈtɪn.ə.rer.i/',
    meaning: 'Hành trình, lịch trình chuyến đi',
    example: 'We must plan our itinerary carefully before traveling to Sa Pa.',
    topic: 'Du lịch',
    learned: false,
    box: 1,
    nextReviewDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'collaborate',
    word: 'Collaborate',
    ipa: '/kəˈlæb.ə.reɪt/',
    meaning: 'Cộng tác, hợp tác làm việc',
    example: 'Researchers from various universities collaborate on this project.',
    topic: 'Công việc',
    learned: false,
    box: 1,
    nextReviewDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  }
];

export const INITIAL_ATTEMPTS: QuizAttempt[] = [
  {
    id: 'attempt1',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    score: 80,
    totalQuestions: 10,
    correctAnswers: 8,
    wrongAnswers: 2,
    duration: 120,
    topic: 'Gia đình'
  },
  {
    id: 'attempt2',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    score: 90,
    totalQuestions: 10,
    correctAnswers: 9,
    wrongAnswers: 1,
    duration: 95,
    topic: 'Hỗn hợp'
  },
  {
    id: 'attempt3',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    score: 100,
    totalQuestions: 5,
    correctAnswers: 5,
    wrongAnswers: 0,
    duration: 45,
    topic: 'IELTS'
  }
];

export const DEFAULT_SETTINGS: AppSettings = {
  darkMode: false,
  defaultQuizSize: 10,
  dailyGoal: 5
};

export const getUsers = (): User[] => {
  const data = localStorage.getItem(USERS_KEY);
  if (!data) {
    return [];
  }
  return JSON.parse(data);
};

export const saveUsers = (users: User[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getCurrentUserId = (): string | null => {
  return localStorage.getItem(CURRENT_USER_KEY);
};

export const saveCurrentUserId = (userId: string | null): void => {
  if (userId) {
    localStorage.setItem(CURRENT_USER_KEY, userId);
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

export const clearCurrentUser = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getUserById = (userId: string): User | null => {
  const users = getUsers();
  const found = users.find((user) => user.id === userId);
  return found ?? null;
};

export const getWords = (userId?: string): Word[] => {
  const key = getNamespacedKey(WORDS_KEY_BASE, userId);
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(INITIAL_WORDS));
    return INITIAL_WORDS;
  }
  return JSON.parse(data);
};

export const saveWords = (words: Word[], userId?: string): void => {
  const key = getNamespacedKey(WORDS_KEY_BASE, userId);
  localStorage.setItem(key, JSON.stringify(words));
};

export const getAttempts = (userId?: string): QuizAttempt[] => {
  const key = getNamespacedKey(ATTEMPTS_KEY_BASE, userId);
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(INITIAL_ATTEMPTS));
    return INITIAL_ATTEMPTS;
  }
  return JSON.parse(data);
};

export const saveAttempts = (attempts: QuizAttempt[], userId?: string): void => {
  const key = getNamespacedKey(ATTEMPTS_KEY_BASE, userId);
  localStorage.setItem(key, JSON.stringify(attempts));
};

export const getSettings = (userId?: string): AppSettings => {
  const key = getNamespacedKey(SETTINGS_KEY_BASE, userId);
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  }
  return JSON.parse(data);
};

export const saveSettings = (settings: AppSettings, userId?: string): void => {
  const key = getNamespacedKey(SETTINGS_KEY_BASE, userId);
  localStorage.setItem(key, JSON.stringify(settings));
};

export const clearLocalStorage = (userId?: string): void => {
  if (userId) {
    localStorage.removeItem(getNamespacedKey(WORDS_KEY_BASE, userId));
    localStorage.removeItem(getNamespacedKey(ATTEMPTS_KEY_BASE, userId));
    localStorage.removeItem(getNamespacedKey(SETTINGS_KEY_BASE, userId));
    return;
  }
  localStorage.removeItem(getNamespacedKey(WORDS_KEY_BASE, 'default'));
  localStorage.removeItem(getNamespacedKey(ATTEMPTS_KEY_BASE, 'default'));
  localStorage.removeItem(getNamespacedKey(SETTINGS_KEY_BASE, 'default'));
};

export const registerUser = (
  email: string,
  password: string,
  displayName?: string
): { success: boolean; message: string; user?: User } => {
  const normalizedEmail = email.trim().toLowerCase();
  const users = getUsers();

  if (!normalizedEmail || !password) {
    return { success: false, message: 'Vui lòng nhập email và mật khẩu hợp lệ.' };
  }

  if (users.some((user) => user.email === normalizedEmail)) {
    return { success: false, message: 'Email đã được sử dụng. Vui lòng thử email khác.' };
  }

  const newUser: User = {
    id: `user_${Date.now()}`,
    email: normalizedEmail,
    displayName: displayName?.trim() || normalizedEmail.split('@')[0],
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString()
  };

  const nextUsers = [newUser, ...users];
  saveUsers(nextUsers);
  saveCurrentUserId(newUser.id);
  saveWords(INITIAL_WORDS, newUser.id);
  saveAttempts(INITIAL_ATTEMPTS, newUser.id);
  saveSettings(DEFAULT_SETTINGS, newUser.id);

  return { success: true, message: 'Đăng ký thành công. Chào mừng đến với LingoFlow!', user: newUser };
};

export const loginUser = (
  email: string,
  password: string
): { success: boolean; message: string; user?: User } => {
  const normalizedEmail = email.trim().toLowerCase();
  const users = getUsers();
  const found = users.find((user) => user.email === normalizedEmail);

  if (!found) {
    return { success: false, message: 'Email chưa được đăng ký. Vui lòng đăng ký trước.' };
  }

  if (found.passwordHash !== hashPassword(password)) {
    return { success: false, message: 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.' };
  }

  saveCurrentUserId(found.id);
  return { success: true, message: 'Đăng nhập thành công.', user: found };
};

export const logoutUser = (): void => {
  clearCurrentUser();
};
