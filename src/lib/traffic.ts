/**
 * Optional traffic figures from the Plausible Stats API (PLAUSIBLE_API_KEY). Analytics only run
 * for visitors who allow them, so these counts are a lower bound and "per visit" figures are
 * upper bounds; the dashboard says so.
 */
export function trafficConfig(env: Record<string, string | undefined> = process.env) {
  return {
    apiKey: env.PLAUSIBLE_API_KEY?.trim() || undefined,
    site: env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN?.trim() || undefined,
    base: env.PLAUSIBLE_API_BASE?.trim() || "https://plausible.io",
  };
}

type Row = { [k: string]: string | number };

async function get(path: string, params: Record<string, string>, c: ReturnType<typeof trafficConfig>) {
  const q = new URLSearchParams({ site_id: c.site!, ...params });
  const res = await fetch(`${c.base}/api/v1/stats/${path}?${q}`, { headers: { authorization: `Bearer ${c.apiKey}` }, cache: "no-store", signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`Plausible responded ${res.status}`);
  return (await res.json()) as { results: Row | Row[] };
}

export interface LandingRow {
  page: string;
  visitors: number;
  signups: number;
  checkouts: number;
}

export async function loadTraffic(days: number, c = trafficConfig()) {
  if (!c.apiKey || !c.site) return { configured: false as const };
  const period = { period: "custom", date: `${new Date(Date.now() - days * 86400_000).toISOString().slice(0, 10)},${new Date().toISOString().slice(0, 10)}` };
  try {
    const [agg, entry, signups, checkouts] = await Promise.all([
      get("aggregate", { ...period, metrics: "visitors,visits" }, c),
      get("breakdown", { ...period, property: "visit:entry_page", metrics: "visitors", limit: "15" }, c),
      get("breakdown", { ...period, property: "visit:entry_page", metrics: "visitors", filters: "event:goal==newsletter_signup", limit: "100" }, c),
      get("breakdown", { ...period, property: "visit:entry_page", metrics: "visitors", filters: "event:goal==checkout_started", limit: "100" }, c),
    ]);
    const a = agg.results as Row & { visitors: { value: number }; visits: { value: number } };
    const count = (rows: Row[], page: string) => Number(rows.find((r) => r.entry_page === page)?.visitors ?? 0);
    const landing: LandingRow[] = (entry.results as Row[]).map((r) => ({ page: String(r.entry_page), visitors: Number(r.visitors), signups: count(signups.results as Row[], String(r.entry_page)), checkouts: count(checkouts.results as Row[], String(r.entry_page)) }));
    return { configured: true as const, visitors: Number((a.visitors as unknown as { value: number }).value), visits: Number((a.visits as unknown as { value: number }).value), landing };
  } catch (e) {
    return { configured: true as const, error: e instanceof Error ? e.message : "Plausible request failed" };
  }
}
