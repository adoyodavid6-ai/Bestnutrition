"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import { EXPERIMENTS, assignVariant, experimentById } from "@/lib/experiments";

const VID_KEY = "nw:vid";

/** A random, first-party id used only to keep someone in the same experiment variant. */
function visitorId(): string {
  try {
    let id = window.localStorage.getItem(VID_KEY);
    if (!id) {
      id = crypto.randomUUID?.() ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
      window.localStorage.setItem(VID_KEY, id);
    }
    return id;
  } catch {
    return "anonymous";
  }
}

/** All running experiment assignments, sent with checkouts (exp_<id> metadata). */
export function experimentAssignments(): Record<string, string> {
  const vid = visitorId();
  return Object.fromEntries(EXPERIMENTS.filter((e) => e.status === "running").map((e) => [e.id, assignVariant(e, vid)]));
}

const exposed = new Set<string>();

/** The visitor's variant (null until mounted, so the server render always shows control). */
export function useVariant(id: string): string | null {
  const [variant, setVariant] = useState<string | null>(null);
  useEffect(() => {
    const e = experimentById(id);
    if (!e) return;
    const v = assignVariant(e, visitorId());
    setVariant(v);
    if (e.status === "running" && !exposed.has(id)) {
      exposed.add(id);
      track("experiment_exposure", { experiment: id, variant: v });
    }
  }, [id]);
  return variant;
}
