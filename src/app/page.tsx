"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

export default function HomePage() {
  const { lang, setLang, t } = useLanguage();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name: "Thai Driving Theory Test",
    description: "Prepare for the Thailand driving license theory exam with 150 official questions",
    educationalLevel: "Driving License Theory Exam",
    about: {
      "@type": "Thing",
      name: "Thailand Driving License",
    },
    numberOfQuestions: 150,
    typicalAgeRange: "18-",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Government Header */}
      <header className="gov-header text-white">
        <div className="mx-auto max-w-xl px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Thai Steering Wheel / Driving License Emblem */}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-gov-gold bg-white/10">
                <svg className="h-8 w-8 text-gov-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                  <path d="M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
                </svg>
              </div>
              <div>
                <h1 className="font-heading text-base font-bold leading-tight sm:text-lg">
                  {t("title")}
                </h1>
                <p className="text-[10px] uppercase tracking-widest text-white/60">Department of Land Transport</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-5">
        {/* Language Selector */}
        <div className="mb-5 flex justify-center gap-2">
          {(["en", "th", "fr"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`touch-target flex items-center gap-1.5 rounded border px-3 py-1.5 text-sm font-semibold transition ${
                lang === l
                  ? "border-gov-blue bg-gov-blue text-white"
                  : "border-neutral-300 bg-white text-neutral-700 hover:border-gov-blue"
              }`}
            >
              <span className="text-base">{l === "en" ? "🇬🇧" : l === "th" ? "🇹🇭" : "🇫🇷"}</span>
              <span className="uppercase">{l}</span>
            </button>
          ))}
        </div>

        <p className="mb-5 text-center text-sm text-muted">
          {t("subtitle")}
        </p>

        <div className="space-y-2.5">
          <Link
            href="/exam/"
            className="gov-card flex items-center gap-3.5 p-3.5 transition hover:border-gov-blue"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-gov-red text-white shadow-sm">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="font-heading text-sm font-bold text-gov-dark dark:text-white">{t("examMode")}</h2>
              <p className="text-[11px] text-muted leading-tight">{t("examDesc")}</p>
            </div>
            <svg className="h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link
            href="/practice/"
            className="gov-card flex items-center gap-3.5 p-3.5 transition hover:border-gov-blue"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-gov-blue text-white shadow-sm">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="font-heading text-sm font-bold text-gov-dark dark:text-white">{t("practice")}</h2>
              <p className="text-[11px] text-muted leading-tight">{t("practiceDesc")}</p>
            </div>
            <svg className="h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link
            href="/review/"
            className="gov-card flex items-center gap-3.5 p-3.5 transition hover:border-gov-blue"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-orange-600 text-white shadow-sm">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="font-heading text-sm font-bold text-gov-dark dark:text-white">{t("reviewMistakes")}</h2>
              <p className="text-[11px] text-muted leading-tight">{t("reviewDesc")}</p>
            </div>
            <svg className="h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link
            href="/stats/"
            className="gov-card flex items-center gap-3.5 p-3.5 transition hover:border-gov-blue"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-green-700 text-white shadow-sm">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="font-heading text-sm font-bold text-gov-dark dark:text-white">{t("statistics")}</h2>
              <p className="text-[11px] text-muted leading-tight">{t("statsDesc")}</p>
            </div>
            <svg className="h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link
            href="/learn/"
            className="gov-card flex items-center gap-3.5 p-3.5 transition hover:border-gov-blue"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-purple-700 text-white shadow-sm">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="font-heading text-sm font-bold text-gov-dark dark:text-white">{t("studyGuide")}</h2>
              <p className="text-[11px] text-muted leading-tight">{t("studyDesc")}</p>
            </div>
            <svg className="h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </main>
    </>
  );
}
