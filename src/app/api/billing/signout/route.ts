import { NextResponse } from "next/server";
import { applyToken } from "@/lib/billing/server";

/** Removes Premium from this browser only. It does not cancel the subscription. */
export async function POST() {
  return applyToken(NextResponse.json({ ok: true }), null);
}
