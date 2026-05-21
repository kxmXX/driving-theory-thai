import type { Metadata } from "next";
import QuizContainer from "@/components/QuizContainer";

export const metadata: Metadata = {
  title: "Exam Mode - Thai Driving Theory Test",
  description: "Simulate the real exam with 50 questions in 50 minutes",
};

export default function ExamPage() {
  return (
    <main>
      <QuizContainer mode="EXAM" count={50} timeLimitMinutes={50} />
    </main>
  );
}
