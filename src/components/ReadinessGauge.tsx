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

  const accuracy = totalSeen > 0 ? (totalCorrect / totalSeen) * 100 : 0;
  const uniqueSeen = new Set(
    Object.values(session.stats.byCategory).flatMap((c) => c.seen)
  ).size;
  const coverage = (uniqueSeen / 150) * 100;
  const streakBonus = Math.min(session.streak.current, 7) * (100 / 7);

  const readiness = Math.round(
    accuracy * 0.5 + coverage * 0.3 + streakBonus * 0.2
  );

  // Gauge config
  const size = 220;
  const cx = size / 2;
  const cy = size * 0.72;
  const radius = 80;
  const strokeWidth = 18;

  // Angle from -180 (left) to 0 (right)
  const angle = -180 + (readiness / 100) * 180;
  const rad = (angle * Math.PI) / 180;
  const needleX = cx + radius * Math.cos(rad);
  const needleY = cy + radius * Math.sin(rad);

  // Color stops: red → orange → yellow → green
  let arcColor = "#DC2626"; // red
  let label = t("notReady");

  if (readiness >= 90) {
    arcColor = "#16A34A"; // green
    label = t("ready");
  } else if (readiness >= 75) {
    arcColor = "#EAB308"; // yellow
    label = t("almostReady");
  } else if (readiness >= 50) {
    arcColor = "#F97316"; // orange
    label = t("gettingThere");
  }

  // Build arc path
  const describeArc = (
    x: number,
    y: number,
    r: number,
    startAngle: number,
    endAngle: number
  ) => {
    const start = {
      x: x + r * Math.cos((startAngle * Math.PI) / 180),
      y: y + r * Math.sin((startAngle * Math.PI) / 180),
    };
    const end = {
      x: x + r * Math.cos((endAngle * Math.PI) / 180),
      y: y + r * Math.sin((endAngle * Math.PI) / 180),
    };
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    return [
      "M",
      start.x,
      start.y,
      "A",
      r,
      r,
      0,
      largeArcFlag,
      1,
      end.x,
      end.y,
    ].join(" ");
  };

  const bgPath = describeArc(cx, cy, radius, -180, 0);
  const fillPath = describeArc(cx, cy, radius, -180, angle);

  // Tick marks
  const ticks = [0, 25, 50, 75, 100];

  return (
    <div className="card p-5 mb-4 text-center">
      <h2 className="font-heading font-semibold mb-1">{t("examReadiness")}</h2>
      <p className="text-xs text-muted mb-4">{t("readinessDesc")}</p>

      <div className="relative mx-auto" style={{ width: size, height: cy + 10 }}>
        <svg width={size} height={cy + 10} className="mx-auto">
          {/* Background arc */}
          <path
            d={bgPath}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Filled arc */}
          <path
            d={fillPath}
            fill="none"
            stroke={arcColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="transition-all duration-700"
          />

          {/* Tick marks */}
          {ticks.map((tick) => {
            const a = -180 + (tick / 100) * 180;
            const r = (a * Math.PI) / 180;
            const x1 = cx + (radius - strokeWidth / 2 - 4) * Math.cos(r);
            const y1 = cy + (radius - strokeWidth / 2 - 4) * Math.sin(r);
            const x2 = cx + (radius + strokeWidth / 2 + 4) * Math.cos(r);
            const y2 = cy + (radius + strokeWidth / 2 + 4) * Math.sin(r);
            const lx = cx + (radius + strokeWidth / 2 + 14) * Math.cos(r);
            const ly = cy + (radius + strokeWidth / 2 + 14) * Math.sin(r);
            return (
              <g key={tick}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#9CA3AF"
                  strokeWidth={1}
                />
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-[9px] fill-muted"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Needle */}
          <line
            x1={cx}
            y1={cy}
            x2={needleX}
            y2={needleY}
            stroke="#1F2937"
            strokeWidth={2.5}
            strokeLinecap="round"
            className="transition-all duration-700"
          />

          {/* Needle pivot */}
          <circle cx={cx} cy={cy} r={5} fill="#1F2937" />
        </svg>

        {/* Center label */}
        <div
          className="absolute left-1/2 -translate-x-1/2 font-heading text-2xl font-bold"
          style={{ bottom: 0, color: arcColor }}
        >
          {readiness}%
        </div>
      </div>

      <p className="mt-6 font-semibold text-sm" style={{ color: arcColor }}>
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
