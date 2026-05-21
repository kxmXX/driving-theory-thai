import type { Metadata } from "next";
import Link from "next/link";
import { Category } from "@/types";
import { getCategoryLabel, getCategoryColor } from "@/lib/quiz-engine";

export const metadata: Metadata = {
  title: "Study Guide - Thai Driving Theory Test",
  description: "Learn driving theory by category",
};

const CATEGORIES: Category[] = [
  "road_signs",
  "traffic_rules",
  "speed_limits",
  "alcohol_drugs",
  "documents",
  "safety_distances",
  "motorcycle",
  "emergency",
];

const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  road_signs: "Recognize and understand all official Thai road signs, signals, and markings.",
  traffic_rules: "Right-of-way, parking, turning, overtaking, and intersection rules.",
  speed_limits: "Maximum and minimum speeds for different road types and vehicles.",
  alcohol_drugs: "Legal blood alcohol limits, penalties, and drug-related driving laws.",
  documents: "Required licenses, registration, insurance, and point system.",
  safety_distances: "Safe following distances, braking distances, and tire safety.",
  motorcycle: "Motorcycle-specific rules, helmets, and rider safety.",
  emergency: "Accident procedures, first aid, and hazard warning protocols.",
};

export default function LearnPage() {
  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <h1 className="font-heading text-2xl font-bold mb-6">Study Guide</h1>

      <div className="space-y-3">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={`/learn/${cat}/`}
            className="card block p-4 transition hover:border-accent-blue"
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: getCategoryColor(cat) }}
              />
              <h2 className="font-heading font-semibold">{getCategoryLabel(cat)}</h2>
            </div>
            <p className="text-sm text-muted">{CATEGORY_DESCRIPTIONS[cat]}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
