"use client";

import type { Attribution } from "./billing/attribution";

/**
 * First-touch attribution, kept in this browser only. It is read when someone submits a form
 * or starts checkout, so we can tell which campaigns bring people who sign up. It never leaves
 * the browser on its own and contains no health information.
 */
const KEY = "nw:attribution";
const PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref"] as const;

export function captureAttribution(href = window.location.href, referrer = document.referrer) {
  try {
    if (window.localStorage.getItem(KEY)) return; // first touch wins
    const url = new URL(href);
    const a: Attribution = {};
    for (const p of PARAMS) {
      const v = url.searchParams.get(p);
      if (v) a[p] = v.slice(0, 120);
    }
    if (referrer) {
      const host = new URL(referrer).hostname;
      if (host && host !== url.hostname) a.referrer = host.slice(0, 120);
    }
    a.landing = url.pathname.slice(0, 200);
    a.firstSeen = new Date().toISOString().slice(0, 10);
    window.localStorage.setItem(KEY, JSON.stringify(a));
  } catch {
    // Storage blocked or bad URL: attribution is optional.
  }
}

export function getAttribution(): Attribution | undefined {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Attribution) : undefined;
  } catch {
    return undefined;
  }
}
