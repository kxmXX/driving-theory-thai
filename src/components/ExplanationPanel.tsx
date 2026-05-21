"use client";

import { Question } from "@/types";
import { useLanguage } from "@/lib/language-context";

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
  const { lang, t } = useLanguage();
  const letters = ["A", "B", "C", "D"];

  // Pick the right explanation based on language and whether user was wrong
  let explanation = "";
  let whyWrong = "";

  if (!isCorrect) {
    const wrongMap = lang === "th" ? question.wrong_explanations_th : question.wrong_explanations_en;
    if (wrongMap && wrongMap[userAnswer]) {
      whyWrong = wrongMap[userAnswer];
    }
  }

  if (lang === "th" && question.explanation_th) {
    explanation = question.explanation_th;
  } else {
    explanation = question.explanation_en;
  }

  return (
    <div className="animate-slide-up mt-3 rounded-md border p-3 text-xs">
      <div
        className={`mb-2 flex items-center gap-1.5 font-heading text-sm font-semibold ${
          isCorrect ? "text-green-700 dark:text-green-400" : "text-gov-red dark:text-red-400"
        }`}
      >
        {isCorrect ? (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {t("correct")}
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            {t("wrong")}
          </>
        )}
      </div>

      {!isCorrect && (
        <p className="mb-2 text-neutral-700 dark:text-neutral-300">
          {t("youChose")} <strong>{letters[userAnswer]}</strong>. {t("correct")}: <strong>{letters[question.correct]}</strong>.
        </p>
      )}

      {whyWrong && (
        <div className="mb-2 rounded bg-red-50 dark:bg-red-900/20 p-2.5 border border-red-200 dark:border-red-800">
          <p className="text-red-800 dark:text-red-300 leading-relaxed font-medium">
            {whyWrong}
          </p>
        </div>
      )}

      <div className="rounded bg-neutral-50 dark:bg-neutral-800/50 p-2.5">
        <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed">
          {explanation}
        </p>
      </div>
    </div>
  );
}
