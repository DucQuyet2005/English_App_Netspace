import { Word, QuizAttempt, AppSettings } from '../types';

const WORDS_KEY = 'lingoflow_words';
const ATTEMPTS_KEY = 'lingoflow_attempts';
const SETTINGS_KEY = 'lingoflow_settings';

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
  // Bổ sung các từ chủ đề khác để phong phú
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

export const getWords = (): Word[] => {
  const data = localStorage.getItem(WORDS_KEY);
  if (!data) {
    localStorage.setItem(WORDS_KEY, JSON.stringify(INITIAL_WORDS));
    return INITIAL_WORDS;
  }
  return JSON.parse(data);
};

export const saveWords = (words: Word[]): void => {
  localStorage.setItem(WORDS_KEY, JSON.stringify(words));
};

export const getAttempts = (): QuizAttempt[] => {
  const data = localStorage.getItem(ATTEMPTS_KEY);
  if (!data) {
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(INITIAL_ATTEMPTS));
    return INITIAL_ATTEMPTS;
  }
  return JSON.parse(data);
};

export const saveAttempts = (attempts: QuizAttempt[]): void => {
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
};

export const getSettings = (): AppSettings => {
  const data = localStorage.getItem(SETTINGS_KEY);
  if (!data) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  }
  return JSON.parse(data);
};

export const saveSettings = (settings: AppSettings): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const clearLocalStorage = (): void => {
  localStorage.removeItem(WORDS_KEY);
  localStorage.removeItem(ATTEMPTS_KEY);
  localStorage.removeItem(SETTINGS_KEY);
};
