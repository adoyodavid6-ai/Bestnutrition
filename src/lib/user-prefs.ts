"use client";

import { KEYS, useStored } from "./storage";
import type { UnitSystem } from "./units";

export interface UserPrefs {
  units: UnitSystem;
  region: string; // ISO country code or "GLOBAL"
  currency: string; // ISO 4217
  locale: string; // BCP 47, English only at launch
  notifications: { newsletter: boolean; planReminders: boolean };
  goals: string[];
}

export const DEFAULT_USER_PREFS: UserPrefs = {
  units: "metric",
  region: "GLOBAL",
  currency: "USD",
  locale: "en",
  notifications: { newsletter: false, planReminders: false },
  goals: [],
};

export const REGIONS: { code: string; name: string; currency: string; units: UnitSystem }[] = [
  { code: "GLOBAL", name: "Global / not set", currency: "USD", units: "metric" },
  { code: "US", name: "United States", currency: "USD", units: "us" },
  { code: "GB", name: "United Kingdom", currency: "GBP", units: "metric" },
  { code: "JP", name: "Japan", currency: "JPY", units: "metric" },
  { code: "KR", name: "South Korea", currency: "KRW", units: "metric" },
  { code: "CN", name: "China", currency: "CNY", units: "metric" },
  { code: "SG", name: "Singapore", currency: "SGD", units: "metric" },
  { code: "MY", name: "Malaysia", currency: "MYR", units: "metric" },
  { code: "TH", name: "Thailand", currency: "THB", units: "metric" },
  { code: "VN", name: "Vietnam", currency: "VND", units: "metric" },
  { code: "PH", name: "Philippines", currency: "PHP", units: "metric" },
  { code: "HK", name: "Hong Kong", currency: "HKD", units: "metric" },
  { code: "KE", name: "Kenya", currency: "KES", units: "metric" },
  { code: "SO", name: "Somalia", currency: "USD", units: "metric" },
  { code: "TZ", name: "Tanzania", currency: "TZS", units: "metric" },
  { code: "UG", name: "Uganda", currency: "UGX", units: "metric" },
  { code: "ET", name: "Ethiopia", currency: "ETB", units: "metric" },
  { code: "NG", name: "Nigeria", currency: "NGN", units: "metric" },
  { code: "ZA", name: "South Africa", currency: "ZAR", units: "metric" },
  { code: "AE", name: "United Arab Emirates", currency: "AED", units: "metric" },
  { code: "IN", name: "India", currency: "INR", units: "metric" },
  { code: "DE", name: "Germany", currency: "EUR", units: "metric" },
  { code: "CA", name: "Canada", currency: "CAD", units: "metric" },
  { code: "AU", name: "Australia", currency: "AUD", units: "metric" },
  { code: "BR", name: "Brazil", currency: "BRL", units: "metric" },
  { code: "MX", name: "Mexico", currency: "MXN", units: "metric" },
];

export function useUserPrefs() {
  const [prefs, setPrefs, hydrated] = useStored<UserPrefs>(KEYS.prefs, DEFAULT_USER_PREFS);
  const merged = { ...DEFAULT_USER_PREFS, ...prefs, notifications: { ...DEFAULT_USER_PREFS.notifications, ...prefs.notifications } };
  const update = (patch: Partial<UserPrefs>) => setPrefs((p) => ({ ...DEFAULT_USER_PREFS, ...p, ...patch }));
  return { prefs: merged, update, hydrated };
}

export function formatMoney(value: number, currency: string, locale = "en") {
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 2 }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}
