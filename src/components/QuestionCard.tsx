"use client";

import { Question } from "@/types";
import { useLanguage } from "@/lib/language-context";

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
  const { lang } = useLanguage();
  const letters = ["A", "B", "C", "D"];

  const questionText =
    lang === "th" && question.question_th ? question.question_th : question.question_en;

  const getOptionText = (index: number): string => {
    if (lang === "th" && question.options_th?.[index]) {
      return question.options_th[index];
    }
    return question.options[index];
  };

  const getButtonClass = (index: number) => {
    const base =
      "touch-target w-full text-left px-3 py-2 rounded-md border transition-all duration-150 flex items-center gap-2.5 text-sm";

    if (showCorrect) {
      if (index === question.correct) {
        return `${base} border-green-600 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200`;
      }
      if (index === selectedAnswer && index !== question.correct) {
        return `${base} border-gov-red bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200`;
      }
      return `${base} border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-400`;
    }

    if (selectedAnswer === index) {
      return `${base} border-gov-blue bg-blue-50 dark:bg-blue-900/20 text-gov-blue`;
    }

    return `${base} border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:border-gov-blue hover:bg-blue-50/50`;
  };

  return (
    <div className="animate-fade-in space-y-2.5">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted">
        <span className="font-medium">
          {questionNumber} / {totalQuestions}
        </span>
        <span>{question.category.replace("_", " ")}</span>
      </div>

      {question.image && (
        <div className="flex justify-center">
          <img
            src={`/images/${question.image}`}
            alt="Question"
            className="max-h-36 w-auto rounded-md object-contain"
            loading="lazy"
          />
        </div>
      )}

      <h2 className="font-heading text-[15px] font-semibold leading-snug">
        {questionText}
      </h2>

      {lang === "th" && question.question_th && (
        <p className="text-xs text-muted leading-snug">{question.question_en}</p>
      )}

      <div className="space-y-1.5 pt-1">
        {question.options.map((option, index) => {
          const displayOption = getOptionText(index);
          const isImageOption = displayOption.startsWith("Image: ");
          const imageName = isImageOption ? displayOption.replace("Image: ", "") : null;
          return (
            <button
              key={index}
              onClick={() => !disabled && onSelect(index)}
              disabled={disabled}
              className={getButtonClass(index)}
              aria-pressed={selectedAnswer === index}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-neutral-100 dark:bg-neutral-800 text-xs font-bold">
                {letters[index]}
              </span>
              <span className="leading-tight">
                {isImageOption && imageName ? (
                  <img
                    src={`/images/${imageName}`}
                    alt={`Option ${letters[index]}`}
                    className="max-h-28 w-auto rounded object-contain"
                    loading="lazy"
                  />
                ) : (
                  displayOption
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
