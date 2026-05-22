import { Question, Category, QuizMode, UserSession, QuestionHistory } from "@/types";
import questionsData from "../../data/questions.json";

const ALL = questionsData as Question[];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function weighted(pool: Question[], w: Map<string, number>, count: number): Question[] {
  const avail = [...pool];
  const out: Question[] = [];
  while (out.length < count && avail.length > 0) {
    const tw = avail.reduce((s, q) => s + (w.get(q.id) || 1), 0);
    let r = Math.random() * tw;
    for (let i = 0; i < avail.length; i++) {
      r -= w.get(avail[i].id) || 1;
      if (r <= 0) {
        out.push(avail[i]);
        avail.splice(i, 1);
        break;
      }
    }
  }
  return out;
}

/** Build a set of question IDs from the last N sessions */
function recentSessionIds(s: UserSession, n = 3): Set<string> {
  const ids = new Set<string>();
  for (const ses of s.recentSessions.slice(0, n)) {
    for (const id of ses.questionIds) ids.add(id);
  }
  return ids;
}

/** Compute learning weight for a question based on its history */
function computeWeight(
  q: Question,
  history: QuestionHistory | undefined,
  mode: QuizMode,
  recentIds: Set<string>
): number {
  // Default: never seen
  if (!history || history.seenCount === 0) {
    let w = 10;
    if (recentIds.has(q.id)) w *= 0.3;
    return w;
  }

  const daysSinceSeen = history.lastSeenDate
    ? (Date.now() - new Date(history.lastSeenDate).getTime()) / (1000 * 60 * 60 * 24)
    : 999;

  // Base weight from mastery streak
  let weight: number;
  const streak = history.currentStreak;

  if (streak <= -2) {
    weight = 8; // Weak: missed 2+ times in a row → high priority
  } else if (streak === -1) {
    weight = 5; // Missed once → medium-high priority
  } else if (streak === 1) {
    weight = 3; // Correct once → needs reinforcement
  } else if (streak === 2) {
    weight = 1.5; // Correct twice → consolidation phase
  } else if (streak >= 3) {
    weight = 0.3; // Mastered → very low priority
  } else {
    weight = 10; // No history (should not happen)
  }

  // Cooldown: reduce weight for recently seen questions
  if (daysSinceSeen < 1) {
    weight *= 0.05; // Seen today → almost never
  } else if (daysSinceSeen < 2) {
    weight *= 0.2; // Seen yesterday → rare
  } else if (daysSinceSeen < 7) {
    weight *= 0.6; // Seen this week → moderate
  } else if (daysSinceSeen < 14) {
    weight *= 1.0; // 1-2 weeks → normal
  } else {
    weight *= 1.3; // 2+ weeks → slight boost (spaced repetition)
  }

  // Recent session penalty
  if (recentIds.has(q.id)) {
    weight *= 0.2;
  }

  // Mode adjustments
  if (mode === "EXAM") {
    // Exam: avoid mastered questions, favor unseen/weak
    if (streak >= 3) weight *= 0.1;
    if (!history || history.seenCount === 0) weight *= 1.5;
  } else if (mode === "TRAINING" || mode === "THEMATIC") {
    // Training: strong focus on weak questions, but still show new ones
    if (streak <= -1) weight *= 1.3;
  } else if (mode === "BLITZ") {
    // Blitz: variety is key, avoid immediate repeats
    if (recentIds.has(q.id)) weight *= 0.1;
  }

  return weight;
}

export function drawQuestions(
  count: number, mode: QuizMode, catFilter?: Category, session?: UserSession
): Question[] {
  let pool = catFilter ? ALL.filter((q) => q.category === catFilter) : [...ALL];

  // No session → random shuffle
  if (!session) return shuffle(pool).slice(0, count);

  const recentIds = recentSessionIds(session, 3);
  const history = session.questionHistory || {};

  // REVIEW mode: only weak questions, fallback to unseen
  if (mode === "REVIEW") {
    const weak = new Set(session.weakPoints);
    let reviewPool = pool.filter((q) => weak.has(q.id));
    if (reviewPool.length === 0) {
      reviewPool = pool.filter((q) => !history[q.id] || history[q.id].seenCount === 0);
    }
    if (reviewPool.length === 0) {
      reviewPool = pool;
    }
    const w = new Map<string, number>();
    for (const q of reviewPool) {
      w.set(q.id, computeWeight(q, history[q.id], mode, recentIds));
    }
    return weighted(reviewPool, w, count);
  }

  // Build weights for all questions in pool
  const weights = new Map<string, number>();
  for (const q of pool) {
    weights.set(q.id, computeWeight(q, history[q.id], mode, recentIds));
  }

  // EXAM mode: balanced category distribution with weights
  if (mode === "EXAM" && !catFilter) {
    const cats: Category[] = [
      "road_signs", "traffic_rules", "speed_limits", "alcohol_drugs",
      "documents", "safety_distances", "motorcycle", "emergency",
    ];
    const per = Math.floor(count / cats.length);
    const rem = count % cats.length;
    const out: Question[] = [];
    const picked = new Set<string>();

    for (let i = 0; i < cats.length; i++) {
      const n = per + (i < rem ? 1 : 0);
      const catPool = pool.filter((q) => q.category === cats[i] && !picked.has(q.id));
      const catWeights = new Map<string, number>();
      for (const q of catPool) catWeights.set(q.id, weights.get(q.id) || 1);
      const drawn = weighted(catPool, catWeights, n);
      for (const q of drawn) {
        out.push(q);
        picked.add(q.id);
      }
    }

    if (out.length < count) {
      const rest = pool.filter((q) => !picked.has(q.id));
      const restWeights = new Map<string, number>();
      for (const q of rest) restWeights.set(q.id, weights.get(q.id) || 1);
      out.push(...weighted(rest, restWeights, count - out.length));
    }
    return shuffle(out);
  }

  // Other modes: pure weighted draw
  return weighted(pool, weights, count);
}

