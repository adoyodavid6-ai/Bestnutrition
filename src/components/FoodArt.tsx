import { getIngredient } from "@/content/ingredients";
import { mulberry32 } from "@/lib/planner";
import type { Ingredient, Recipe } from "@/lib/types";

/**
 * Editorial, ingredient-driven illustration for a recipe.
 * The composition is derived deterministically from the recipe's real ingredients, so each
 * dish has a distinct, recognisable "plate" without relying on stock photography.
 * Replace with licensed photography when available (see docs/CONTENT.md).
 */

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

type Rand = () => number;

function blobPath(rand: Rand, cx: number, cy: number, r: number, points = 9, jitter = 0.22) {
  const pts: [number, number][] = [];
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2;
    const rr = r * (1 - jitter / 2 + rand() * jitter);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  const mid = (a: [number, number], b: [number, number]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let d = "";
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const n = pts[(i + 1) % pts.length];
    const m = mid(p, n);
    if (i === 0) {
      const prev = pts[pts.length - 1];
      const m0 = mid(prev, p);
      d += `M${m0[0].toFixed(1)},${m0[1].toFixed(1)} `;
    }
    d += `Q${p[0].toFixed(1)},${p[1].toFixed(1)} ${m[0].toFixed(1)},${m[1].toFixed(1)} `;
  }
  return d + "Z";
}

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, ((n >> 16) & 255) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
  const b = Math.max(0, Math.min(255, (n & 255) + amt));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

const LEAFY = new Set(["collards", "kale", "spinach", "lettuce", "coriander", "parsley", "mint", "cabbage", "spring-onion"]);
const BACKGROUNDS = ["#e8dfd8", "#e3dcd2", "#dde1db", "#ebe2dd", "#e6ddd6", "#d9d6d0"];
const NAPKINS = ["#cdbfb6", "#aab2b0", "#d9c6bb", "#bfb3c7", "#c9d0c4"];

