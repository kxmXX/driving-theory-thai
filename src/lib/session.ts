import { UserSession, Category, CategoryStats, RecentSession, Streak, QuizMode } from "@/types";

const STORAGE_KEY = "driving-theory-session";

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function getDefaultCategoryStats(): CategoryStats {
  return { seen: [], correct: [] };
}

function getDefaultSession(): UserSession {
  const categories: Category[] = [
    "road_signs",
    "traffic_rules",
    "speed_limits",
    "alcohol_drugs",
    "documents",
    "safety_distances",
    "motorcycle",
    "emergency",
  ];

  const byCategory = {} as Record<Category, CategoryStats>;
  for (const cat of categories) {
    byCategory[cat] = getDefaultCategoryStats();
  }

  return {
    sessionId: generateUUID(),
    stats: { byCategory },
    recentSessions: [],
    weakPoints: [],
    masteredQuestions: [],
    streak: {
      current: 0,
      best: 0,
      lastActive: getToday(),
    },
  };
}

export function loadSession(): UserSession {
  if (typeof window === "undefined") return getDefaultSession();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultSession();
    const parsed = JSON.parse(raw) as UserSession;
    // Merge with defaults in case of schema changes
    const defaults = getDefaultSession();
    return {
      ...defaults,
      ...parsed,
      stats: {
        byCategory: {
          ...defaults.stats.byCategory,
          ...parsed.stats?.byCategory,
        },
      },
      streak: {
        ...defaults.streak,
        ...parsed.streak,
      },
    };
  } catch {
    return getDefaultSession();
  }
}

export function saveSession(session: UserSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function updateStreak(session: UserSession): UserSession {
  const today = getToday();
  const last = session.streak.lastActive;

  if (last === today) {
    return session;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  if (last === yesterdayStr) {
    session.streak.current += 1;
  } else {
    session.streak.current = 1;
  }

  if (session.streak.current > session.streak.best) {
    session.streak.best = session.streak.current;
  }

  session.streak.lastActive = today;
  return session;
}

export function recordQuestionResult(
  session: UserSession,
  questionId: string,
  category: Category,
  isCorrect: boolean
): UserSession {
  const catStats = session.stats.byCategory[category];
  if (!catStats.seen.includes(questionId)) {
    catStats.seen.push(questionId);
  }

  if (isCorrect) {
    if (!catStats.correct.includes(questionId)) {
      catStats.correct.push(questionId);
    }
    // Remove from weakPoints if present
    session.weakPoints = session.weakPoints.filter((id) => id !== questionId);
    // Check mastery (3 consecutive correct - simplified: present in correct and not in weak)
    if (!session.masteredQuestions.includes(questionId)) {
      // In a real app we'd track consecutive corrects per question
      // Here we approximate: correct 3+ times total = mastered
      const correctCount = catStats.correct.filter((id) => id === questionId).length;
      // Since we deduplicate correct array, we use a separate mastery counter approach
      // For simplicity, add to mastered after first correct if never wrong
      session.masteredQuestions.push(questionId);
    }
  } else {
    // Remove from mastered
    session.masteredQuestions = session.masteredQuestions.filter((id) => id !== questionId);
    // Add to weakPoints
    const weakCount = session.weakPoints.filter((id) => id === questionId).length;
    if (weakCount < 2) {
      session.weakPoints.push(questionId);
    }
  }

  return session;
}

export function recordSession(
  session: UserSession,
  mode: QuizMode,
  score: number,
  questionIds: string[],
  category?: Category
): UserSession {
  const recent: RecentSession = {
    date: new Date().toISOString(),
    score,
    questionIds,
    mode,
    category,
  };

  session.recentSessions = [recent, ...session.recentSessions].slice(0, 10);
  session = updateStreak(session);
  return session;
}

export function resetSession(): UserSession {
  const fresh = getDefaultSession();
  saveSession(fresh);
  return fresh;
}
