import type { GoalId } from "@/lib/types";

export const GOALS: { id: GoalId; title: string; description: string }[] = [
  { id: "heart-health", title: "Heart health", description: "Lower in salt and saturated fat, rich in fibre and unsaturated fats." },
  { id: "blood-sugar", title: "Steady energy", description: "Fibre-rich carbohydrates paired with protein." },
  { id: "high-fibre", title: "More fibre", description: "Legumes, whole grains and vegetables." },
  { id: "high-protein", title: "More protein", description: "Beans, fish, eggs, poultry and tofu." },
  { id: "budget", title: "Save money", description: "Affordable staples, minimal waste." },
  { id: "quick", title: "Save time", description: "Quick to cook, easy to clean up." },
  { id: "family", title: "Family-friendly", description: "Crowd-pleasers that scale up easily." },
  { id: "plant-forward", title: "Plant-forward", description: "More plants, less meat." },
];
