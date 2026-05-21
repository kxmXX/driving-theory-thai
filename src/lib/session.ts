import { UserSession, Category, RecentSession, QuizMode } from "@/types";

const KEY = "driving-theory-session";

function uuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function defaults(): UserSession {
  const cats: Category[] = [
    "road_signs", "traffic_rules", "speed_limits", "alcohol_drugs",
    "documents", "safety_distances", "motorcycle", "emergency",
  ];
  const byCategory = {} as Record<Category, { seen: string[]; correct: string[] }>;
  for (const c of cats) byCategory[c] = { seen: [], correct: [] };

  return {
    sessionId: uuid(),
    stats: { byCategory },
    recentSessions: [],
    weakPoints: [],
    masteredQuestions: [],
    streak: { current: 0, best: 0, lastActive: today() },
  };
}

export function loadSession(): UserSession {
  if (typeof window === "undefined") return defaults();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults();
    const s = JSON.parse(raw) as UserSession;
    const d = defaults();
    return {
      ...d, ...s,
      stats: { byCategory: { ...d.stats.byCategory, ...s.stats?.byCategory } },
      streak: { ...d.streak, ...s.streak },
    };
  } catch {
    return defaults();
  }
}

export function saveSession(s: UserSession): void {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(s));
}

export function updateStreak(s: UserSession): UserSession {
  const t = today();
  if (s.streak.lastActive === t) return s;

  const y = new Date();
  y.setDate(y.getDate() - 1);
  if (s.streak.lastActive === y.toISOString().split("T")[0]) {
    s.streak.current += 1;
  } else {
    s.streak.current = 1;
  }
  if (s.streak.current > s.streak.best) s.streak.best = s.streak.current;
  s.streak.lastActive = t;
  return s;
}

export function recordResult(
  s: UserSession, qid: string, cat: Category, ok: boolean
): UserSession {
  const st = s.stats.byCategory[cat];
  if (!st.seen.includes(qid)) st.seen.push(qid);

  if (ok) {
    if (!st.correct.includes(qid)) st.correct.push(qid);
    s.weakPoints = s.weakPoints.filter((id) => id !== qid);
    if (!s.masteredQuestions.includes(qid)) s.masteredQuestions.push(qid);
  } else {
    s.masteredQuestions = s.masteredQuestions.filter((id) => id !== qid);
    const count = s.weakPoints.filter((id) => id === qid).length;
    if (count < 2) s.weakPoints.push(qid);
  }

  return s;
}

export function recordSession(
  s: UserSession, mode: QuizMode, score: number, qids: string[], cat?: Category
): UserSession {
  s.recentSessions = [{
    date: new Date().toISOString(), score, questionIds: qids, mode, category: cat,
  }, ...s.recentSessions].slice(0, 10);
  return updateStreak(s);
}

export function resetSession(): UserSession {
  const f = defaults();
  saveSession(f);
  return f;
}
