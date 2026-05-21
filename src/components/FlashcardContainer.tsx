"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Question, Category } from "@/types";
import { loadQuestions } from "@/lib/questions-loader";
import { useLanguage } from "@/lib/language-context";
import { getCategoryLabel } from "@/lib/quiz-engine";

const cats: Category[] = [
  "road_signs", "traffic_rules", "speed_limits", "alcohol_drugs",
  "documents", "safety_distances", "motorcycle", "emergency",
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FlashcardContainer() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState<Category | "all">("all");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    setLoading(true);
    loadQuestions(selectedCat === "all" ? undefined : selectedCat)
      .then((q) => setQuestions(shuffle(q)))
      .finally(() => setLoading(false));
  }, [selectedCat]);

  const current = questions[currentIndex];
  const letters = ["A", "B", "C", "D"];

  const handleFlip = useCallback(() => {
    setFlipped((f) => !f);
  }, []);

  const handleNext = useCallback(() => {
    setFlipped(false);
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        // Loop back or show finish
        setCurrentIndex(0);
      }
    }, 150);
  }, [currentIndex, questions.length]);

  const handlePrev = useCallback(() => {
    setFlipped(false);
    setTimeout(() => {
      if (currentIndex > 0) setCurrentIndex((i) => i - 1);
    }, 150);
  }, [currentIndex]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-pulse-soft text-muted text-sm">Loading...</div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="mx-auto max-w-xl px-4 py-6">
        <div className="gov-card p-5">
          <h1 className="font-heading text-lg font-bold mb-1 text-center">{t("flashcards")}</h1>
          <p className="text-xs text-muted text-center mb-5">{t("flashcardsDesc")}</p>

          <div className="mb-4">
            <p className="text-xs font-semibold text-gov-dark dark:text-white mb-2">{t("selectCategory")}</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCat("all")}
                className={`touch-target rounded border px-3 py-1.5 text-xs font-semibold transition ${
                  selectedCat === "all"
                    ? "border-gov-blue bg-gov-blue text-white"
                    : "border-neutral-300 bg-white text-neutral-700"
                }`}
              >
                {t("allCategories")}
              </button>
              {cats.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCat(c)}
                  className={`touch-target rounded border px-3 py-1.5 text-xs font-semibold transition ${
                    selectedCat === c
                      ? "border-gov-blue bg-gov-blue text-white"
                      : "border-neutral-300 bg-white text-neutral-700"
                  }`}
                >
                  {getCategoryLabel(c)}
                </button>
              ))}
            </div>
          </div>

          <div className="text-center text-xs text-muted mb-4">
            {questions.length} {t("question").toLowerCase()}{questions.length > 1 ? "s" : ""}
          </div>

          <button
            onClick={() => setStarted(true)}
            className="touch-target w-full rounded bg-gov-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gov-dark"
          >
            {t("start")}
          </button>
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="mx-auto max-w-xl px-4 py-6 text-center">
        <p className="text-muted text-sm">No questions available.</p>
      </div>
    );
  }

  const questionText = lang === "th" && current.question_th ? current.question_th : current.question_en;
  const correctOption = current.options[current.correct];
  const correctOptionTh = current.options_th?.[current.correct];
  const explanationText = lang === "th" && current.explanation_th ? current.explanation_th : current.explanation_en;

  return (
    <div className="mx-auto max-w-xl px-4 py-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="touch-target rounded p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-800"
          aria-label="Go back"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-xs text-muted font-mono">
          {currentIndex + 1} / {questions.length}
        </span>
        <button
          onClick={() => { setStarted(false); setFlipped(false); setCurrentIndex(0); }}
          className="touch-target rounded p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-800"
          aria-label="Restart"
        >
          <svg className="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Card */}
      <div
        onClick={handleFlip}
        className="relative cursor-pointer select-none"
        style={{ perspective: "1000px" }}
      >
        <div
          className="relative w-full transition-transform duration-500"
          style={{ transformStyle: "preserve-3d", minHeight: "320px", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          {/* Front */}
          <div
            className="gov-card absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
            style={{ backfaceVisibility: "hidden" }}
          >
            <span className="text-[10px] uppercase tracking-wider text-muted mb-3">
              {getCategoryLabel(current.category)}
            </span>

            {current.image && (
              <img
                src={`/images/${current.image}`}
                alt="Question"
                className="max-h-32 w-auto rounded-md object-contain mb-3"
                loading="lazy"
              />
            )}

            <h2 className="font-heading text-base font-semibold leading-snug text-gov-dark dark:text-white">
              {questionText}
            </h2>

            {lang === "th" && current.question_th && (
              <p className="text-xs text-muted mt-1">{current.question_en}</p>
            )}

            <p className="mt-6 text-[11px] text-muted">{t("tapToReveal")}</p>
          </div>

          {/* Back */}
          <div
            className="gov-card absolute inset-0 flex flex-col items-center justify-center p-6 text-center border-gov-gold"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <span className="text-[10px] uppercase tracking-wider text-gov-gold mb-3">
              {t("correctAnswer")}
            </span>

            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-bold text-sm">
                {letters[current.correct]}
              </span>
              <span className="font-semibold text-sm text-gov-dark dark:text-white">
                {lang === "th" && correctOptionTh ? correctOptionTh : correctOption}
              </span>
            </div>

            <div className="w-full border-t border-neutral-200 dark:border-neutral-700 pt-3 mt-1">
              <p className="text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
                {explanationText}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 flex gap-2.5">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="touch-target flex-1 rounded border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t("previous")}
        </button>
        <button
          onClick={handleNext}
          className="touch-target flex-1 rounded bg-gov-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gov-dark"
        >
          {currentIndex === questions.length - 1 ? t("restart") : t("next")}
        </button>
      </div>
    </div>
  );
}
