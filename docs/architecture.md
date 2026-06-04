# Architecture - Xây như thế nào?

Kiến trúc của LingoFlow dựa trên **React + TypeScript** với **Local Storage** làm backend, tối ưu cho hiệu suất và độ đơn giản.

## 1. Stack Công Nghệ

### Frontend

- **React 19**: UI framework, hooks cho state management
- **TypeScript 5.8**: Type safety, better IDE support
- **Vite 6.2**: Build tool, fast HMR
- **Tailwind CSS 4.1**: Utility-first CSS framework
- **Lucide React 0.546**: Icon library

### Styling & UI

- **@tailwindcss/vite**: Tailwind CSS plugin cho Vite
- **Tailwind CSS**: Responsive design, dark mode support
- **Lucide React**: Icons (Menu, Search, Settings, etc.)
- **Motion 12.23**: Smooth animations (nếu cần)

### State Management

- **React Context API**: Centralized state (AppContext)
- **useState**: Local component state
- **useEffect**: Side effects (load, save data)

### Storage

- **Local Storage API**: Persist dữ liệu trên client
- **JSON serialization**: Convert data ↔ string

### Build & DevOps

- **Express.js**: Backend server (minimal, future-proofing)
- **Vite Preview**: Local server
- **dotenv**: Environment variables (.env.local)

### API

- **Google Gemini API**: (in dependencies, for future features)

## 2. Cấu Trúc Dự Án

```
English_App_Netspace/
├── src/
│   ├── App.tsx                 # Root component
│   ├── AppContext.tsx          # Global state (words, attempts, settings)
│   ├── main.tsx                # Entry point
│   ├── index.css               # Global styles
│   ├── types.ts                # TypeScript interfaces
│   ├── components/
│   │   ├── Sidebar.tsx         # Left navigation (Desktop)
│   │   ├── TopBar.tsx          # Header with search
│   │   ├── MobileNav.tsx       # Bottom navigation (Mobile)
│   ├── pages/
│   │   ├── Dashboard.tsx       # Home page
│   │   ├── Vocabulary.tsx      # Word management
│   │   ├── FlashcardsPage.tsx  # Flashcard learning
│   │   ├── QuizPage.tsx        # Quiz mode
│   │   ├── StatsPage.tsx       # Statistics
│   │   ├── SettingsPage.tsx    # Settings & data management
│   └── services/
│       └── storageService.ts   # LocalStorage operations
├── docs/
│   ├── spec.md                 # Feature specification
│   ├── architecture.md         # This file
│   ├── changelog.md            # Change history
├── vite.config.ts              # Vite config
├── tsconfig.json               # TypeScript config
├── tailwind.config.js          # Tailwind CSS config
├── package.json                # Dependencies
└── index.html                  # HTML entry
```

## 3. State Management (AppContext)

### Context Structure

```typescript
interface AppContextType {
  // State
  words: Word[];
  attempts: QuizAttempt[];
  settings: AppSettings;
  activeTab: TabType;

  // Actions
  setActiveTab(tab: TabType): void;
  addWord(wordData): void;
  updateWord(word: Word): void;
  deleteWord(id: string): void;
  addAttempt(correct, total, duration, topic): void;
  updateSettings(settings): void;
  toggleWordLearned(id: string): void;
  resetData(): void;
  exportData(): void;
  importData(jsonData: string): void;
}
```

### Data Flow

```
App (Root)
  ↓
AppProvider (Context)
  ↓
AppContent (Consumer)
  ├── Sidebar
  ├── TopBar
  ├── Pages (Dashboard, Vocabulary, FlashcardsPage, etc.)
  └── MobileNav
```

### Persistence

```
Component → Action → AppContext → setWords/setAttempts/setSettings
  ↓                                      ↓
Update UI                         saveWords/saveAttempts/saveSettings
                                              ↓
                                      Local Storage
```

## 4. Component Architecture

### Page Components

#### Dashboard (`Dashboard.tsx`)

- **Tujuan**: Overview, quick stats
- **Props**: None (reads from context)
- **Renders**:
  - Total words, learned words count
  - Words due for review
  - Recent quiz attempts
  - Quick actions (Add word, Take quiz, etc.)

#### Vocabulary (`Vocabulary.tsx`)

- **Tujuan**: Manage words
- **Props**: None
- **State**:
  - `searchTerm`: Filter by word/meaning
  - `selectedTopic`: Filter by topic
  - `learnedFilter`: Show all/learned/not-learned
  - `sortBy`: Sort by date, name, status
