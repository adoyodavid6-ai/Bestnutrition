import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageHead } from "@/components/Editorial";
import { ShoppingList } from "@/components/ShoppingList";

export const metadata: Metadata = {
  title: "Shopping List",
  description: "Your consolidated, editable shopping list — grouped by aisle, with check-off, printing, sharing and your own price estimates.",
  robots: { index: false },
  alternates: { canonical: "/shopping-list" },
};

export default function ShoppingListPage() {
  return (
    <>
      <Breadcrumbs items={[{ href: "/shopping-list", label: "Shopping list" }]} />
      <PageHead eyebrow="Shopping list" title="Everything you need, once" lede="Ingredients from your recipes and meal plan, combined and grouped by aisle. Tick items off as you shop." />
      <div className="container" style={{ paddingBottom: 48, maxWidth: 900 }}>
        <ShoppingList />
      </div>
    </>
  );
}
