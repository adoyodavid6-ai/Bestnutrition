export const site = {
  name: "NourishWell",
  tagline: "Eat Better. Feel Stronger. Live Well.",
  description:
    "Delicious recipes, practical nutrition guidance, personalised meal planning and evidence-informed health education — designed around real life, real budgets and food cultures from around the world.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  locale: "en",
};

export const primaryNav = [
  { href: "/discover", label: "Discover" },
  { href: "/recipes", label: "Recipes" },
  { href: "/nutrition", label: "Nutrition" },
  { href: "/health-conditions", label: "Health Conditions" },
  { href: "/meal-planner", label: "Meal Planner" },
  { href: "/fitness", label: "Fitness & Wellness" },
  { href: "/supplements", label: "Supplements" },
  { href: "/professionals", label: "Professionals" },
  { href: "/for-businesses", label: "For Businesses" },
];

export const footerNav = [
  {
    title: "Eat well",
    links: [
      { href: "/recipes", label: "Recipe library" },
      { href: "/discover", label: "Collections" },
      { href: "/meal-planner", label: "Meal planner" },
      { href: "/shopping-list", label: "Shopping list" },
      { href: "/search", label: "Search" },
    ],
  },
  {
    title: "Learn",
    links: [
      { href: "/nutrition", label: "Nutrition education" },
      { href: "/health-conditions", label: "Health conditions" },
      { href: "/supplements", label: "Supplements" },
      { href: "/fitness", label: "Fitness" },
      { href: "/wellness", label: "Wellness & lifestyle" },
    ],
  },
  {
    title: "Community",
    links: [
      { href: "/professionals", label: "Find a professional" },
      { href: "/businesses", label: "Business directory" },
      { href: "/for-businesses", label: "List your business" },
      { href: "/pricing", label: "Free & Premium" },
    ],
  },
  {
    title: "NourishWell",
    links: [
      { href: "/about", label: "About" },
      { href: "/editorial-policy", label: "Editorial policy" },
      { href: "/medical-disclaimer", label: "Medical disclaimer" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/accessibility", label: "Accessibility" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export function absoluteUrl(path: string) {
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}
