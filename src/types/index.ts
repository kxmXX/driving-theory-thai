export type Category =
  | "road_signs"
  | "traffic_rules"
  | "speed_limits"
  | "alcohol_drugs"
  | "documents"
  | "safety_distances"
  | "motorcycle"
  | "emergency";

export type Difficulty = 1 | 2 | 3;

export interface Question {
  id: string;
  category: Category;
  difficulty: Difficulty;
  question_en: string;
  question_th: string;
  options: string[];
  options_th: string[];
  correct: number;
  explanation_en: string;
  explanation_th: string;
  /** Explanations for wrong answers: map option index → why it's wrong */
  wrong_explanations_en?: Record<number, string>;
  wrong_explanations_th?: Record<number, string>;
  image: string | null;
}

export type QuizMode = "EXAM" | "TRAINING" | "THEMATIC" | "REVIEW" | "BLITZ" | "FLASHCARD";

export interface CategoryStats {
  seen: string[];
  correct: string[];
}

export interface RecentSession {
  date: string;
  score: number;
  questionIds: string[];
  mode: QuizMode;
  category?: string;
}

export interface Streak {
  current: number;
  best: number;
  lastActive: string;
}

export interface QuestionHistory {
  seenCount: number;
  correctCount: number;
  wrongCount: number;
  /** Positive = consecutive correct, negative = consecutive wrong */
  currentStreak: number;
  lastSeenDate: string;
}

export interface UserSession {
  sessionId: string;
  stats: {
    byCategory: Record<Category, CategoryStats>;
  };
  recentSessions: RecentSession[];
  weakPoints: string[];
  masteredQuestions: string[];
  streak: Streak;
  /** Per-question history for spaced repetition algorithm */
  questionHistory: Record<string, QuestionHistory>;
}

export interface QuizState {
  mode: QuizMode;
  categoryFilter?: Category;
  questions: Question[];
  currentIndex: number;
  answers: Record<string, number>;
  startTime: string;
  timeRemaining?: number;
  showResults: boolean;
}
