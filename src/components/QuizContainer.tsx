"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Question, QuizMode, Category, UserSession } from "@/types";
import { drawQuestions, getCategoryLabel } from "@/lib/quiz-engine";
import { loadSession, saveSession, recordQuestionResult, recordSession } from "@/lib/session";
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
        const updated = recordQuestionResult(
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
      <div className="animate-fade-in mx-auto max-w-xl px-4 py-8">
        <div className="card p-6 text-center">
          <h1 className="font-heading text-2xl font-bold mb-2">Results</h1>
          <p className="text-muted mb-6">
            {mode === "EXAM" ? "Exam" : mode} - {getCategoryLabel(categoryFilter!) || "All Categories"}
          </p>

          <div className="mb-6">
            <div
              className={`mx-auto mb-2 flex h-32 w-32 items-center justify-center rounded-full border-4 text-3xl font-bold ${
                passed
                  ? "border-green-500 text-green-600"
                  : "border-red-500 text-red-600"
              }`}
            >
              {score}%
            </div>
            <p className={passed ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
              {passed ? "Passed!" : "Try Again"}
            </p>
            <p className="text-sm text-muted mt-1">
              {correctCount} / {questions.length} correct
            </p>
          </div>

          <div className="space-y-2 mb-6 text-left">
            {questions.map((q, i) => {
              const userAns = answers[q.id];
              const isCorrect = userAns === q.correct;
              return (
                <div
                  key={q.id}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                    isCorrect ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"
                  }`}
                >
                  <span className="font-medium">Q{i + 1}</span>
                  <span className={isCorrect ? "text-green-700" : "text-red-700"}>
                    {isCorrect ? "Correct" : "Wrong"}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push("/")}
              className="touch-target flex-1 rounded-xl bg-accent-blue px-4 py-3 font-semibold text-white transition hover:bg-blue-800"
            >
              Home
            </button>
            <button
              onClick={() => router.push("/stats")}
              className="touch-target flex-1 rounded-xl border-2 border-accent-blue px-4 py-3 font-semibold text-accent-blue transition hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              Stats
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse-soft text-muted">Loading...</div>
      </div>
    );
  }

  const userAnswer = answers[currentQuestion.id];
  const isAnswered = userAnswer !== undefined;
  const isCorrect = isAnswered && userAnswer === currentQuestion.correct;

  return (
    <div className="mx-auto max-w-xl px-4 py-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/")}
            className="touch-target rounded-lg p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800"
            aria-label="Go back"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="h-2 w-24 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
            <div
              className="h-full bg-accent-blue transition-all"
              style={{ width: `${((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100}%` }}
            />
          </div>
          <span className="text-xs text-muted">
            {currentIndex + 1}/{questions.length}
          </span>
        </div>

        {timeRemaining !== undefined && (
          <div
            className={`font-mono text-sm font-bold ${
              timeRemaining < 300 ? "text-red-600 animate-pulse-soft" : "text-accent-blue"
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
        <div className="mt-4">
          <button
            onClick={handleNext}
            className="touch-target w-full rounded-xl bg-accent-blue px-4 py-3 font-semibold text-white transition hover:bg-blue-800"
          >
            {currentIndex < questions.length - 1 ? "Next Question" : "See Results"}
          </button>
        </div>
      )}

      {mode === "EXAM" && isAnswered && !showExplanation && (
        <div className="mt-4">
          <button
            onClick={() => {
              if (currentIndex < questions.length - 1) {
                setCurrentIndex((i) => i + 1);
              } else {
                handleFinish();
              }
            }}
            className="touch-target w-full rounded-xl bg-accent-blue px-4 py-3 font-semibold text-white transition hover:bg-blue-800"
          >
            {currentIndex < questions.length - 1 ? "Next Question" : "Finish Exam"}
          </button>
        </div>
      )}

      {mode === "EXAM" && (
        <div className="mt-4 flex flex-wrap gap-2">
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => {
                setCurrentIndex(i);
                setShowExplanation(false);
              }}
              className={`h-8 w-8 rounded-lg text-xs font-bold transition ${
                i === currentIndex
                  ? "bg-accent-blue text-white"
                  : answers[q.id] !== undefined
                  ? "bg-accent-gold text-white"
                  : "bg-neutral-200 dark:bg-neutral-800 text-muted"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
