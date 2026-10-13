import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { billingConfig } from "@/lib/billing/config";
import { verifyDownload } from "@/lib/commerce/delivery";
import { productBySlug } from "@/lib/commerce/products";
import { rateLimited } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** Serves a purchased file. Files are outside /public and only reachable with a valid signed token. */
export async function GET(req: NextRequest) {
  const secret = billingConfig().entitlementSecret;
  const token = req.nextUrl.searchParams.get("token");
  const grant = secret ? verifyDownload(token, secret) : null;
  if (!grant) return NextResponse.json({ ok: false, message: "This download link has expired or isn't valid." }, { status: 403 });
  const product = productBySlug(grant.slug);
  const file = product?.files[Number(req.nextUrl.searchParams.get("file"))];
  if (!product || !file) return NextResponse.json({ ok: false, message: "File not found." }, { status: 404 });
  if (rateLimited(`dl:${grant.session}`, 30, 24 * 3600 * 1000)) return NextResponse.json({ ok: false, message: "Download limit reached for today. Please contact us if you need help." }, { status: 429 });
  try {
    const data = await readFile(path.join(process.cwd(), "src/products/files", path.basename(file.file)));
    return new NextResponse(new Uint8Array(data), {
      headers: { "content-type": "application/pdf", "content-disposition": `attachment; filename="${path.basename(file.file)}"`, "cache-control": "private, no-store", "x-robots-tag": "noindex" },
    });
  } catch {
    return NextResponse.json({ ok: false, message: "The file is temporarily unavailable. Please contact us." }, { status: 500 });
  }
}
