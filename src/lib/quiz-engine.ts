import { Question, Category, QuizMode, UserSession } from "@/types";
import questionsData from "../../data/questions.json";

const ALL = questionsData as Question[];

function recentIds(s: UserSession, limit = 20): Set<string> {
  const ids: string[] = [];
  for (const ses of s.recentSessions) {
    ids.push(...ses.questionIds);
    if (ids.length >= limit) break;
  }
  return new Set(ids.slice(0, limit));
}

function seenIds(s: UserSession): Set<string> {
  const set = new Set<string>();
  for (const c of Object.values(s.stats.byCategory)) {
    for (const id of c.seen) set.add(id);
  }
  return set;
}

function weakIds(s: UserSession): Set<string> {
  const counts: Record<string, number> = {};
  for (const id of s.weakPoints) counts[id] = (counts[id] || 0) + 1;
  const res = new Set<string>();
  for (const [id, n] of Object.entries(counts)) if (n >= 2) res.add(id);
  return res;
}

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

export function drawQuestions(
  count: number, mode: QuizMode, catFilter?: Category, session?: UserSession
): Question[] {
  let pool = catFilter ? ALL.filter((q) => q.category === catFilter) : [...ALL];

  if (mode === "REVIEW" && session) {
    const wk = weakIds(session);
    pool = pool.filter((q) => wk.has(q.id));
    if (pool.length === 0) {
      const seen = seenIds(session);
      pool = ALL.filter((q) => !seen.has(q.id));
    }
    return shuffle(pool).slice(0, count);
  }

  if (mode === "BLITZ" || !session) return shuffle(pool).slice(0, count);

  const recent = recentIds(session);
  const seen = seenIds(session);
  const weak = weakIds(session);
  const mastered = new Set(session.masteredQuestions);
  const w = new Map<string, number>();

  for (const q of pool) {
    let weight = 1;
    if (recent.has(q.id)) weight *= 0.1;
    if (!seen.has(q.id)) weight *= 2;
    if (weak.has(q.id)) weight *= 3;
    if (mastered.has(q.id) && mode !== "REVIEW") weight *= 0.2;
    w.set(q.id, weight);
  }

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
      const p = pool.filter((q) => q.category === cats[i] && !picked.has(q.id));
      const cw = new Map<string, number>();
      for (const q of p) cw.set(q.id, w.get(q.id) || 1);
      const drawn = weighted(p, cw, n);
      for (const q of drawn) {
        out.push(q);
        picked.add(q.id);
      }
    }

    if (out.length < count) {
      const rest = pool.filter((q) => !picked.has(q.id));
      const rw = new Map<string, number>();
      for (const q of rest) rw.set(q.id, w.get(q.id) || 1);
      out.push(...weighted(rest, rw, count - out.length));
    }
    return shuffle(out);
  }

  return weighted(pool, w, count);
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
