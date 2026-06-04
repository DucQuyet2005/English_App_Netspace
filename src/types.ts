/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Word {
  id: string;
  word: string;
  ipa: string;
  meaning: string;
  example: string;
  topic: string; // 'Gia đình' | 'Công việc' | 'Du lịch' | 'IELTS'
  learned: boolean; // Trạng thái đã thuộc hay chưa thuộc
  box: number; // Hộp ghi nhớ (1-5) để áp dụng thuật toán Spaced Repetition đơn giản
  nextReviewDate: string; // ISO String ngày tiếp theo cần ôn tập
  createdAt: string;
}

export interface QuizAttempt {
  id: string;
  date: string; // Định dạng hiển thị hoặc ISO string
  score: number; // Điểm số tính trên thang 100 hoặc số lượng câu đúng
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  duration: number; // Thời gian làm bài tính bằng giây
  topic: string; // Chủ đề làm quiz hoặc 'Hỗn hợp'
}

export interface AppSettings {
  darkMode: boolean;
  // UI theme: 'normal' is the app's default appearance, 'light' forces light palette,
  // 'dark' forces dark palette.
  theme?: 'normal' | 'light' | 'dark';
  defaultQuizSize: number; // 5, 10, 15, 20
  dailyGoal: number; // Số từ cần học mỗi ngày
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  passwordHash: string;
  createdAt: string;
}

export type TabType = 'dashboard' | 'vocabulary' | 'flashcard' | 'quiz' | 'stats' | 'settings';
