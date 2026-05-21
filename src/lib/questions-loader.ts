import { Question, Category } from "@/types";

let cache: Record<string, Question[]> = {};

export async function loadQuestions(category?: Category): Promise<Question[]> {
  const key = category || "all";
  if (cache[key]) return cache[key];

  const res = await fetch(`/data/questions/${key}.json`);
  if (!res.ok) throw new Error(`Failed to load questions: ${res.status}`);
  const data: Question[] = await res.json();
  cache[key] = data;
  return data;
}

export async function loadAllQuestions(): Promise<Question[]> {
  return loadQuestions();
}

export function clearQuestionCache() {
  cache = {};
}