- **Features**:
  - Add word form
  - Word list (table or cards)
  - Edit/delete modals
  - Search & filter
  - Responsive (table on desktop, cards on mobile)

#### FlashcardsPage (`FlashcardsPage.tsx`)

- **Tujuan**: Learn with spaced repetition
- **State**:
  - `currentIndex`: Current flashcard
  - `isFlipped`: Show front or back
  - `dueCards`: Cards to review today
- **Features**:
  - Flip animation
  - Mark as "Learned" / "Not learned"
  - Progress indicator
  - Auto-advance to next card

#### QuizPage (`QuizPage.tsx`)

- **Tujuan**: Practice with MCQ
- **State**:
  - `currentQuestion`: Index of current question
  - `selectedAnswers`: User's choices
  - `quizSession`: Current quiz data
- **Features**:
  - Generate MCQ from words
  - Show 4 options (1 correct + 3 distractors)
  - Shuffle options
  - Instant feedback (correct/incorrect)
  - Final score and summary
  - Save attempt to attempts[]

#### StatsPage (`StatsPage.tsx`)

- **Tujuan**: Visualize learning progress
- **Renders**:
  - Total words count (pie chart)
  - Learned vs. to-learn ratio
  - Words by box distribution
  - Quiz accuracy trend (line chart)
  - Best/worst topics
  - Worst words (low accuracy)

#### SettingsPage (`SettingsPage.tsx`)

- **Tujuan**: Configure app & manage data
- **Features**:
  - Dark mode toggle
  - Font size selector
  - Quiz count setting
  - Export data (download JSON)
  - Import data (upload JSON)
  - Reset data confirmation dialog

### UI Components

#### Sidebar (`Sidebar.tsx`)

- **Desktop only** (hidden on mobile via responsive classes)
- Navigation links (Dashboard, Vocabulary, Flashcards, etc.)
- Active indicator
- Fixed width (288px = `md:w-72`)

#### TopBar (`TopBar.tsx`)

- **Header**
- Logo/Title
- Search input (passes to Vocabulary page)
- User menu (Settings, Dark mode toggle)
- Responsive: hamburger on mobile

#### MobileNav (`MobileNav.tsx`)

- **Mobile only** (hidden on desktop)
- Bottom navigation (fixed)
- Icons + labels for main pages
- Active indicator
- Tab-based navigation

## 5. Storage Service

### API

```typescript
// Read operations
getWords(): Word[]
getAttempts(): QuizAttempt[]
getSettings(): AppSettings

// Write operations
saveWords(words: Word[]): void
saveAttempts(attempts: QuizAttempt[]): void
saveSettings(settings: AppSettings): void

// Data management
clearLocalStorage(): void
exportData(): JSON

// Constants
INITIAL_WORDS: Word[]
INITIAL_ATTEMPTS: QuizAttempt[]
DEFAULT_SETTINGS: AppSettings
```

### Implementation Details

- Uses `localStorage.getItem()` / `localStorage.setItem()`
- Keys: `lingoflow_words`, `lingoflow_attempts`, `lingoflow_settings`
- Fallback to initial data if not found
- JSON serialization/deserialization

## 6. Responsive Design

### Breakpoints (Tailwind)

- **Mobile**: < 768px (`sm:`)
- **Tablet**: 768px - 1024px (`md:`)
- **Desktop**: > 1024px (default)

### Layout

```
DESKTOP:
┌─────────────────────────────────┐
│          TopBar                 │
├──────────────┬──────────────────┤
│   Sidebar    │                  │
│   (288px)    │     Main Page    │
│              │                  │
└──────────────┴──────────────────┘

MOBILE:
┌──────────────────────────┐
│      TopBar              │
├──────────────────────────┤
│                          │
│       Main Page          │
│                          │
│     (scrollable)         │
├──────────────────────────┤
│     MobileNav (fixed)    │
└──────────────────────────┘
```

### Responsive Classes

- Sidebar: `md:pl-72` (Desktop only)
- MobileNav: `pb-24 md:pb-0` (Fixed height on mobile)
- Grid layouts: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Typography: `text-sm md:text-base lg:text-lg`

## 7. Dark Mode

### Implementation

- Tailwind's `dark:` class strategy
- Toggle via Settings page
- Saved to `AppSettings.darkMode`
- Applied to `<html>` element: `document.documentElement.classList.add('dark')`
- CSS variables adapt automatically

### Colors

- Light: `bg-slate-50`, `text-slate-800`
- Dark: `bg-slate-900`, `text-slate-100`

