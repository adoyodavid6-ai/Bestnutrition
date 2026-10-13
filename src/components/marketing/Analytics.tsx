"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution-client";
import { KEYS, useStored } from "@/lib/storage";

const DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
const SRC = process.env.NEXT_PUBLIC_PLAUSIBLE_SRC || "https://plausible.io/js/script.js";

/**
 * Records first-touch attribution in this browser, and loads the analytics script only after
 * the visitor allows analytics and a provider is configured.
 */
export function Analytics() {
  const [consent] = useStored<string | null>(KEYS.consent, null);

  useEffect(() => {
    captureAttribution();
  }, []);

  useEffect(() => {
    if (consent !== "granted" || !DOMAIN || document.getElementById("nw-analytics")) return;
    window.plausible ??= Object.assign((...args: unknown[]) => void (window.plausible!.q ??= []).push(args), {});
    const s = document.createElement("script");
    s.id = "nw-analytics";
    s.defer = true;
    s.src = SRC;
    s.dataset.domain = DOMAIN;
    document.head.appendChild(s);
  }, [consent]);

  return null;
}
