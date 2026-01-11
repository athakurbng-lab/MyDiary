// Database Schema Types
export interface DiaryEntry {
  id: string;
  date: string; // ISO date
  originalText: string;
  paraphrasedText: string;
  finalText: string; // User-approved version
  imageUrl: string;
  imagePrompt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Learning {
  id: string;
  diaryId: string; // Foreign key
  text: string;
  category: LearningCategory;
  createdAt: string;
  updatedAt: string;
}

export type LearningCategory =
  | 'work_career'
  | 'studies_academics'
  | 'personal_life'
  | 'emotional_mental_health'
  | 'habits_discipline'
  | 'health_fitness'
  | 'communication_relationships'
  | 'time_management'
  | 'productivity'
  | 'finance_responsibility'
  | 'decision_making'
  | 'mistakes_to_avoid'
  | 'values_ethics'
  | 'self_awareness'
  | 'lifestyle'
  | 'other';

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string;
  reminderTime: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProgressScore {
  id: string;
  date: string;
  diaryScore: number; // +1, 0, -1
  taskScore: number; // +1, 0, -1
  cumulativeDiaryScore: number;
  cumulativeTaskScore: number;
  createdAt: string;
}

export interface Suggestion {
  id: string;
  diaryId: string;
  whatWentWell: string;
  whatWentWrong: string;
  whyItFailed: string;
  improvements: string;
  createdAt: string;
}

// SQL Schema
export const CREATE_TABLES_SQL = `
  CREATE TABLE IF NOT EXISTS diary_entries (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    originalText TEXT NOT NULL,
    paraphrasedText TEXT NOT NULL,
    finalText TEXT NOT NULL,
    imageUrl TEXT,
    imagePrompt TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS learnings (
    id TEXT PRIMARY KEY,
    diaryId TEXT NOT NULL,
    text TEXT NOT NULL,
    category TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (diaryId) REFERENCES diary_entries(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    deadline TEXT NOT NULL,
    reminderTime TEXT,
    completed INTEGER DEFAULT 0,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS progress_scores (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL UNIQUE,
    diaryScore INTEGER NOT NULL,
    taskScore INTEGER NOT NULL,
    cumulativeDiaryScore INTEGER NOT NULL,
    cumulativeTaskScore INTEGER NOT NULL,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS suggestions (
    id TEXT PRIMARY KEY,
    diaryId TEXT NOT NULL,
    whatWentWell TEXT,
    whatWentWrong TEXT,
    whyItFailed TEXT,
    improvements TEXT,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (diaryId) REFERENCES diary_entries(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_diary_date ON diary_entries(date);
  CREATE INDEX IF NOT EXISTS idx_learning_diary ON learnings(diaryId);
  CREATE INDEX IF NOT EXISTS idx_learning_category ON learnings(category);
  CREATE INDEX IF NOT EXISTS idx_task_deadline ON tasks(deadline);
  CREATE INDEX IF NOT EXISTS idx_progress_date ON progress_scores(date);
`;
