import type { Metadata } from "next";
import Link from "next/link";
import { Category } from "@/types";
import { getCategoryLabel, getCategoryColor } from "@/lib/quiz-engine";

export const metadata: Metadata = {
  title: "Practice - Thai Driving Theory Test",
  description: "Choose your practice mode and category",
};

const CATEGORIES: Category[] = [
  "road_signs",
  "traffic_rules",
  "speed_limits",
  "alcohol_drugs",
  "documents",
  "safety_distances",
  "motorcycle",
  "emergency",
];

export default function PracticePage() {
  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <h1 className="font-heading text-2xl font-bold mb-6">Practice</h1>

      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-3">
            Modes
          </h2>
          <div className="space-y-3">
            <Link
              href="/practice/ultimate/"
              className="card flex items-center gap-4 p-4 transition hover:border-accent-blue border-2 border-amber-400 bg-amber-50/50 dark:bg-amber-900/10"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Ultimate Review</h3>
                <p className="text-xs text-muted">Non-stop adaptive training • Wrong answers come back fast</p>
              </div>
              <svg className="h-5 w-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="/practice/training/"
              className="card flex items-center gap-4 p-4 transition hover:border-accent-blue"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-accent-blue">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Training</h3>
                <p className="text-xs text-muted">Immediate feedback & explanations</p>
              </div>
              <svg className="h-5 w-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="/practice/blitz/"
              className="card flex items-center gap-4 p-4 transition hover:border-accent-blue"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Blitz</h3>
                <p className="text-xs text-muted">10 questions, no timer</p>
              </div>
              <svg className="h-5 w-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-3">
            Thematic
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/practice/${cat}/`}
                className="card flex items-center gap-3 p-4 transition hover:border-accent-blue"
              >
                <div
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: getCategoryColor(cat) }}
                />
                <span className="flex-1 font-medium">{getCategoryLabel(cat)}</span>
                <svg className="h-5 w-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
