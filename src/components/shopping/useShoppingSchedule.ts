"use client";

import { useEffect, useState } from "react";
import { KEYS, useStored } from "@/lib/storage";
import { defaultSchedule, toDay, type ShoppingSchedule } from "@/lib/shopping-schedule";

/** Today's calendar day, refreshed when the tab regains focus (e.g. left open overnight). */
export function useToday(): string {
  const [today, setToday] = useState(() => toDay(new Date()));
  useEffect(() => {
    const refresh = () => setToday(toDay(new Date()));
    window.addEventListener("focus", refresh);
    const t = setInterval(refresh, 60_000);
    return () => {
      window.removeEventListener("focus", refresh);
      clearInterval(t);
    };
  }, []);
  return today;
}

export function useShoppingSchedule() {
  const today = useToday();
  const [stored, setStored, hydrated] = useStored<ShoppingSchedule | null>(KEYS.shoppingSchedule, null);
  const schedule = stored ?? defaultSchedule(today);
  return { schedule, setSchedule: setStored, hydrated, today, isSet: stored !== null };
}

export function formatDay(day: string, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }) {
  const [y, m, d] = day.split("-").map(Number);
  return new Intl.DateTimeFormat(undefined, { ...opts, timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, d)));
}
