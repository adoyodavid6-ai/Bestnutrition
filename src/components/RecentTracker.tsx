"use client";

import { useEffect } from "react";
import { KEYS, readStored, writeStored } from "@/lib/storage";
import { track, type ProductEvent } from "@/lib/analytics";

export interface RecentItem {
  href: string;
  title: string;
  kind: string;
  at: string;
}

/** Records a page in "recently viewed" on this device (max 12). */
export function RecentTracker({ href, title, kind, event }: { href: string; title: string; kind: string; event?: ProductEvent }) {
  useEffect(() => {
    const list = readStored<RecentItem[]>(KEYS.recent, []).filter((r) => r.href !== href);
    writeStored(KEYS.recent, [{ href, title, kind, at: new Date().toISOString() }, ...list].slice(0, 12));
    if (event) track(event);
  }, [href, title, kind, event]);
  return null;
}
