"use client";

import Link from "next/link";
import { useState } from "react";
import { getIngredient } from "@/content/ingredients";
import { formatQuantity, scaleQuantity } from "@/lib/units";
import { useUserPrefs } from "@/lib/user-prefs";
import { KEYS, useStored } from "@/lib/storage";
import { buildShoppingList, sortShoppingItems, type ShoppingItem } from "@/lib/shopping";
import type { Recipe } from "@/lib/types";
import { toast } from "../Toaster";
import { Icon } from "../Icon";

export function RecipeIngredients({ recipe }: { recipe: Recipe }) {
  const { prefs, update } = useUserPrefs();
  const [servings, setServings] = useState(recipe.servings);
  const [, setShopping] = useStored<ShoppingItem[]>(KEYS.shopping, []);

  const addToList = () => {
    const generated = buildShoppingList([{ recipe, servings }]);
    setShopping((existing) => {
      // Add quantities to matching lines instead of replacing them.
      const map = new Map(existing.map((i) => [i.key, { ...i }]));
      for (const g of generated) {
        const e = map.get(g.key);
        if (e && !e.custom) {
          e.qty += g.qty;
          if (!e.recipes.includes(recipe.title)) e.recipes = [...e.recipes, recipe.title];
          e.checked = false;
        } else map.set(g.key, g);
      }
      return sortShoppingItems([...map.values()]);
    });
    toast(`Added ingredients for ${servings} servings to your shopping list`);
  };

  return (
    <section aria-labelledby="ingredients-heading">
      <div className="spread" style={{ marginBottom: 12 }}>
        <h2 id="ingredients-heading" style={{ margin: 0, fontSize: "var(--fs-xl)" }}>
          Ingredients
        </h2>
        <div className="seg" role="group" aria-label="Measurement units">
          <button type="button" aria-pressed={prefs.units === "metric"} onClick={() => update({ units: "metric" })}>
            Metric
          </button>
          <button type="button" aria-pressed={prefs.units === "us"} onClick={() => update({ units: "us" })}>
            US
          </button>
        </div>
      </div>
      <div className="row" style={{ marginBottom: 12 }}>
        <span className="label" id="servings-label">
          Servings
        </span>
        <div className="servings-control" role="group" aria-labelledby="servings-label">
          <button type="button" aria-label="Fewer servings" onClick={() => setServings((s) => Math.max(1, s - 1))} disabled={servings <= 1}>
            −
          </button>
          <output aria-live="polite">{servings}</output>
          <button type="button" aria-label="More servings" onClick={() => setServings((s) => Math.min(24, s + 1))}>
            +
          </button>
        </div>
        {servings !== recipe.servings && (
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => setServings(recipe.servings)}>
            Reset to {recipe.servings}
          </button>
        )}
      </div>
      <ul className="ingredient-list">
        {recipe.ingredients.map((line, i) => {
          const ing = getIngredient(line.id);
          const qty = scaleQuantity(line.qty, recipe.servings, servings);
          return (
            <li key={`${line.id}-${i}`}>
              <span className="qty">{formatQuantity(qty, line.unit, prefs.units)}</span>
              <span>
                {ing.name}
                {line.note && <span className="note">, {line.note}</span>}
                {line.optional && <span className="note"> (optional)</span>}
                {ing.altNames && ing.altNames.length > 0 && <span className="note xs" style={{ display: "block" }}>Also known as: {ing.altNames.join(", ")}</span>}
              </span>
            </li>
          );
        })}
      </ul>
      {servings !== recipe.servings && (
        <p className="xs muted" style={{ marginTop: 8 }}>
          Quantities are scaled from the original {recipe.servings} servings and rounded. Cooking times and pan sizes may need adjusting for large changes.
        </p>
      )}
      <div className="row no-print" style={{ marginTop: 16 }}>
        <button type="button" className="btn btn-primary btn-sm" onClick={addToList}>
          <Icon name="cart" size={16} /> Add to shopping list
        </button>
        <Link href="/shopping-list" className="link-arrow small">
          View list
        </Link>
      </div>
    </section>
  );
}
