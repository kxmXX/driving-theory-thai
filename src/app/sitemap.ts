import { MetadataRoute } from "next";
import { Category } from "@/types";

export const dynamic = "force-static";

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

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://thaidrivingtest.vercel.app";

  const staticPages = [
    "/",
    "/exam/",
    "/practice/",
    "/practice/training/",
    "/practice/blitz/",
    "/review/",
    "/stats/",
    "/learn/",
  ];

  const dynamicPages = [
    ...CATEGORIES.map((cat) => `/practice/${cat}/`),
    ...CATEGORIES.map((cat) => `/learn/${cat}/`),
  ];

  return [...staticPages, ...dynamicPages].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly",
    priority: path === "/" ? 1.0 : 0.8,
  }));
}
