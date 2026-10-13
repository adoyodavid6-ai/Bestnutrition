import { OG_SIZE, ogCard } from "@/lib/og";

export const alt = "NourishWell — Eat Better. Feel Stronger. Live Well.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogCard({ eyebrow: "Recipes · Meal plans · Nutrition", title: "Feel Better Starts on Your Plate.", facts: ["Free weekly meal planner", "Transparent nutrition"] });
}
