"use client";

import { UserSession } from "@/types";
import { useLanguage } from "@/lib/language-context";

interface Props {
  session: UserSession;
}

export default function ReadinessGauge({ session }: Props) {
  const { t } = useLanguage();

  const totalSeen = Object.values(session.stats.byCategory).reduce(
    (sum, cat) => sum + cat.seen.length,
    0
  );
  const totalCorrect = Object.values(session.stats.byCategory).reduce(
    (sum, cat) => sum + cat.correct.length,
    0
  );

  // Calculate readiness score (0-100)
  const accuracy = totalSeen > 0 ? (totalCorrect / totalSeen) * 100 : 0;
  const uniqueSeen = new Set(
    Object.values(session.stats.byCategory).flatMap((c) => c.seen)
  ).size;
  const coverage = (uniqueSeen / 150) * 100;
  const streakBonus = Math.min(session.streak.current, 7) * (100 / 7);

  const readiness = Math.round(
    accuracy * 0.5 + coverage * 0.3 + streakBonus * 0.2
  );

  // Color & label based on readiness
  let color = "#DC2626"; // red
  let bgColor = "#FEE2E2";
  let label = t("notReady");
  let emoji = "😳";

  if (readiness >= 90) {
    color = "#16A34A"; // green
    bgColor = "#DCFCE7";
    label = t("ready");
    emoji = "🤢";
  } else if (readiness >= 75) {
    color = "#CA8A04"; // yellow/amber
    bgColor = "#FEF9C3";
    label = t("almostReady");
    emoji = "😐";
  } else if (readiness >= 50) {
    color = "#EA580C"; // orange
    bgColor = "#FFEDD5";
    label = t("gettingThere");
    emoji = "🍊";
  }

  // Semi-circle gauge (SVG)
  const radius = 70;
  const stroke = 12;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * Math.PI;
  const strokeDashoffset = circumference - (readiness / 100) * circumference;

  return (
    <div className="card p-5 mb-4 text-center">
      <h2 className="font-heading font-semibold mb-1">{t("examReadiness")}</h2>
      <p className="text-xs text-muted mb-4">{t("readinessDesc")}</p>

      <div className="relative mx-auto w-fit">
        <svg width={radius * 2} height={radius} className="mx-auto">
          {/* Background arc */}
          <path
            d={`M ${stroke / 2} ${radius} A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${radius * 2 - stroke / 2} ${radius}`}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
          {/* Foreground arc */}
          <path
            d={`M ${stroke / 2} ${radius} A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${radius * 2 - stroke / 2} ${radius}`}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span className="text-2xl">{emoji}</span>
          <span className="font-heading text-xl font-bold" style={{ color }}>
            {readiness}%
          </span>
        </div>
      </div>

      <p className="mt-2 font-semibold text-sm" style={{ color }}>
        {label}
      </p>

      {/* Breakdown */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-neutral-50 dark:bg-neutral-800/50 p-2">
          <p className="font-heading text-sm font-bold">{Math.round(accuracy)}%</p>
          <p className="text-[10px] text-muted">{t("accuracy")}</p>
        </div>
        <div className="rounded-lg bg-neutral-50 dark:bg-neutral-800/50 p-2">
          <p className="font-heading text-sm font-bold">{Math.round(coverage)}%</p>
          <p className="text-[10px] text-muted">{t("coverage")}</p>
        </div>
        <div className="rounded-lg bg-neutral-50 dark:bg-neutral-800/50 p-2">
          <p className="font-heading text-sm font-bold">{session.streak.current}</p>
          <p className="text-[10px] text-muted">{t("streak")}</p>
        </div>
      </div>
    </div>
  );
}