export function getQuestionsByIds(ids: string[]): Question[] {
  const map = new Map(ALL.map((q) => [q.id, q]));
  return ids.map((id) => map.get(id)).filter((q): q is Question => q !== undefined);
}

export function getCategoryLabel(c: Category): string {
  const labels: Record<Category, string> = {
    road_signs: "Road Signs", traffic_rules: "Traffic Rules",
    speed_limits: "Speed Limits", alcohol_drugs: "Alcohol & Drugs",
    documents: "Documents", safety_distances: "Safety Distances",
    motorcycle: "Motorcycle", emergency: "Emergency",
  };
  return labels[c];
}

export function getCategoryColor(c: Category): string {
  const colors: Record<Category, string> = {
    road_signs: "#2563EB", traffic_rules: "#059669",
    speed_limits: "#DC2626", alcohol_drugs: "#7C3AED",
    documents: "#D97706", safety_distances: "#0891B2",
    motorcycle: "#DB2777", emergency: "#EA580C",
  };
  return colors[c];
}

// ═══════════════════════════════════════════════════════════════════
// ULTIMATE MODE – Adaptive queue with wrong-answer reinsertion
// ═══════════════════════════════════════════════════════════════════

export interface UltimateQuestionState {
  question: Question;
  level: number;       // 0=new, 5=mastered
  wrongCount: number;  // wrong answers this session
  correctStreak: number;
  lastSeenAt: number;  // global question index when last seen
}

const ULTIMATE_COOLDOWN_IMMEDIATE = 3;   // can't reappear within N questions
const ULTIMATE_COOLDOWN_SHORT = 8;       // reduced weight within N questions

/**
 * Initialize the ultimate session pool from all questions.
 * Shuffles to avoid category clumping, all start at level 0.
 */
export function initUltimatePool(): UltimateQuestionState[] {
  const shuffled = shuffle([...ALL]);
  return shuffled.map((q) => ({
    question: q,
    level: 0,
    wrongCount: 0,
    correctStreak: 0,
    lastSeenAt: -999,
  }));
}

/**
 * Pick the next question using adaptive weighting.
 * Questions you got wrong get massive priority boost → reinserted soon.
 * Mastered questions (level 5) almost never appear.
 */
export function pickUltimateQuestion(
  pool: UltimateQuestionState[],
  globalIndex: number
): { index: number; question: Question } {
  // Compute weights
  const weights: number[] = pool.map((state, i) => {
    if (state.lastSeenAt === globalIndex) return 0; // just answered, can't repeat

    // Base weight by mastery level
    const baseByLevel = [20, 15, 8, 4, 1.5, 0.3];
    let w = baseByLevel[Math.min(state.level, 5)] || 0.3;

    // Wrong boost: wrong answers spike hard
    if (state.wrongCount > 0) {
      w *= 1 + state.wrongCount * 2.5; // 1 wrong → ×3.5, 2 wrong → ×6
    }

    // Cooldown: questions seen recently are suppressed
    const distance = globalIndex - state.lastSeenAt;
    if (distance < ULTIMATE_COOLDOWN_IMMEDIATE) {
      w *= 0.01; // nearly blocked
    } else if (distance < ULTIMATE_COOLDOWN_SHORT) {
      w *= 0.15; // heavily reduced
    } else if (distance < 20) {
      w *= 0.5;
    }

    // Questions never seen in this session get a small discovery bonus
    if (state.level === 0 && state.lastSeenAt < 0) {
      w *= 1.3;
    }

    return w;
  });

  // Weighted random selection
  const totalWeight = weights.reduce((s, w) => s + w, 0);
  let r = Math.random() * totalWeight;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0 && weights[i] > 0) {
      return { index: i, question: pool[i].question };
    }
  }

  // Fallback: pick first available
  for (let i = 0; i < weights.length; i++) {
    if (weights[i] > 0) {
      return { index: i, question: pool[i].question };
    }
  }

  // Should never happen — reset lastSeenAt for all and retry
  for (const s of pool) s.lastSeenAt = -999;
  return { index: 0, question: pool[0].question };
}

/**
 * Update a question's state after the user answers.
 */
export function updateUltimateState(
  state: UltimateQuestionState,
  wasCorrect: boolean,
  globalIndex: number
): void {
  state.lastSeenAt = globalIndex;
  if (wasCorrect) {
    state.level = Math.min(5, state.level + 1);
    state.correctStreak++;
    // Gradual wrongCount decay: 3 correct in a row clears one wrong strike
    if (state.correctStreak >= 3 && state.wrongCount > 0) {
      state.wrongCount--;
      state.correctStreak = 0;
    }
  } else {
    state.level = Math.max(0, state.level - 1);
    state.wrongCount++;
    state.correctStreak = 0;
  }
}

/**
 * Get session progress: % of questions at level 3+
 */
export function getUltimateProgress(pool: UltimateQuestionState[]): {
  mastered: number;
  learning: number;
  untouched: number;
  total: number;
} {
  const mastered = pool.filter((s) => s.level >= 4).length;
  const learning = pool.filter((s) => s.level >= 1 && s.level <= 3).length;
  const untouched = pool.filter((s) => s.level === 0 && s.lastSeenAt < 0).length;
  return { mastered, learning, untouched, total: pool.length };
}
