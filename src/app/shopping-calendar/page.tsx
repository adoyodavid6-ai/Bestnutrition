import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHead } from "@/components/Editorial";
import { ShoppingCalendar } from "@/components/shopping/ShoppingCalendar";

export const metadata: Metadata = {
  title: "Shopping Calendar",
  description: "Set a regular shopping day — weekly, every two, three or four weeks — and your shopping list appears on the homepage when it's time to shop.",
  robots: { index: false },
  alternates: { canonical: "/shopping-calendar" },
};

export default function ShoppingCalendarPage() {
  return (
    <>
      <Breadcrumbs
        items={[
          { href: "/shopping-list", label: "Shopping list" },
          { href: "/shopping-calendar", label: "Shopping calendar" },
        ]}
      />
      <PageHead
        eyebrow="Shopping calendar"
        title="Shop on a rhythm that suits you"
        lede="Pick your shopping day and how often you go. When it's time to shop, your list appears at the top of the homepage — ready to tick off."
      />
      <div className="container" style={{ paddingBottom: 48 }}>
        <ShoppingCalendar />
      </div>
    </>
  );
}
