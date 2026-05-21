import type { Metadata } from "next";
import FlashcardContainer from "@/components/FlashcardContainer";

export const metadata: Metadata = {
  title: "Flashcards - Thai Driving Theory Test",
  description: "Study with flashcards: question on the front, answer on the back",
};

export default function FlashcardsPage() {
  return (
    <main>
      <FlashcardContainer />
    </main>
  );
}
