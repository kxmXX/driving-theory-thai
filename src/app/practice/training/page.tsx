import type { Metadata } from "next";
import QuizContainer from "@/components/QuizContainer";

export const metadata: Metadata = {
  title: "Training Mode - Thai Driving Theory Test",
  description: "Practice with immediate feedback and explanations",
};

export default function TrainingPage() {
  return (
    <main>
      <QuizContainer mode="TRAINING" count={25} />
    </main>
  );
}
