"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Device-local persistence for the consumer experience.
 *
 * All personal data (saved items, meal plans, shopping lists, preferences) is stored only in
 * this browser until accounts are connected. The API is deliberately small so it can be
 * replaced by a server-backed repository (see docs/ARCHITECTURE.md) without touching pages.
 */

const PREFIX = "nw:";
const EVENT = "nw-storage";

export const KEYS = {
  savedRecipes: "saved-recipes",
  savedArticles: "saved-articles",
  plans: "plans",
  currentPlan: "current-plan",
  shopping: "shopping",
  prefs: "prefs",
  plannerPrefs: "planner-prefs",
  recent: "recent",
  consent: "consent",
  shoppingSchedule: "shopping-schedule",
} as const;

const cache = new Map<string, unknown>();

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  if (cache.has(key)) return cache.get(key) as T;
  let value: T = fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw !== null) value = JSON.parse(raw) as T;
  } catch {
    value = fallback;
  }
  cache.set(key, value);
  return value;
}

export function writeStored<T>(key: string, value: T) {
  cache.set(key, value);
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage may be full or blocked (private mode). Keep the in-memory value for this session.
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: key }));
}

export function readStored<T>(key: string, fallback: T): T {
  return read(key, fallback);
}

function subscribe(callback: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key?.startsWith(PREFIX)) cache.delete(e.key.slice(PREFIX.length));
    callback();
  };
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", onStorage);
  };
}

/** React hook: a value persisted on this device, shared across components and tabs. */
export function useStored<T>(key: string, fallback: T): [T, (next: T | ((prev: T) => T)) => void, boolean] {
  const value = useSyncExternalStore(
    subscribe,
    () => read(key, fallback),
    () => fallback,
  );
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = read(key, fallback);
      const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      writeStored(key, resolved);
    },
    // fallback is intentionally excluded: callers pass literals
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );
  return [value, set, hydrated];
}

/** Export every NourishWell key as a JSON object (for the account data-export control). */
export function exportAllData(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (!k || !k.startsWith(PREFIX)) continue;
    try {
      out[k.slice(PREFIX.length)] = JSON.parse(window.localStorage.getItem(k) ?? "null");
    } catch {
      out[k.slice(PREFIX.length)] = null;
    }
  }
  return out;
}

/** Delete every NourishWell key from this device. */
export function deleteAllData() {
  const keys: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (k?.startsWith(PREFIX)) keys.push(k);
  }
  keys.forEach((k) => window.localStorage.removeItem(k));
  cache.clear();
  window.dispatchEvent(new CustomEvent(EVENT, { detail: "*" }));
}
