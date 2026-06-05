// This file is kept for reference and backward compatibility.
// The primary data layer has moved to apiService.ts which communicates
// with the Express + MongoDB backend.

import { AppSettings } from '../types';

export const DEFAULT_SETTINGS: AppSettings = {
  darkMode: false,
  theme: 'normal',
  defaultQuizSize: 10,
  dailyGoal: 5,
};
