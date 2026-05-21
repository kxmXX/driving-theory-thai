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
  correct: number;
  explanation_en: string;
  image: string | null;
}

export type QuizMode = "EXAM" | "TRAINING" | "THEMATIC" | "REVIEW" | "BLITZ";

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

export interface UserSession {
  sessionId: string;
  stats: {
    byCategory: Record<Category, CategoryStats>;
  };
  recentSessions: RecentSession[];
  weakPoints: string[];
  masteredQuestions: string[];
  streak: Streak;
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