function Item({ ing, rand, cx, cy, scale }: { ing: Ingredient; rand: Rand; cx: number; cy: number; scale: number }) {
  const c = ing.color;
  const dark = shade(c, -28);
  const light = shade(c, 26);
  const out: React.ReactNode[] = [];
  const key = (i: number) => `${ing.id}-${i}`;

  if (ing.category === "grains" || ing.id === "plantain" || ing.id === "cassava" || ing.id === "potato" || ing.id === "sweet-potato" || ing.id === "butternut") {
    if (["white-rice", "brown-rice", "quinoa", "bulgur", "sweet-corn"].includes(ing.id)) {
      out.push(<path key={key(0)} d={blobPath(rand, cx, cy, 34 * scale, 10, 0.18)} fill={c} />);
      for (let i = 0; i < 26; i++) {
        const a = rand() * Math.PI * 2;
        const rr = rand() * 30 * scale;
        out.push(
          <ellipse key={key(i + 1)} cx={cx + Math.cos(a) * rr} cy={cy + Math.sin(a) * rr} rx={2.6 * scale} ry={1.3 * scale} transform={`rotate(${rand() * 180} ${cx + Math.cos(a) * rr} ${cy + Math.sin(a) * rr})`} fill={i % 3 ? light : dark} opacity={0.85} />,
        );
      }
    } else if (["wholewheat-bread", "wholewheat-pita", "corn-tortilla", "plain-flour", "sorghum-flour", "teff-flour"].includes(ing.id)) {
      for (let i = 0; i < 3; i++) {
        const x = cx + (i - 1) * 9 * scale;
        const y = cy + (i - 1) * 5 * scale;
        out.push(<ellipse key={key(i)} cx={x} cy={y} rx={30 * scale} ry={26 * scale} fill={i === 2 ? c : shade(c, 10 - i * 8)} stroke={dark} strokeOpacity={0.25} />);
      }
      for (let i = 0; i < 8; i++) out.push(<circle key={key(10 + i)} cx={cx + 9 * scale + (rand() - 0.5) * 36 * scale} cy={cy + 5 * scale + (rand() - 0.5) * 30 * scale} r={1.6 * scale} fill={dark} opacity={0.35} />);
    } else if (["potato", "sweet-potato", "butternut", "plantain", "cassava"].includes(ing.id)) {
      for (let i = 0; i < 7; i++) {
        const x = cx + (rand() - 0.5) * 50 * scale;
        const y = cy + (rand() - 0.5) * 44 * scale;
        out.push(<rect key={key(i)} x={x - 8 * scale} y={y - 8 * scale} width={16 * scale} height={15 * scale} rx={4 * scale} fill={c} stroke={dark} strokeOpacity={0.3} transform={`rotate(${rand() * 90} ${x} ${y})`} />);
      }
    } else {
      // dome of ugali / porridge, with a soft shadow so pale grains read against the plate
      out.push(<ellipse key={key(9)} cx={cx + 4 * scale} cy={cy + 6 * scale} rx={44 * scale} ry={40 * scale} fill="#6b5340" opacity={0.16} />);
      out.push(<path key={key(0)} d={blobPath(rand, cx, cy, 44 * scale, 9, 0.1)} fill={shade(c, -6)} stroke={shade(c, -40)} strokeOpacity={0.35} strokeWidth={1.2} />);
      out.push(<path key={key(1)} d={blobPath(rand, cx - 10 * scale, cy - 11 * scale, 20 * scale, 7, 0.2)} fill={light} opacity={0.8} />);
      for (let i = 0; i < 5; i++) {
        const a = rand() * Math.PI * 2;
        out.push(<path key={key(20 + i)} d={`M${cx + Math.cos(a) * 14 * scale},${cy + Math.sin(a) * 14 * scale} q${6 * scale},${-4 * scale} ${14 * scale},${-1 * scale}`} stroke={shade(c, -30)} strokeOpacity={0.3} strokeWidth={1} fill="none" />);
      }
    }
  } else if (ing.category === "legumes") {
    for (let i = 0; i < 30; i++) {
      const a = rand() * Math.PI * 2;
      const rr = Math.sqrt(rand()) * 32 * scale;
      const x = cx + Math.cos(a) * rr;
      const y = cy + Math.sin(a) * rr;
      const round = ing.id === "chickpeas" || ing.id === "green-grams" || ing.id === "peas";
      out.push(
        <ellipse key={key(i)} cx={x} cy={y} rx={(round ? 4.4 : 5.6) * scale} ry={(round ? 4.2 : 3.4) * scale} fill={i % 4 === 0 ? dark : c} transform={`rotate(${rand() * 180} ${x} ${y})`} />,
      );
      if (i % 3 === 0) out.push(<circle key={key(100 + i)} cx={x - 1.2 * scale} cy={y - 1.2 * scale} r={1.1 * scale} fill={light} opacity={0.8} />);
    }
  } else if (LEAFY.has(ing.id)) {
    const n = ing.id === "spring-onion" ? 10 : 8;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rand();
      const rr = rand() * 22 * scale;
      const x = cx + Math.cos(a) * rr;
      const y = cy + Math.sin(a) * rr;
      const len = (ing.id === "spring-onion" ? 7 : 18 + rand() * 8) * scale;
      const w = (ing.id === "spring-onion" ? 3.5 : 9) * scale;
      if (ing.id === "spring-onion") {
        out.push(<circle key={key(i)} cx={x} cy={y} r={w} fill="none" stroke={c} strokeWidth={2 * scale} />);
      } else {
        out.push(
          <g key={key(i)} transform={`rotate(${rand() * 360} ${x} ${y})`}>
            <path d={`M${x - len},${y} Q${x},${y - w * 1.4} ${x + len},${y} Q${x},${y + w * 1.4} ${x - len},${y} Z`} fill={i % 2 ? c : dark} opacity={0.95} />
            <path d={`M${x - len * 0.9},${y} L${x + len * 0.85},${y}`} stroke={light} strokeWidth={0.9 * scale} opacity={0.7} />
          </g>,
        );
      }
    }
  } else if (ing.category === "protein") {
    if (ing.id === "eggs") {
      const n = 3;
      for (let i = 0; i < n; i++) {
        const x = cx + (i - 1) * 24 * scale;
        const y = cy + (rand() - 0.5) * 14 * scale;
        out.push(<path key={key(i)} d={blobPath(rand, x, y, 15 * scale, 8, 0.25)} fill="#fbf8f0" stroke="#e8e0cf" />);
        out.push(<circle key={key(10 + i)} cx={x} cy={y} r={6 * scale} fill={c} />);
      }
    } else if (ing.id === "tofu") {
      for (let i = 0; i < 7; i++) {
        const x = cx + (rand() - 0.5) * 50 * scale;
        const y = cy + (rand() - 0.5) * 40 * scale;
        out.push(<rect key={key(i)} x={x - 8 * scale} y={y - 8 * scale} width={15 * scale} height={15 * scale} rx={2.5 * scale} fill={i % 2 ? c : "#e3c48f"} stroke="#cdb27c" strokeOpacity={0.5} transform={`rotate(${rand() * 60} ${x} ${y})`} />);
      }
    } else if (["salmon", "tilapia", "chicken-breast"].includes(ing.id)) {
      out.push(<path key={key(0)} d={blobPath(rand, cx, cy, 32 * scale, 7, 0.32)} fill={c} stroke={shade(c, -60)} strokeOpacity={0.35} strokeWidth={1.4} />);
      for (let i = 0; i < 5; i++) {
        const y = cy - 16 * scale + i * 8 * scale;
        out.push(<path key={key(i + 1)} d={`M${cx - 22 * scale},${y} q${22 * scale},${6 * scale} ${44 * scale},0`} stroke={light} strokeWidth={1.6 * scale} fill="none" opacity={0.75} />);
      }
    } else {
      for (let i = 0; i < 9; i++) {
        const x = cx + (rand() - 0.5) * 48 * scale;
        const y = cy + (rand() - 0.5) * 42 * scale;
        out.push(<path key={key(i)} d={blobPath(rand, x, y, 7.5 * scale, 6, 0.4)} fill={i % 3 ? c : dark} />);
      }
    }
  } else if (ing.category === "dairy") {
    out.push(<path key={key(0)} d={blobPath(rand, cx, cy, 20 * scale, 9, 0.3)} fill={c} stroke="#e7e0d4" />);
    out.push(<path key={key(1)} d={blobPath(rand, cx - 5 * scale, cy - 5 * scale, 7 * scale, 6, 0.3)} fill="#ffffff" opacity={0.9} />);
  } else if (ing.category === "fruit") {
    if (ing.id === "lemon" || ing.id === "lime") {
      const x = cx;
      const y = cy;
      out.push(<circle key={key(0)} cx={x} cy={y} r={13 * scale} fill={c} />);
      out.push(<circle key={key(1)} cx={x} cy={y} r={10.5 * scale} fill={light} />);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        out.push(<line key={key(2 + i)} x1={x} y1={y} x2={x + Math.cos(a) * 10 * scale} y2={y + Math.sin(a) * 10 * scale} stroke={c} strokeWidth={1.2 * scale} />);
      }
    } else {
      for (let i = 0; i < 8; i++) {
        const x = cx + (rand() - 0.5) * 52 * scale;
        const y = cy + (rand() - 0.5) * 46 * scale;
        const r = (ing.id === "berries" ? 5.5 : 9) * scale;
        out.push(<circle key={key(i)} cx={x} cy={y} r={r} fill={i % 3 ? c : dark} />);
        out.push(<circle key={key(20 + i)} cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.35} fill={light} opacity={0.6} />);
      }
    }
  } else if (ing.category === "nuts-seeds") {
    for (let i = 0; i < 26; i++) {
      const a = rand() * Math.PI * 2;
      const rr = Math.sqrt(rand()) * 24 * scale;
      out.push(<circle key={key(i)} cx={cx + Math.cos(a) * rr} cy={cy + Math.sin(a) * rr} r={(ing.id === "chia" ? 1.2 : 2.6) * scale} fill={i % 3 ? c : dark} />);
    }
  } else {
    // produce such as tomato, onion, carrot, pepper: slices and wedges
    for (let i = 0; i < 7; i++) {
      const x = cx + (rand() - 0.5) * 50 * scale;
      const y = cy + (rand() - 0.5) * 46 * scale;
      const r = (ing.id === "garlic" || ing.id === "green-chilli" ? 4 : 9) * scale;
      if (ing.id === "onion" || ing.id === "red-onion") {
        out.push(<circle key={key(i)} cx={x} cy={y} r={r} fill="none" stroke={c} strokeWidth={2.2 * scale} />);
        out.push(<circle key={key(30 + i)} cx={x} cy={y} r={r * 0.55} fill="none" stroke={c} strokeWidth={1.4 * scale} />);
      } else {
        out.push(<path key={key(i)} d={`M${x - r},${y} A${r},${r} 0 0 1 ${x + r},${y} Z`} fill={c} transform={`rotate(${rand() * 360} ${x} ${y})`} />);
        out.push(<circle key={key(30 + i)} cx={x} cy={y - r * 0.3} r={r * 0.22} fill={light} opacity={0.7} />);
      }
    }
  }
  return <g>{out}</g>;
}

