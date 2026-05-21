"use client";

import { Question } from "@/types";

interface ExplanationPanelProps {
  question: Question;
  isCorrect: boolean;
  userAnswer: number;
}

export default function ExplanationPanel({
  question,
  isCorrect,
  userAnswer,
}: ExplanationPanelProps) {
  const letters = ["A", "B", "C", "D"];

  return (
    <div className="animate-slide-up mt-4 rounded-xl border-2 p-4 text-sm">
      <div
        className={`mb-3 flex items-center gap-2 font-heading font-semibold ${
          isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
        }`}
      >
        {isCorrect ? (
          <>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Correct!
          </>
        ) : (
          <>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Incorrect
          </>
        )}
      </div>

      {!isCorrect && (
        <p className="mb-2 text-neutral-700 dark:text-neutral-300">
          You selected <strong>{letters[userAnswer]}</strong>. The correct answer is{" "}
          <strong>{letters[question.correct]}</strong>.
        </p>
      )}

      <div className="rounded-lg bg-neutral-50 dark:bg-neutral-800/50 p-3">
        <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed">
          {question.explanation_en}
        </p>
      </div>
    </div>
  );
}
