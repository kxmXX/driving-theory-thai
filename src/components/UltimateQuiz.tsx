"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Question, UserSession } from "@/types";
import {
  initUltimatePool,
  pickUltimateQuestion,
  updateUltimateState,
  getUltimateProgress,
  UltimateQuestionState,
} from "@/lib/quiz-engine";
import { loadSession, saveSession, recordResult } from "@/lib/session";
import { useLanguage } from "@/lib/language-context";
import QuestionCard from "./QuestionCard";
import ExplanationPanel from "./ExplanationPanel";

export default function UltimateQuiz() {
  const router = useRouter();
  const { t } = useLanguage();

  const [pool, setPool] = useState<UltimateQuestionState[]>([]);
  const [current, setCurrent] = useState<{ index: number; question: Question } | null>(null);
  const [globalIndex, setGlobalIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | undefined>(undefined);
  const [showExplanation, setShowExplanation] = useState(false);
  const [session, setSession] = useState<UserSession | null>(null);
  const [stopped, setStopped] = useState(false);

  // Session stats
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionWrong, setSessionWrong] = useState(0);
  const [sessionStreak, setSessionStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [startTime] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Init
  useEffect(() => {
    const s = loadSession();
    setSession(s);
    const p = initUltimatePool();
    setPool(p);
    const first = pickUltimateQuestion(p, 0);
    setCurrent(first);
    setGlobalIndex(1);
  }, []);

  // Timer
  useEffect(() => {
    if (stopped) return;
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stopped, startTime]);

  const handleSelect = useCallback(
    (optionIndex: number) => {
      if (!current || selectedAnswer !== undefined) return;

      setSelectedAnswer(optionIndex);
      const isCorrect = optionIndex === current.question.correct;

      // Update stats
      if (isCorrect) {
        setSessionCorrect((c) => c + 1);
        setSessionStreak((s) => {
          const ns = s + 1;
          setBestStreak((b) => Math.max(b, ns));
          return ns;
        });
      } else {
        setSessionWrong((c) => c + 1);
        setSessionStreak(0);
      }

      // Update pool state
      setPool((prev) => {
        const updated = [...prev];
        updateUltimateState(updated[current.index], isCorrect, globalIndex);
        return updated;
      });

      // Update session
      if (session) {
        const updated = recordResult(
          session,
          current.question.id,
          current.question.category,
          isCorrect
        );
        setSession(updated);
        saveSession(updated);
      }

      setShowExplanation(true);
    },
    [current, selectedAnswer, globalIndex, session]
  );

  const handleNext = useCallback(() => {
    if (!pool.length) return;

    setSelectedAnswer(undefined);
    setShowExplanation(false);

    const nextIdx = globalIndex;
    const next = pickUltimateQuestion(pool, nextIdx);
    setCurrent(next);
    setGlobalIndex(nextIdx + 1);
  }, [pool, globalIndex]);

  const handleStop = useCallback(() => {
    setStopped(true);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}h ${m}m ${sec}s`;
    if (m > 0) return `${m}m ${sec}s`;
    return `${sec}s`;
  };

  // Results screen
  if (stopped) {
    const total = sessionCorrect + sessionWrong;
    const accuracy = total > 0 ? Math.round((sessionCorrect / total) * 100) : 0;
    const progress = getUltimateProgress(pool);

    return (
      <div className="animate-fade-in mx-auto max-w-xl px-4 py-6">
        <div className="gov-card p-5 text-center">
          <h1 className="font-heading text-xl font-bold mb-1">Ultimate Session</h1>
          <p className="text-xs text-muted mb-5">{formatTime(elapsed)}</p>

          <div className="mb-5">
            <div className="mx-auto mb-2 flex h-28 w-28 items-center justify-center rounded-full border-[3px] text-3xl font-bold border-gov-blue text-gov-blue">
              {accuracy}%
            </div>
            <p className="font-semibold text-sm">
              {sessionCorrect} correct / {sessionWrong} wrong
            </p>
            <p className="text-xs text-muted mt-0.5">Best streak: {bestStreak}</p>
          </div>

          {/* Mastery breakdown */}
          <div className="mb-5 text-left space-y-2">
            <h3 className="font-heading text-sm font-semibold">Mastery Progress</h3>
            <div className="h-3 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800 flex">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${(progress.mastered / progress.total) * 100}%` }}
              />
              <div
                className="h-full bg-amber-400 transition-all"
                style={{ width: `${(progress.learning / progress.total) * 100}%` }}
              />
              <div
                className="h-full bg-neutral-300 dark:bg-neutral-700 transition-all"
                style={{ width: `${(progress.untouched / progress.total) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500 inline-block" /> {progress.mastered} mastered
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-400 inline-block" /> {progress.learning} learning
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-neutral-400 inline-block" /> {progress.untouched} new
              </span>
            </div>
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={() => router.replace("/")}
              className="touch-target flex-1 rounded bg-gov-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gov-dark"
            >
              Home
            </button>
            <button
              onClick={() => router.replace("/stats")}
              className="touch-target flex-1 rounded border border-gov-blue px-4 py-2.5 text-sm font-semibold text-gov-blue transition hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              Stats
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse-soft text-muted text-sm">Loading...</div>
      </div>
    );
  }

  const totalSeen = sessionCorrect + sessionWrong;
  const accuracy = totalSeen > 0 ? Math.round((sessionCorrect / totalSeen) * 100) : 0;

  return (
    <div className="mx-auto max-w-xl px-3 py-3">
      {/* Header with live stats */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleStop}
            className="touch-target rounded bg-red-100 dark:bg-red-900/30 p-2 hover:bg-red-200 dark:hover:bg-red-900/50"
            aria-label="Stop session"
          >
            <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex items-center gap-3 text-xs">
            <span className="font-mono text-muted">{formatTime(elapsed)}</span>
            <span className="h-3 w-px bg-neutral-300 dark:bg-neutral-700" />
            <span className="text-green-600 font-semibold">{sessionCorrect}</span>
            <span className="text-muted">/</span>
            <span className="text-red-600 font-semibold">{sessionWrong}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted">Streak</span>
          <span className={`font-bold font-mono ${sessionStreak >= 5 ? "text-amber-500" : ""}`}>
            {sessionStreak}
          </span>
          {sessionStreak >= 10 && <span className="text-amber-500">🔥</span>}
        </div>
      </div>

      <QuestionCard
        key={`${current.question.id}-${globalIndex}`}
        question={current.question}
        selectedAnswer={selectedAnswer}
        onSelect={handleSelect}
        showCorrect={showExplanation}
        disabled={selectedAnswer !== undefined && showExplanation}
        questionNumber={totalSeen + 1}
        totalQuestions={-1}
      />

      {showExplanation && (
        <ExplanationPanel
          question={current.question}
          isCorrect={selectedAnswer === current.question.correct}
          userAnswer={selectedAnswer}
        />
      )}

      {selectedAnswer !== undefined && showExplanation && (
        <div className="mt-3">
          <button
            onClick={handleNext}
            className="touch-target w-full rounded bg-gov-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gov-dark"
          >
            Next Question
          </button>
        </div>
      )}

      {/* Bottom: mastery mini bar */}
      <div className="mt-4">
        {(() => {
          const prog = getUltimateProgress(pool);
          return (
            <div>
              <div className="h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800 flex">
                <div
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${(prog.mastered / prog.total) * 100}%` }}
                />
                <div
                  className="h-full bg-amber-400 transition-all"
                  style={{ width: `${(prog.learning / prog.total) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted mt-1">
                <span>{prog.mastered} mastered</span>
                <span>{prog.learning} learning</span>
                <span>{prog.untouched} new</span>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
