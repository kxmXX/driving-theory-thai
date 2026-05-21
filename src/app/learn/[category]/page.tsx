import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Category } from "@/types";
import { getCategoryLabel, getCategoryColor } from "@/lib/quiz-engine";
import questionsData from "../../../../data/questions.json";

const VALID_CATEGORIES: Category[] = [
  "road_signs",
  "traffic_rules",
  "speed_limits",
  "alcohol_drugs",
  "documents",
  "safety_distances",
  "motorcycle",
  "emergency",
];

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  return VALID_CATEGORIES.map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = category as Category;
  const label = getCategoryLabel(cat);
  return {
    title: `${label} - Study Guide - Thai Driving Theory Test`,
    description: `Learn ${label} for the Thailand driving theory exam`,
  };
}

export default async function LearnCategoryPage({ params }: Props) {
  const { category } = await params;
  const cat = category as Category;
  if (!VALID_CATEGORIES.includes(cat)) {
    notFound();
  }

  const questions = (questionsData as any[]).filter((q) => q.category === cat);

  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div
          className="h-4 w-4 rounded-full"
          style={{ backgroundColor: getCategoryColor(cat) }}
        />
        <h1 className="font-heading text-2xl font-bold">{getCategoryLabel(cat)}</h1>
      </div>

      <Link
        href={`/practice/${cat}/`}
        className="touch-target mb-6 inline-block rounded-xl bg-accent-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
      >
        Practice This Category
      </Link>

      <div className="space-y-4">
        {questions.map((q, i) => (
          <div key={q.id} className="card p-4">
            <div className="mb-2 flex items-center justify-between text-xs text-muted">
              <span>Q{i + 1}</span>
              <span>Difficulty {q.difficulty}</span>
            </div>

            {q.image && (
              <div className="flex justify-center mb-3">
                <img
                  src={`/images/${q.image}`}
                  alt="Question"
                  className="max-h-40 w-auto rounded-lg object-contain"
                  loading="lazy"
                />
              </div>
            )}

            <p className="font-medium mb-3">{q.question_en}</p>

            <div className="space-y-1 mb-3">
              {q.options.map((opt: string, idx: number) => (
                <div
                  key={idx}
                  className={`rounded-lg px-3 py-2 text-sm ${
                    idx === q.correct
                      ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 font-medium"
                      : "bg-neutral-50 dark:bg-neutral-800/50 text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  {String.fromCharCode(65 + idx)}. {opt}
                </div>
              ))}
            </div>

            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 text-sm text-blue-900 dark:text-blue-200">
              {q.explanation_en}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