## 8. Spaced Repetition Logic

### Leitner System (5-Box Model)

```
Box 1 → Review in 1 day (new/failed words)
Box 2 → Review in 2 days
Box 3 → Review in 4 days
Box 4 → Review in 7 days
Box 5 → Review in 14 days (mastered)
```

### Algorithm

```typescript
if (word.learned) {
  // Move up: box++ (max 5), increase review interval
  nextBox = Math.min(5, word.box + 1);
  nextReviewDays = Math.pow(2, nextBox - 1);
} else {
  // Move down: box = 1, review immediately
  nextBox = 1;
  nextReviewDate = new Date(); // Today
}
```

### Filtering

Only show flashcards where `nextReviewDate <= today()`

## 9. Quiz Generation

### Algorithm

1. Select random words from target pool (all/topic/due)
2. For each word:
   - Correct answer = word.meaning
   - 3 distractors = random meanings from other words
   - Shuffle 4 options
3. User selects answer
4. Check correctness, calculate score
5. Save attempt with (correct, total, duration, topic)
6. NO word status update from quiz (only from flashcard learning)

## 10. Type Definitions (`types.ts`)

```typescript
export interface Word {
  id: string;
  word: string;
  ipa: string;
  meaning: string;
  example: string;
  topic: string;
  learned: boolean;
  box: number; // 1-5
  nextReviewDate: string; // ISO8601
  createdAt: string; // ISO8601
}

export interface QuizAttempt {
  id: string;
  correct: number;
  total: number;
  duration: number;
  topic: string;
  timestamp: string; // ISO8601
}

export interface AppSettings {
  darkMode: boolean;
  quizCount: number;
  shuffleQuestions: boolean;
  fontSize: "small" | "medium" | "large";
}

export type TabType =
  | "dashboard"
  | "vocabulary"
  | "flashcard"
  | "quiz"
  | "stats"
  | "settings";
```

## 11. Build & Deploy

### Development

```bash
npm run dev      # Start Vite dev server (port 3000)
npm run lint     # TypeScript type check
```

### Production

```bash
npm run build    # Vite build (output: dist/)
npm run preview  # Preview production build locally
```

### Environment

- `.env.local` for `GEMINI_API_KEY` (future use)

## 12. Performance Considerations

### Optimization

- **Code Splitting**: Vite automatically splits chunks
- **Lazy Loading**: Pages can be lazy-loaded
- **Memoization**: `useMemo` for expensive calculations (if needed)
- **Local Storage**: Fast access (no network latency)
- **Debounce**: Search input debounced
- **Responsive Images**: Use webp if needed

### Metrics to Monitor

- FCP (First Contentful Paint) < 1s
- LCP (Largest Contentful Paint) < 2.5s
- CLS (Cumulative Layout Shift) < 0.1
- TTI (Time to Interactive) < 3.5s

## 13. Future Architecture Plans

### Backend Integration (v2.0)

```
Frontend (React) → API Gateway → Backend (Node.js + Database)
                                    ├── Word Service
                                    ├── Quiz Service
                                    ├── Stats Service
                                    └── Auth Service
```

### Database Schema

```sql
users:
  id (PK), email, passwordHash, createdAt

words:
  id (PK), userId (FK), word, meaning, topic, learned, box, nextReviewDate, createdAt

attempts:
  id (PK), userId (FK), correct, total, duration, topic, timestamp

settings:
  userId (PK/FK), darkMode, quizCount, fontSize
```

### Real-time Sync

- WebSocket for live updates
- Conflict resolution strategy (last-write-wins)
- Offline-first approach with eventual consistency

## 14. Security Considerations

### Current (Local-First)

- No authentication needed
- All data stored locally on client device
- No data sent to server (except future Gemini API)

### Future

- User authentication (JWT)
- HTTPS for all API calls
- CORS policy enforcement
- Rate limiting on Gemini API

## 15. Accessibility

### WCAG 2.1 Compliance

- Semantic HTML (`<button>`, `<nav>`, `<main>`, etc.)
- ARIA labels where needed (`aria-label`, `aria-expanded`)
- Keyboard navigation (Tab, Enter, Escape)
- Color contrast ratios ≥ 4.5:1
- Focus indicators
- Responsive text sizing

### Keyboard Shortcuts (Future)

- `Ctrl+K` / `Cmd+K`: Search
- `Ctrl+N` / `Cmd+N`: New word
- `Space`: Flip flashcard / Next question
- `1-4`: Select quiz answer
- `Esc`: Close modals
