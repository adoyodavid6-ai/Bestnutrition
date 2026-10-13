"use client";

import Link from "next/link";
import { useState } from "react";
import { KEYS, useStored } from "@/lib/storage";
import { CATEGORY_LABELS, CATEGORY_ORDER, estimateTotal, groupByCategory, sortShoppingItems, type ShoppingItem } from "@/lib/shopping";
import { formatBaseQuantity } from "@/lib/units";
import { formatMoney, useUserPrefs } from "@/lib/user-prefs";
import type { IngredientCategory, Unit } from "@/lib/types";
import { Icon } from "./Icon";
import { toast } from "./Toaster";

const UNITS: Unit[] = ["piece", "g", "ml", "tsp", "tbsp", "handful", "pinch"];

function ItemRow({ item, currency, units, onChange, onRemove }: { item: ShoppingItem; currency: string; units: "metric" | "us"; onChange: (i: ShoppingItem) => void; onRemove: () => void }) {
  const [editing, setEditing] = useState(false);
  const qtyLabel = formatBaseQuantity(item.qty, item.unit, units);
  return (
    <li className={`shop-item${item.checked ? " checked" : ""}`} style={{ margin: 0 }}>
      <input type="checkbox" checked={item.checked} onChange={(e) => onChange({ ...item, checked: e.target.checked })} aria-label={`Got ${item.name}`} />
      <div>
        {editing ? (
          <form
            className="row"
            onSubmit={(e) => {
              e.preventDefault();
              setEditing(false);
            }}
          >
            {item.custom && (
              <input className="input" style={{ flex: "2 1 140px", minHeight: 36 }} aria-label="Item name" value={item.name} onChange={(e) => onChange({ ...item, name: e.target.value.slice(0, 80) })} />
            )}
            <input
              className="input"
              style={{ width: 90, minHeight: 36 }}
              type="number"
              min={0}
              step="any"
              aria-label="Quantity"
              value={Number(item.qty.toFixed(2))}
              onChange={(e) => onChange({ ...item, qty: Math.max(0, Number(e.target.value) || 0) })}
            />
            <select className="select" style={{ width: "auto", minHeight: 36 }} aria-label="Unit" value={item.unit} onChange={(e) => onChange({ ...item, unit: e.target.value as Unit })}>
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
            <button className="btn btn-sm btn-primary" type="submit">
              Done
            </button>
          </form>
        ) : (
          <>
            <span className="name">
              <strong>{qtyLabel}</strong> {item.name}
            </span>
            <div className="xs muted">
              {item.recipes.length > 0 ? `For ${item.recipes.join(", ")}` : "Added by you"}
              {item.note ? ` · ${item.note}` : ""}
            </div>
            <div className="row no-print" style={{ gap: 6, marginTop: 4 }}>
              <button type="button" className="btn btn-sm btn-ghost" style={{ minHeight: 28, padding: "2px 10px" }} onClick={() => setEditing(true)}>
                Edit
              </button>
              <button type="button" className="btn btn-sm btn-ghost" style={{ minHeight: 28, padding: "2px 10px" }} onClick={onRemove} aria-label={`Remove ${item.name}`}>
                Remove
              </button>
            </div>
          </>
        )}
      </div>
      <div className="no-print">
        <label className="sr-only" htmlFor={`price-${item.key}`}>
          Price you paid or expect to pay for {item.name}, in {currency}
        </label>
        <input
          id={`price-${item.key}`}
          className="input price"
          type="number"
          min={0}
          step="any"
          inputMode="decimal"
          placeholder="Price"
          value={item.price ?? ""}
          onChange={(e) => onChange({ ...item, price: e.target.value === "" ? undefined : Math.max(0, Number(e.target.value)) })}
        />
      </div>
    </li>
  );
}

