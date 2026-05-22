"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "th" | "fr";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    title: "Thai Driving Theory Test",
    subtitle: "176 official questions • 90% pass rate",
    examMode: "Exam Mode",
    examDesc: "50 questions • 50 minutes • Results at the end",
    practice: "Practice",
    practiceDesc: "Training, Thematic & Blitz modes",
    reviewMistakes: "Review Mistakes",
    reviewDesc: "Focus on your weak points",
    statistics: "Statistics",
    statsDesc: "Track progress, streaks & history",
    studyGuide: "Study Guide",
    studyDesc: "Learn by category",
    training: "Training",
    trainingDesc: "Immediate feedback & explanations",
    blitz: "Blitz",
    blitzDesc: "10 questions, no timer",
    thematic: "Thematic",
    results: "Results",
    passed: "Passed!",
    tryAgain: "Try Again",
    correct: "Correct",
    wrong: "Wrong",
    home: "Home",
    stats: "Stats",
    nextQuestion: "Next Question",
    seeResults: "See Results",
    finishExam: "Finish Exam",
    overview: "Overview",
    byCategory: "By Category",
    weakPoints: "Weak Points",
    recentSessions: "Recent Sessions",
    resetProgress: "Reset Progress",
    currentStreak: "Current Streak",
    best: "Best",
    seen: "Seen",
    accuracy: "Accuracy",
    question: "Question",
    practiceThisCategory: "Practice This Category",
    difficulty: "Difficulty",
    flashcards: "Flashcards",
    flashcardsDesc: "Tap to reveal the correct answer",
    tapToReveal: "Tap to reveal answer",
    correctAnswer: "Correct Answer",
    selectCategory: "Category",
    allCategories: "All",
    start: "Start",
    previous: "Previous",
    next: "Next",
    restart: "Restart",
    youChose: "You chose",
    examReadiness: "Exam Readiness",
    readinessDesc: "Based on your accuracy, coverage, and streak",
    notReady: "Not ready yet",
    gettingThere: "Getting there",
    almostReady: "Almost ready",
    ready: "Ready for the exam!",
    coverage: "Coverage",
    streak: "Streak",
    reviewNow: "Review Now",
    knewIt: "Knew it",
    didntKnow: "Didn't know",
    exit: "Exit",
  },
  th: {
    title: "ข้อสอบใบขับขี่ไทย",
    subtitle: "176 คำถามอย่างเป็นทางการ • ผ่าน 90%",
    examMode: "โหมดสอบ",
    examDesc: "50 คำถาม • 50 นาที • ดูผลลัพธ์ตอนจบ",
    practice: "ฝึกฝน",
    practiceDesc: "โหมดฝึกฝน ตามหัวข้อ และ บลิตซ์",
    reviewMistakes: "ทบทวนข้อผิดพลาด",
    reviewDesc: "เน้นจุดอ่อนของคุณ",
    statistics: "สถิติ",
    statsDesc: "ติดตามความคืบหน้า สตรีค และประวัติ",
    studyGuide: "คู่มือการศึกษา",
    studyDesc: "เรียนรู้ตามหมวดหมู่",
    training: "การฝึกฝน",
    trainingDesc: "คำตอบทันทีพร้อมคำอธิบาย",
    blitz: "บลิตซ์",
    blitzDesc: "10 คำถาม ไม่จับเวลา",
    thematic: "ตามหัวข้อ",
    results: "ผลลัพธ์",
    passed: "ผ่าน!",
    tryAgain: "ลองอีกครั้ง",
    correct: "ถูกต้อง",
    wrong: "ผิด",
    home: "หน้าแรก",
    stats: "สถิติ",
    nextQuestion: "คำถามถัดไป",
    seeResults: "ดูผลลัพธ์",
    finishExam: "จบการสอบ",
    overview: "ภาพรวม",
    byCategory: "ตามหมวดหมู่",
    weakPoints: "จุดอ่อน",
    recentSessions: "เซสชันล่าสุด",
    resetProgress: "รีเซ็ตความคืบหน้า",
    currentStreak: "สตรีคปัจจุบัน",
    best: "ดีที่สุด",
    seen: "เคยดู",
    accuracy: "ความแม่นยำ",
    question: "คำถาม",
    practiceThisCategory: "ฝึกฝนหมวดหมู่นี้",
    difficulty: "ความยาก",
    flashcards: "แฟลชการ์ด",
    flashcardsDesc: "แตะเพื่อเผยเฉลยคำตอบที่ถูกต้อง",
    tapToReveal: "แตะเพื่อเผยเฉลย",
    correctAnswer: "คำตอบที่ถูกต้อง",
    selectCategory: "หมวดหมู่",
    allCategories: "ทั้งหมด",
    start: "เริ่ม",
    previous: "ก่อนหน้า",
    next: "ถัดไป",
    restart: "เริ่มใหม่",
    youChose: "คุณเลือก",
    examReadiness: "ความพร้อมสอบ",
    readinessDesc: "จากความแม่นยำ การครอบคลุม และสตรีคของคุณ",
    notReady: "ยังไม่พร้อม",
    gettingThere: "ใกล้พร้อมแล้ว",
    almostReady: "เกือบพร้อม",
    ready: "พร้อมสอบแล้ว!",
    coverage: "การครอบคลุม",
    streak: "สตรีค",
    reviewNow: "ทบทวนทันที",
    knewIt: "รู้แล้ว",
    didntKnow: "ยังไม่รู้",
    exit: "ออก",
  },
  fr: {
    title: "Code de la Route Thaïlande",
    subtitle: "176 questions officielles • Réussite à 90%",
    examMode: "Mode Examen",
    examDesc: "50 questions • 50 min • Résultats à la fin",
    practice: "Entraînement",
    practiceDesc: "Training, Thématique & Blitz",
    reviewMistakes: "Revoir les Erreurs",
    reviewDesc: "Concentre-toi sur tes points faibles",
    statistics: "Statistiques",
    statsDesc: "Progrès, série et historique",
    studyGuide: "Guide d'Étude",
    studyDesc: "Apprendre par catégorie",
    training: "Training",
    trainingDesc: "Correction immédiate + explications",
    blitz: "Blitz",
    blitzDesc: "10 questions, pas de chrono",
    thematic: "Thématique",
    results: "Résultats",
    passed: "Réussi !",
    tryAgain: "Réessayer",
    correct: "Correct",
    wrong: "Faux",
    home: "Accueil",
    stats: "Stats",
    nextQuestion: "Question Suivante",
    seeResults: "Voir les Résultats",
    finishExam: "Terminer l'Examen",
    overview: "Vue d'ensemble",
    byCategory: "Par Catégorie",
    weakPoints: "Points Faibles",
    recentSessions: "Sessions Récentes",
    resetProgress: "Réinitialiser",
    currentStreak: "Série Actuelle",
    best: "Record",
    seen: "Vues",
    accuracy: "Précision",
    question: "Question",
    practiceThisCategory: "Entraîner cette catégorie",
    difficulty: "Difficulté",
    flashcards: "Flashcards",
    flashcardsDesc: "Tape pour révéler la bonne réponse",
    tapToReveal: "Tape pour révéler",
    correctAnswer: "Bonne réponse",
    selectCategory: "Catégorie",
    allCategories: "Toutes",
    start: "Commencer",
    previous: "Précédent",
    next: "Suivant",
    restart: "Recommencer",
    youChose: "Vous avez choisi",
    examReadiness: "Prêt pour l'examen",
    readinessDesc: "Basé sur votre précision, couverture et série",
    notReady: "Pas encore prêt",
    gettingThere: "Ça progresse",
    almostReady: "Presque prêt",
    ready: "Prêt pour l'examen!",
    coverage: "Couverture",
    streak: "Série",
    reviewNow: "Réviser",
    knewIt: "Je le savais",
    didntKnow: "Je ne savais pas",
    exit: "Quitter",
  },
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("driving-lang") : null;
    if (saved && ["en", "th", "fr"].includes(saved)) {
      setLangState(saved as Language);
    }
  }, []);

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem("driving-lang", l);
  };

  const t = (key: string) => translations[lang][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