export function FoodArt({ recipe, className, decorative = false }: { recipe: Recipe; className?: string; decorative?: boolean }) {
  const rand = mulberry32(hash(recipe.slug));
  const bg = BACKGROUNDS[Math.floor(rand() * BACKGROUNDS.length)];
  const napkin = NAPKINS[Math.floor(rand() * NAPKINS.length)];

  const lines = recipe.ingredients
    .map((l) => ({ l, ing: getIngredient(l.id) }))
    .filter(({ ing, l }) => !["water", "salt", "stock", "veg-oil", "olive-oil", "vinegar", "soy-sauce", "yeast", "sugar", "honey"].includes(ing.id) && ing.category !== "spices" && l.grams > 0);
  const main = [...lines].sort((a, b) => b.l.grams - a.l.grams).slice(0, 6);
  const sauce = lines.find(({ ing }) => ["canned-tomatoes", "coconut-milk", "tomato-paste"].includes(ing.id));
  const spices = recipe.ingredients.map((l) => getIngredient(l.id)).filter((i) => i.category === "spices");

  const isDrink = recipe.categories.includes("beverage");
  const isBowl = !isDrink && (recipe.categories.includes("soup") || /stew|wot|porridge|uji|githeri|maharagwe|ndengu|masala/i.test(recipe.title));
  const cx = 200 + (rand() - 0.5) * 24;
  const cy = 152 + (rand() - 0.5) * 12;
  const R = isDrink ? 74 : 112;

  const items = main.filter(({ ing }) => !sauce || ing.id !== sauce.ing.id);
  const n = Math.max(items.length, 1);
  const start = rand() * Math.PI * 2;

  const label = `Illustration of ${recipe.title}, showing ${main.slice(0, 4).map(({ ing }) => ing.name.toLowerCase().replace(/\s*\(.*?\)/g, "")).join(", ")}.`;

  const hasTurmeric = recipe.ingredients.some((l) => ["turmeric", "curry-powder"].includes(l.id));
  const sauceColor = sauce ? (sauce.ing.id === "coconut-milk" ? (hasTurmeric ? "#ecc76a" : "#e9dcc0") : sauce.ing.color) : undefined;
  const bowlFill = isBowl
    ? (sauceColor ?? shade(items.find(({ ing }) => ing.category === "legumes" || ing.category === "grains")?.ing.color ?? "#c9a27b", 10))
    : undefined;

  return (
    <svg viewBox="0 0 400 300" className={className} role={decorative ? undefined : "img"} aria-label={decorative ? undefined : label} aria-hidden={decorative || undefined} preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="300" fill={bg} />
      {Array.from({ length: 9 }).map((_, i) => (
        <line key={i} x1="0" y1={20 + i * 34 + rand() * 6} x2="400" y2={18 + i * 34 + rand() * 6} stroke="#000" strokeOpacity="0.025" strokeWidth="1.2" />
      ))}
      {/* napkin */}
      <g transform={`rotate(${-18 + rand() * 10} ${rand() > 0.5 ? 40 : 360} 40)`}>
        <rect x={rand() > 0.5 ? -40 : 300} y="-30" width="140" height="120" rx="6" fill={napkin} opacity="0.85" />
      </g>
      {/* cutlery */}
      <g opacity="0.9">
        <rect x={cx + R + 18} y={cy - 70} width="9" height="120" rx="4.5" fill="#cfc6bc" />
        <ellipse cx={cx + R + 22.5} cy={cy - 78} rx="13" ry="18" fill="#d8d0c6" />
      </g>
      {/* shadow */}
      <ellipse cx={cx + 6} cy={cy + 10} rx={R + 4} ry={R} fill="#3b2a24" opacity="0.10" />
      {isDrink ? (
        <g>
          <circle cx={cx} cy={cy} r={R} fill="#f8f5f0" stroke="#e2d9cf" strokeWidth="3" />
          <circle cx={cx} cy={cy} r={R - 12} fill={main[0]?.ing.color ?? "#f2a33a"} />
          <circle cx={cx - 16} cy={cy - 18} r={R - 44} fill="#ffffff" opacity="0.18" />
          <rect x={cx + 10} y={cy - R - 10} width="7" height={R + 10} rx="3" fill="#d9c9b5" transform={`rotate(28 ${cx} ${cy})`} />
          {main.slice(1, 4).map(({ ing }, i) => (
            <circle key={ing.id} cx={cx - R - 30 + i * 6} cy={cy + 60 - i * 54} r={14} fill={ing.color} />
          ))}
        </g>
      ) : (
        <g>
          <circle cx={cx} cy={cy} r={R} fill="#fbf8f3" stroke="#e7ded4" strokeWidth="1.5" />
          <circle cx={cx} cy={cy} r={R - 20} fill={isBowl ? bowlFill : "#f5f0e8"} stroke="#ebe3d8" strokeWidth="1" />
          {isBowl && <circle cx={cx - 24} cy={cy - 26} r={34} fill="#ffffff" opacity="0.10" />}
          {!isBowl && sauce && <path d={blobPath(rand, cx, cy, 74, 11, 0.16)} fill={sauceColor} opacity="0.9" />}
          {items.map(({ ing }, i) => {
            const centre = i === 0 && (ing.category === "grains" || ing.category === "legumes") && n > 2;
            const a = start + (i / n) * Math.PI * 2;
            const dist = centre ? 0 : n <= 2 ? 30 : 52;
            const x = cx + Math.cos(a) * dist;
            const y = cy + Math.sin(a) * dist;
            return <Item key={ing.id} ing={ing} rand={rand} cx={x} cy={y} scale={centre ? 1 : n > 4 ? 0.72 : 0.86} />;
          })}
        </g>
      )}
      {/* spices scattered on the table */}
      {spices.slice(0, 3).map((s, i) =>
        Array.from({ length: 14 }).map((_, j) => {
          const bx = 40 + i * 26 + rand() * 30;
          const by = 230 + rand() * 50;
          return <circle key={`${s.id}-${j}`} cx={bx} cy={by} r={1 + rand() * 1.6} fill={s.color} opacity={0.85} />;
        }),
      )}
    </svg>
  );
}
