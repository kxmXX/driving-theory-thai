import type { Metadata } from "next";
import { notFound } from "next/navigation";
import QuizContainer from "@/components/QuizContainer";
import { Category } from "@/types";
import { getCategoryLabel } from "@/lib/quiz-engine";

const VALID_CATEGORIES: Category[] = [
  "road_signs",
  "traffic_rules",
  "speed_limits",
  "alcohol_drugs",
  "documents",
  "safety_distances",
  "motorcycle",
  "emergency",
];

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  return VALID_CATEGORIES.map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = category as Category;
  const label = getCategoryLabel(cat);
  return {
    title: `${label} - Practice - Thai Driving Theory Test`,
    description: `Practice ${label} questions for the Thailand driving theory exam`,
  };
}

export default async function CategoryPracticePage({ params }: Props) {
  const { category } = await params;
  const cat = category as Category;
  if (!VALID_CATEGORIES.includes(cat)) {
    notFound();
  }

  return (
    <main>
      <QuizContainer mode="THEMATIC" categoryFilter={cat} count={15} />
    </main>
  );
}