export function ShoppingList() {
  const [items, setItems, hydrated] = useStored<ShoppingItem[]>(KEYS.shopping, []);
  const { prefs, update } = useUserPrefs();
  const [grouped, setGrouped] = useState(true);
  const [newName, setNewName] = useState("");
  const [newCat, setNewCat] = useState<IngredientCategory | "other">("other");

  if (!hydrated) return <div className="card" aria-busy="true" style={{ minHeight: 300 }} />;

  const done = items.filter((i) => i.checked).length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;
  const totals = estimateTotal(items);
  const change = (next: ShoppingItem) => setItems((all) => all.map((i) => (i.key === next.key ? next : i)));
  const remove = (key: string) => setItems((all) => all.filter((i) => i.key !== key));

  const asText = () =>
    groupByCategory(items)
      .map((g) => `${g.label}\n${g.items.map((i) => `${i.checked ? "✓" : "○"} ${formatBaseQuantity(i.qty, i.unit, prefs.units)} ${i.name}`).join("\n")}`)
      .join("\n\n");

  const share = async () => {
    const text = `My NourishWell shopping list\n\n${asText()}`;
    try {
      if (navigator.share) await navigator.share({ title: "Shopping list", text });
      else {
        await navigator.clipboard.writeText(text);
        toast("Shopping list copied — paste it into a message");
      }
    } catch {
      /* cancelled */
    }
  };

  if (items.length === 0)
    return (
      <div className="empty-state">
        <Icon name="cart" size={40} className="muted" />
        <h2 style={{ marginTop: 12 }}>Your shopping list is empty</h2>
        <p className="muted">Add ingredients from any recipe, or turn your weekly meal plan into a consolidated list.</p>
        <div className="row" style={{ justifyContent: "center" }}>
          <Link href="/meal-planner" className="btn btn-primary">
            Open meal planner
          </Link>
          <Link href="/recipes" className="btn btn-ghost">
            Browse recipes
          </Link>
        </div>
      </div>
    );

  const renderList = (list: ShoppingItem[]) => (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {list.map((i) => (
        <ItemRow key={i.key} item={i} currency={prefs.currency} units={prefs.units} onChange={change} onRemove={() => remove(i.key)} />
      ))}
    </ul>
  );

  return (
    <div className="grid" style={{ gridTemplateColumns: "minmax(0,1fr)", gap: 24 }}>
      <div className="card no-print">
        <div className="spread">
          <div style={{ flex: "1 1 240px" }}>
            <strong>
              {done} of {items.length} items
            </strong>
            <div className="progress" style={{ marginTop: 8 }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Shopping progress">
              <span style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className="row">
            <div className="seg" role="group" aria-label="Measurement units">
              <button type="button" aria-pressed={prefs.units === "metric"} onClick={() => update({ units: "metric" })}>
                Metric
              </button>
              <button type="button" aria-pressed={prefs.units === "us"} onClick={() => update({ units: "us" })}>
                US
              </button>
            </div>
            <button type="button" className="btn btn-ghost btn-sm" aria-pressed={grouped} onClick={() => setGrouped((g) => !g)}>
              Group by aisle
            </button>
          </div>
        </div>
        <div className="row" style={{ marginTop: 16 }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => window.print()}>
            <Icon name="print" size={16} /> Print
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={share}>
            <Icon name="share" size={16} /> Share
          </button>
          <Link href="/shopping-calendar" className="btn btn-ghost btn-sm">
            <Icon name="calendar" size={16} /> Shopping calendar
          </Link>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setItems((all) => all.filter((i) => !i.checked))} disabled={done === 0}>
            Remove ticked items
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              if (window.confirm("Clear the whole shopping list?")) setItems([]);
            }}
          >
            Clear list
          </button>
        </div>
      </div>

      <form
        className="card no-print"
        onSubmit={(e) => {
          e.preventDefault();
          const name = newName.trim();
          if (!name) return;
          setItems((all) => sortShoppingItems([...all, { key: `custom|${Date.now()}`, name: name.slice(0, 80), qty: 1, unit: "piece", category: newCat, checked: false, custom: true, recipes: [] }]));
          setNewName("");
        }}
      >
        <div className="row" style={{ alignItems: "flex-end" }}>
          <div className="field" style={{ flex: "2 1 220px", margin: 0 }}>
            <label htmlFor="new-item">Add an item</label>
            <input id="new-item" className="input" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Tea leaves" maxLength={80} />
          </div>
          <div className="field" style={{ flex: "1 1 160px", margin: 0 }}>
            <label htmlFor="new-cat">Aisle</label>
            <select id="new-cat" className="select" value={newCat} onChange={(e) => setNewCat(e.target.value as IngredientCategory | "other")}>
              {CATEGORY_ORDER.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" type="submit">
            Add
          </button>
        </div>
      </form>

      <div className="card">
        {grouped
          ? groupByCategory(items).map((g) => (
              <section key={g.category} className="shop-group" aria-labelledby={`cat-${g.category}`}>
                <h3 id={`cat-${g.category}`}>{g.label}</h3>
                {renderList(g.items)}
              </section>
            ))
          : renderList([...items].sort((a, b) => a.name.localeCompare(b.name)))}
      </div>

      <div className="card card-muted">
        <h2 style={{ fontSize: "var(--fs-xl)" }}>Your cost estimate</h2>
        <p className="small muted">
          NourishWell doesn&apos;t yet have verified grocery prices for your area, so we never guess. Enter what items cost where you shop and we&apos;ll add them up. Prices stay on this device.
        </p>
        <div className="spread">
          <div className="field" style={{ margin: 0 }}>
            <label htmlFor="currency">Currency</label>
            <select id="currency" className="select" value={prefs.currency} onChange={(e) => update({ currency: e.target.value })}>
              {["USD", "GBP", "EUR", "JPY", "KRW", "CNY", "SGD", "MYR", "THB", "VND", "PHP", "HKD", "KES", "TZS", "UGX", "ETB", "NGN", "ZAR", "AED", "INR", "CAD", "AUD", "BRL", "MXN", "SOS"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="serif" style={{ fontSize: "2rem", color: "var(--violet)" }}>
              {formatMoney(totals.total, prefs.currency)}
            </div>
            <div className="xs muted">
              Your estimate from {totals.priced} of {items.length} items · {totals.unpriced} not priced
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
