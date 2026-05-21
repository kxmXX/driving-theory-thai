import type { Metadata } from "next";
import QuizContainer from "@/components/QuizContainer";

export const metadata: Metadata = {
  title: "Review Mistakes - Thai Driving Theory Test",
  description: "Focus on questions you got wrong",
};

export default function ReviewPage() {
  return (
    <main>
      <QuizContainer mode="REVIEW" count={20} />
    </main>
  );
}
