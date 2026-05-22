import type { Metadata } from "next";
import UltimateQuiz from "@/components/UltimateQuiz";

export const metadata: Metadata = {
  title: "Ultimate Review - Thai Driving Theory Test",
  description: "Non-stop adaptive training with spaced repetition for maximum progress",
};

export default function UltimatePage() {
  return <UltimateQuiz />;
}
