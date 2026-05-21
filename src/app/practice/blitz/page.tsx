import type { Metadata } from "next";
import QuizContainer from "@/components/QuizContainer";

export const metadata: Metadata = {
  title: "Blitz Mode - Thai Driving Theory Test",
  description: "Quick 10-question practice session",
};

export default function BlitzPage() {
  return (
    <main>
      <QuizContainer mode="BLITZ" count={10} />
    </main>
  );
}
