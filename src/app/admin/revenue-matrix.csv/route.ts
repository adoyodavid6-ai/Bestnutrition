import { matrixToCsv } from "@/lib/commerce/revenue-matrix";

export const dynamic = "force-dynamic";

/** Protected by the /admin Basic Auth middleware. */
export function GET() {
  return new Response(matrixToCsv(), {
    headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": 'attachment; filename="nourishwell-feature-revenue-matrix.csv"', "cache-control": "no-store" },
  });
}
