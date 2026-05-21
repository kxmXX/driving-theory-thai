"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserSession, Category } from "@/types";
import { loadSession, resetSession } from "@/lib/session";
import { getCategoryLabel, getCategoryColor } from "@/lib/quiz-engine";
import ReadinessGauge from "@/components/ReadinessGauge";

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

export default function StatsPage() {
  const [session, setSession] = useState<UserSession | null>(null);

  useEffect(() => {
    setSession(loadSession());
  }, []);

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse-soft text-muted">Loading...</div>
      </div>
    );
  }

  const totalSeen = Object.values(session.stats.byCategory).reduce(
    (sum, cat) => sum + cat.seen.length,
    0
  );
  const totalCorrect = Object.values(session.stats.byCategory).reduce(
    (sum, cat) => sum + cat.correct.length,
    0
  );
  const accuracy = totalSeen > 0 ? Math.round((totalCorrect / totalSeen) * 100) : 0;

  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <h1 className="font-heading text-2xl font-bold mb-6">Statistics</h1>

      <ReadinessGauge session={session} />

      {/* Streak Card */}
      <div className="card p-4 mb-4 flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
          </svg>
        </div>
        <div>
          <p className="text-xs text-muted">Current Streak</p>
          <p className="font-heading text-xl font-bold">{session.streak.current} days</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-muted">Best</p>
          <p className="font-heading text-xl font-bold">{session.streak.best} days</p>
        </div>
      </div>

      {/* Overview */}
      <div className="card p-4 mb-4">
        <h2 className="font-heading font-semibold mb-3">Overview</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="font-heading text-2xl font-bold">{totalSeen}</p>
            <p className="text-xs text-muted">Seen</p>
          </div>
          <div>
            <p className="font-heading text-2xl font-bold">{totalCorrect}</p>
            <p className="text-xs text-muted">Correct</p>
          </div>
          <div>
            <p className="font-heading text-2xl font-bold">{accuracy}%</p>
            <p className="text-xs text-muted">Accuracy</p>
          </div>
        </div>
      </div>

      {/* By Category */}
      <div className="card p-4 mb-4">
        <h2 className="font-heading font-semibold mb-3">By Category</h2>
        <div className="space-y-3">
          {CATEGORIES.map((cat) => {
            const stats = session.stats.byCategory[cat];
            const seen = stats?.seen.length || 0;
            const correct = stats?.correct.length || 0;
            const pct = seen > 0 ? Math.round((correct / seen) * 100) : 0;
            return (
              <div key={cat}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: getCategoryColor(cat) }}
                    />
                    {getCategoryLabel(cat)}
                  </span>
                  <span className="text-muted">
                    {correct}/{seen}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: getCategoryColor(cat),
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weak Points */}
      {session.weakPoints.length > 0 && (
        <div className="card p-4 mb-4">
          <h2 className="font-heading font-semibold mb-3 text-red-600">Weak Points</h2>
          <p className="text-sm text-muted mb-2">
            {session.weakPoints.length} questions missed 2+ times
          </p>
          <Link
            href="/review/"
            className="touch-target inline-block rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Review Now
          </Link>
        </div>
      )}

      {/* Recent Sessions */}
      {session.recentSessions.length > 0 && (
        <div className="card p-4 mb-4">
          <h2 className="font-heading font-semibold mb-3">Recent Sessions</h2>
          <div className="space-y-2">
            {session.recentSessions.map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg bg-neutral-50 dark:bg-neutral-800/50 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">{s.mode}</p>
                  <p className="text-xs text-muted">
                    {new Date(s.date).toLocaleDateString()} • {s.questionIds.length} questions
                  </p>
                </div>
                <span
                  className={`font-bold ${
                    s.score >= 90 ? "text-green-600" : s.score >= 70 ? "text-amber-600" : "text-red-600"
                  }`}
                >
                  {s.score}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <button
        onClick={() => {
          if (confirm("Reset all progress? This cannot be undone.")) {
            resetSession();
            setSession(loadSession());
          }
        }}
        className="touch-target w-full rounded-xl border-2 border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
      >
        Reset Progress
      </button>
    </main>
  );
}
