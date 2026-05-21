"use client";

import { Question } from "@/types";

interface QuestionCardProps {
  question: Question;
  selectedAnswer?: number;
  onSelect: (index: number) => void;
  showCorrect?: boolean;
  disabled?: boolean;
  questionNumber: number;
  totalQuestions: number;
}

export default function QuestionCard({
  question,
  selectedAnswer,
  onSelect,
  showCorrect,
  disabled,
  questionNumber,
  totalQuestions,
}: QuestionCardProps) {
  const letters = ["A", "B", "C", "D"];

  const getButtonClass = (index: number) => {
    const base =
      "touch-target w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 flex items-start gap-3 text-sm sm:text-base";

    if (showCorrect) {
      if (index === question.correct) {
        return `${base} border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200`;
      }
      if (index === selectedAnswer && index !== question.correct) {
        return `${base} border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200`;
      }
      return `${base} border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-500`;
    }

    if (selectedAnswer === index) {
      return `${base} border-accent-blue bg-blue-50 dark:bg-blue-900/20 text-accent-blue`;
    }

    return `${base} border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:border-accent-blue hover:bg-blue-50/50 dark:hover:bg-blue-900/10`;
  };

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between text-xs text-muted">
        <span>
          Question {questionNumber} / {totalQuestions}
        </span>
        <span className="uppercase tracking-wider">{question.category.replace("_", " ")}</span>
      </div>

      {question.image && (
        <div className="flex justify-center">
          <img
            src={`/images/${question.image}`}
            alt="Question illustration"
            className="max-h-48 w-auto rounded-lg object-contain"
            loading="lazy"
          />
        </div>
      )}

      <h2 className="font-heading text-lg font-semibold leading-snug">
        {question.question_en}
      </h2>

      {question.question_th && (
        <p className="text-sm text-muted">{question.question_th}</p>
      )}

      <div className="space-y-2 pt-2">
        {question.options.map((option, index) => {
          const isImageOption = option.startsWith("Image: ");
          const imageName = isImageOption ? option.replace("Image: ", "") : null;
          return (
            <button
              key={index}
              onClick={() => !disabled && onSelect(index)}
              disabled={disabled}
              className={getButtonClass(index)}
              aria-pressed={selectedAnswer === index}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-sm font-bold">
                {letters[index]}
              </span>
              <span className="pt-0.5">
                {isImageOption && imageName ? (
                  <img
                    src={`/images/${imageName}`}
                    alt={`Option ${letters[index]}`}
                    className="max-h-32 w-auto rounded-md object-contain"
                    loading="lazy"
                  />
                ) : (
                  option
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
