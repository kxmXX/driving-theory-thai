import { Question, Category, QuizMode, UserSession } from "@/types";
import questionsData from "../../data/questions.json";

const ALL_QUESTIONS: Question[] = questionsData as Question[];

function getRecentQuestionIds(session: UserSession, limit: number = 20): Set<string> {
  const ids: string[] = [];
  for (const s of session.recentSessions) {
    ids.push(...s.questionIds);
    if (ids.length >= limit) break;
  }
  return new Set(ids.slice(0, limit));
}

function getSeenQuestionIds(session: UserSession): Set<string> {
  const ids = new Set<string>();
  for (const cat of Object.values(session.stats.byCategory)) {
    for (const id of cat.seen) ids.add(id);
  }
  return ids;
}

function getMasteredIds(session: UserSession): Set<string> {
  return new Set(session.masteredQuestions);
}

function getWeakPointIds(session: UserSession): Set<string> {
  const counts: Record<string, number> = {};
  for (const id of session.weakPoints) {
    counts[id] = (counts[id] || 0) + 1;
  }
  const result = new Set<string>();
  for (const [id, count] of Object.entries(counts)) {
    if (count >= 2) result.add(id);
  }
  return result;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function weightedDraw(pool: Question[], weights: Map<string, number>, count: number): Question[] {
  const available = [...pool];
  const selected: Question[] = [];

  while (selected.length < count && available.length > 0) {
    const totalWeight = available.reduce((sum, q) => sum + (weights.get(q.id) || 1), 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < available.length; i++) {
      const w = weights.get(available[i].id) || 1;
      random -= w;
      if (random <= 0) {
        selected.push(available[i]);
        available.splice(i, 1);
        break;
      }
    }
  }

  return selected;
}

export function drawQuestions(
  count: number,
  mode: QuizMode,
  categoryFilter?: Category,
  session?: UserSession
): Question[] {
  let pool = categoryFilter
    ? ALL_QUESTIONS.filter((q) => q.category === categoryFilter)
    : [...ALL_QUESTIONS];

  if (mode === "REVIEW" && session) {
    const weakIds = getWeakPointIds(session);
    pool = pool.filter((q) => weakIds.has(q.id));
    if (pool.length === 0) {
      // Fallback: if no weak points, return unseen questions
      const seen = getSeenQuestionIds(session);
      pool = ALL_QUESTIONS.filter((q) => !seen.has(q.id));
    }
    return shuffleArray(pool).slice(0, count);
  }

  if (mode === "BLITZ") {
    return shuffleArray(pool).slice(0, count);
  }

  if (!session) {
    return shuffleArray(pool).slice(0, count);
  }

  const recentIds = getRecentQuestionIds(session, 20);
  const seenIds = getSeenQuestionIds(session);
  const weakIds = getWeakPointIds(session);
  const masteredIds = getMasteredIds(session);

  const weights = new Map<string, number>();

  for (const q of pool) {
    let weight = 1;

    // 1. Poids 0.1 pour questions vues dans les 20 dernières
    if (recentIds.has(q.id)) {
      weight *= 0.1;
    }

    // 2. Poids x2 pour questions jamais vues
    if (!seenIds.has(q.id)) {
      weight *= 2;
    }

    // 3. Poids x3 pour weakPoints
    if (weakIds.has(q.id)) {
      weight *= 3;
    }

    // 4. Poids 0.2 pour masteredQuestions sauf en mode REVIEW
    if (masteredIds.has(q.id) && mode !== "REVIEW") {
      weight *= 0.2;
    }

    weights.set(q.id, weight);
  }

  // 5. Distribution équilibrée par catégorie en mode EXAM
  if (mode === "EXAM" && !categoryFilter) {
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
    const perCategory = Math.floor(count / categories.length);
    const remainder = count % categories.length;

    const selected: Question[] = [];
    const selectedIds = new Set<string>();

    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i];
      const catCount = perCategory + (i < remainder ? 1 : 0);
      const catPool = pool.filter((q) => q.category === cat && !selectedIds.has(q.id));
      const catWeights = new Map<string, number>();
      for (const q of catPool) catWeights.set(q.id, weights.get(q.id) || 1);
      const drawn = weightedDraw(catPool, catWeights, catCount);
      for (const q of drawn) {
        selected.push(q);
        selectedIds.add(q.id);
      }
    }

    // Fill any remaining slots if categories didn't have enough
    if (selected.length < count) {
      const remaining = pool.filter((q) => !selectedIds.has(q.id));
      const remWeights = new Map<string, number>();
      for (const q of remaining) remWeights.set(q.id, weights.get(q.id) || 1);
      const extra = weightedDraw(remaining, remWeights, count - selected.length);
      selected.push(...extra);
    }

    return shuffleArray(selected);
  }

  // 6. Zéro répétition dans la même session -> handled by weightedDraw removing selected items
  return weightedDraw(pool, weights, count);
}

export function getQuestionsByIds(ids: string[]): Question[] {
  const map = new Map(ALL_QUESTIONS.map((q) => [q.id, q]));
  return ids.map((id) => map.get(id)).filter((q): q is Question => q !== undefined);
}

export function getCategoryLabel(category: Category): string {
  const labels: Record<Category, string> = {
    road_signs: "Road Signs",
    traffic_rules: "Traffic Rules",
    speed_limits: "Speed Limits",
    alcohol_drugs: "Alcohol & Drugs",
    documents: "Documents",
    safety_distances: "Safety Distances",
    motorcycle: "Motorcycle",
    emergency: "Emergency",
  };
  return labels[category];
}

export function getCategoryColor(category: Category): string {
  const colors: Record<Category, string> = {
    road_signs: "#2563EB",
    traffic_rules: "#059669",
    speed_limits: "#DC2626",
    alcohol_drugs: "#7C3AED",
    documents: "#D97706",
    safety_distances: "#0891B2",
    motorcycle: "#DB2777",
    emergency: "#EA580C",
  };
  return colors[category];
}
