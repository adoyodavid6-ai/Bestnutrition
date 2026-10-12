import { NextResponse, type NextRequest } from "next/server";

/**
 * Protects /admin with HTTP Basic Auth using ADMIN_USERNAME / ADMIN_PASSWORD.
 * If either is unset, the admin area is disabled entirely (404) — it is never left open.
 * Replace with role-based auth (see docs/ARCHITECTURE.md) when accounts are introduced.
 */

function safeEqual(a: string, b: string) {
  // Constant-time comparison over the longer length to avoid leaking length/position via timing.
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

export function middleware(req: NextRequest) {
  const user = process.env.ADMIN_USERNAME;
  const pass = process.env.ADMIN_PASSWORD;
  if (!user || !pass) {
    return new NextResponse("Not found", { status: 404 });
  }

  const header = req.headers.get("authorization") ?? "";
  const [scheme, encoded] = header.split(" ");
  if (scheme === "Basic" && encoded) {
    try {
      const decoded = atob(encoded);
      const idx = decoded.indexOf(":");
      const u = decoded.slice(0, idx);
      const p = decoded.slice(idx + 1);
      if (idx > 0 && safeEqual(u, user) && safeEqual(p, pass)) {
        const res = NextResponse.next();
        res.headers.set("Cache-Control", "no-store");
        res.headers.set("X-Robots-Tag", "noindex, nofollow");
        return res;
      }
    } catch {
      // fall through to challenge
    }
  }
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="NourishWell admin", charset="UTF-8"', "Cache-Control": "no-store" },
  });
}

export const config = { matcher: ["/admin", "/admin/:path*"] };
