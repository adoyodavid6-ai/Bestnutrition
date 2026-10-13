import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getRecipe } from "@/content/recipes";
import { ENTITLEMENT_COOKIE } from "@/lib/billing/entitlement";
import { applyToken, resolvePlan } from "@/lib/billing/server";
import { planToCsv, planToIcs, shoppingToCsv, type ExportRecipe } from "@/lib/export";
import { calculateRecipeNutrition } from "@/lib/nutrition";
import type { MealPlan } from "@/lib/planner";
import type { ShoppingItem } from "@/lib/shopping";
import { absoluteUrl } from "@/lib/site";
import { clientIp, rateLimited } from "@/lib/rate-limit";

const slot = z.enum(["breakfast", "lunch", "dinner", "supper", "snack"]);
const planSchema = z.object({
  id: z.string().max(80),
  name: z.string().max(120),
  days: z
    .array(
      z.object({
        label: z.string().max(20),
        entries: z.array(z.object({ id: z.string().max(80), slot, recipeSlug: z.string().max(120).optional(), customTitle: z.string().max(160).optional(), servings: z.number().min(1).max(50), prepared: z.boolean() })).max(10),
      }),
    )
    .max(7),
});
const itemSchema = z.object({
  key: z.string().max(200),
  name: z.string().max(200),
  qty: z.number().min(0).max(1e6),
  unit: z.string().max(20),
  category: z.string().max(40),
  checked: z.boolean(),
  recipes: z.array(z.string().max(200)).max(30),
  price: z.number().min(0).max(1e7).optional(),
  note: z.string().max(300).optional(),
});
const body = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("plan-csv"), plan: planSchema }),
  z.object({ kind: z.literal("plan-ics"), plan: planSchema, weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }),
  z.object({ kind: z.literal("shopping-csv"), items: z.array(itemSchema).max(500), units: z.enum(["metric", "us"]).default("metric") }),
]);

function lookup(slug: string): ExportRecipe | undefined {
  const r = getRecipe(slug);
  if (!r) return undefined;
  const n = calculateRecipeNutrition(r).perServing;
  return { title: r.title, totalMin: r.prepMin + r.cookMin, kcal: n.kcal, protein: n.protein, url: absoluteUrl(`/recipes/${r.slug}`) };
}

/** Premium feature, enforced here on the server: exporting plans and lists. */
export async function POST(req: NextRequest) {
  const state = await resolvePlan(req.cookies.get(ENTITLEMENT_COOKIE)?.value);
  if (state.plan !== "premium") {
    return applyToken(NextResponse.json({ ok: false, premiumRequired: true, message: "Exporting plans and lists is a Premium feature." }, { status: 402 }), state.token);
  }
  if (rateLimited(`export:${clientIp(req.headers)}`, 60, 10 * 60 * 1000)) return NextResponse.json({ ok: false, message: "Too many exports. Please wait a few minutes." }, { status: 429 });
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: "Invalid export request." }, { status: 400 });
  const input = parsed.data;

  let content: string;
  let type: string;
  let filename: string;
  if (input.kind === "plan-csv") {
    content = planToCsv(input.plan as unknown as MealPlan, lookup);
    type = "text/csv; charset=utf-8";
    filename = "nourishwell-meal-plan.csv";
  } else if (input.kind === "plan-ics") {
    content = planToIcs(input.plan as unknown as MealPlan, input.weekStart, lookup);
    type = "text/calendar; charset=utf-8";
    filename = "nourishwell-meal-plan.ics";
  } else {
    content = shoppingToCsv(input.items as unknown as ShoppingItem[], input.units);
    type = "text/csv; charset=utf-8";
    filename = "nourishwell-shopping-list.csv";
  }
  const res = new NextResponse(content, { headers: { "content-type": type, "content-disposition": `attachment; filename="${filename}"`, "cache-control": "no-store" } });
  return applyToken(res as NextResponse, state.token);
}
