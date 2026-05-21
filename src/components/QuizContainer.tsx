"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Question, QuizMode, Category, UserSession } from "@/types";
import { drawQuestions, getCategoryLabel } from "@/lib/quiz-engine";
import { loadSession, saveSession, recordResult, recordSession } from "@/lib/session";
import { useLanguage } from "@/lib/language-context";
import QuestionCard from "./QuestionCard";
import ExplanationPanel from "./ExplanationPanel";

interface QuizContainerProps {
  mode: QuizMode;
  categoryFilter?: Category;
  count: number;
  timeLimitMinutes?: number;
}

export default function QuizContainer({
  mode,
  categoryFilter,
  count,
  timeLimitMinutes,
}: QuizContainerProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [session, setSession] = useState<UserSession | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimitMinutes ? timeLimitMinutes * 60 : undefined);
  const [showResults, setShowResults] = useState(false);
  const [startTime] = useState(() => new Date().toISOString());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const s = loadSession();
    setSession(s);
    const drawn = drawQuestions(count, mode, categoryFilter, s);
    setQuestions(drawn);
  }, [count, mode, categoryFilter]);

  useEffect(() => {
    if (timeLimitMinutes && timeRemaining !== undefined && !showResults) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === undefined || prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [timeLimitMinutes, showResults]);

  const currentQuestion = questions[currentIndex];

  const handleSelect = useCallback(
    (index: number) => {
      if (!currentQuestion || answers[currentQuestion.id] !== undefined) return;

      const newAnswers = { ...answers, [currentQuestion.id]: index };
      setAnswers(newAnswers);

      const isCorrect = index === currentQuestion.correct;

      if (session) {
        const updated = recordResult(
          session,
          currentQuestion.id,
          currentQuestion.category,
          isCorrect
        );
        setSession(updated);
        saveSession(updated);
      }

      if (mode === "TRAINING" || mode === "THEMATIC" || mode === "REVIEW") {
        setShowExplanation(true);
      } else if (mode === "EXAM" || mode === "BLITZ") {
        if (currentIndex < questions.length - 1) {
          setTimeout(() => {
            setCurrentIndex((i) => i + 1);
          }, 300);
        }
      }
    },
    [currentQuestion, answers, session, mode, currentIndex, questions.length]
  );

  const handleNext = useCallback(() => {
    setShowExplanation(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      handleFinish();
    }
  }, [currentIndex, questions.length]);

  const handleFinish = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setShowResults(true);

    if (session) {
      const correctCount = questions.filter((q) => answers[q.id] === q.correct).length;
      const score = Math.round((correctCount / questions.length) * 100);
      const updated = recordSession(
        session,
        mode,
        score,
        questions.map((q) => q.id),
        categoryFilter
      );
      setSession(updated);
      saveSession(updated);
    }
  }, [session, mode, categoryFilter, questions, answers]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (showResults) {
    const correctCount = questions.filter((q) => answers[q.id] === q.correct).length;
    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= 90;

    return (
      <div className="animate-fade-in mx-auto max-w-xl px-4 py-6">
        <div className="gov-card p-5 text-center">
          <h1 className="font-heading text-xl font-bold mb-1">{t("results")}</h1>
          <p className="text-xs text-muted mb-5">
            {mode === "EXAM" ? "Exam" : mode} — {getCategoryLabel(categoryFilter!) || "All Categories"}
          </p>

          <div className="mb-5">
            <div
              className={`mx-auto mb-2 flex h-28 w-28 items-center justify-center rounded-full border-[3px] text-3xl font-bold ${
                passed
                  ? "border-green-600 text-green-700"
                  : "border-gov-red text-gov-red"
              }`}
            >
              {score}%
            </div>
            <p className={`font-semibold text-sm ${passed ? "text-green-700" : "text-gov-red"}`}>
              {passed ? t("passed") : t("tryAgain")}
            </p>
            <p className="text-xs text-muted mt-0.5">
              {correctCount} / {questions.length} {t("correct").toLowerCase()}
            </p>
          </div>

          <div className="space-y-1.5 mb-5 text-left">
            {questions.map((q, i) => {
              const userAns = answers[q.id];
              const isCorrect = userAns === q.correct;
              return (
                <div
                  key={q.id}
                  className={`flex items-center justify-between rounded px-3 py-1.5 text-xs ${
                    isCorrect ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"
                  }`}
                >
                  <span className="font-semibold">Q{i + 1}</span>
                  <span className={isCorrect ? "text-green-700 font-medium" : "text-gov-red font-medium"}>
                    {isCorrect ? t("correct") : t("wrong")}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={() => router.push("/")}
              className="touch-target flex-1 rounded bg-gov-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gov-dark"
            >
              {t("home")}
            </button>
            <button
              onClick={() => router.push("/stats")}
              className="touch-target flex-1 rounded border border-gov-blue px-4 py-2.5 text-sm font-semibold text-gov-blue transition hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              {t("stats")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse-soft text-muted text-sm">Loading...</div>
      </div>
    );
  }

  const userAnswer = answers[currentQuestion.id];
  const isAnswered = userAnswer !== undefined;
  const isCorrect = isAnswered && userAnswer === currentQuestion.correct;

  return (
    <div className="mx-auto max-w-xl px-3 py-3">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/")}
            className="touch-target rounded p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-800"
            aria-label="Go back"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
            <div
              className="h-full bg-gov-blue transition-all"
              style={{ width: `${((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-muted font-mono">
            {currentIndex + 1}/{questions.length}
          </span>
        </div>

        {timeRemaining !== undefined && (
          <div
            className={`font-mono text-xs font-bold ${
              timeRemaining < 300 ? "text-gov-red animate-pulse-soft" : "text-gov-blue"
            }`}
          >
            {formatTime(timeRemaining)}
          </div>
        )}
      </div>

      <QuestionCard
        question={currentQuestion}
        selectedAnswer={userAnswer}
        onSelect={handleSelect}
        showCorrect={showExplanation}
        disabled={isAnswered && showExplanation}
        questionNumber={currentIndex + 1}
        totalQuestions={questions.length}
      />

      {showExplanation && (
        <ExplanationPanel
          question={currentQuestion}
          isCorrect={!!isCorrect}
          userAnswer={userAnswer}
        />
      )}

      {isAnswered && showExplanation && (
        <div className="mt-3">
          <button
            onClick={handleNext}
            className="touch-target w-full rounded bg-gov-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gov-dark"
          >
            {currentIndex < questions.length - 1 ? t("nextQuestion") : t("seeResults")}
          </button>
        </div>
      )}

      {(mode === "EXAM" || mode === "BLITZ") && isAnswered && !showExplanation && (
        <div className="mt-3">
          <button
            onClick={() => {
              if (currentIndex < questions.length - 1) {
                setCurrentIndex((i) => i + 1);
              } else {
                handleFinish();
              }
            }}
            className="touch-target w-full rounded bg-gov-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gov-dark"
          >
            {currentIndex < questions.length - 1 ? t("nextQuestion") : mode === "BLITZ" ? t("seeResults") : t("finishExam")}
          </button>
        </div>
      )}

      {mode === "EXAM" && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {questions.map((q, i) => {
            const ans = answers[q.id];
            const answered = ans !== undefined;
            const correct = answered && ans === q.correct;
            return (
              <button
                key={q.id}
                onClick={() => {
                  setCurrentIndex(i);
                  setShowExplanation(false);
                }}
                className={`h-7 w-7 rounded text-[10px] font-bold transition border ${
                  i === currentIndex
                    ? "border-gov-blue bg-gov-blue text-white"
                    : answered
                    ? correct
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-gov-red bg-gov-red text-white"
                    : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-muted"
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
