"use client";

import Link from "next/link";
import { GOALS } from "@/content/goals";
import { deleteAllData, exportAllData, KEYS, useStored } from "@/lib/storage";
import { REGIONS, useUserPrefs } from "@/lib/user-prefs";
import { toast } from "./Toaster";
import { Icon } from "./Icon";

export function AccountSettings() {
  const { prefs, update, hydrated } = useUserPrefs();
  const [consent, setConsent] = useStored<string | null>(KEYS.consent, null);

  if (!hydrated) return <div className="card" aria-busy="true" style={{ minHeight: 300 }} />;

  const download = () => {
    const data = { exportedAt: new Date().toISOString(), source: "NourishWell (this device)", data: exportAllData() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nourishwell-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Your data has been downloaded");
  };

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section className="card" aria-labelledby="acct-h">
        <h2 id="acct-h" style={{ fontSize: "var(--fs-xl)" }}>
          Account
        </h2>
        <p>
          <strong>Online accounts are coming soon.</strong> Until they launch, you don&apos;t need to sign up: saved recipes, meal plans, shopping lists and preferences are kept privately in this
          browser.
        </p>
        <p className="small muted" style={{ marginBottom: 0 }}>
          When accounts arrive you&apos;ll be able to sign in, sync across devices and recover your password, and import the data on this device into your account.
        </p>
      </section>

      <section className="card" aria-labelledby="billing-h">
        <div className="spread">
          <h2 id="billing-h" style={{ fontSize: "var(--fs-xl)", margin: 0 }}>
            Plan &amp; billing
          </h2>
          <Link href="/account/billing" className="link-arrow small">
            Open
          </Link>
        </div>
        <p className="small muted" style={{ margin: "8px 0 0" }}>
          See your plan, manage or cancel Premium, and download receipts.
        </p>
      </section>

      <section className="card" aria-labelledby="prefs-h">
        <h2 id="prefs-h" style={{ fontSize: "var(--fs-xl)" }}>
          Preferences
        </h2>
        <div className="grid grid-2" style={{ gap: "0 24px" }}>
          <div className="field">
            <label htmlFor="pref-region">Country or region</label>
            <select
              id="pref-region"
              className="select"
              value={prefs.region}
              onChange={(e) => {
                const r = REGIONS.find((x) => x.code === e.target.value)!;
                update({ region: r.code, currency: r.currency, units: r.units });
              }}
            >
              {REGIONS.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.name}
                </option>
              ))}
            </select>
            <span className="hint">Sets your default currency and units. Region-specific content and directories will follow as they are reviewed.</span>
          </div>
          <div className="field">
            <label htmlFor="pref-currency">Currency for your price estimates</label>
            <select id="pref-currency" className="select" value={prefs.currency} onChange={(e) => update({ currency: e.target.value })}>
              {Array.from(new Set(REGIONS.map((r) => r.currency).concat(["SOS"]))).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <fieldset>
            <legend className="small">Measurements</legend>
            <div className="seg" role="group">
              <button type="button" aria-pressed={prefs.units === "metric"} onClick={() => update({ units: "metric" })}>
                Metric (g, ml)
              </button>
              <button type="button" aria-pressed={prefs.units === "us"} onClick={() => update({ units: "us" })}>
                US (oz, cups)
              </button>
            </div>
          </fieldset>
          <div className="field">
            <label htmlFor="pref-lang">Language</label>
            <select id="pref-lang" className="select" value="en" disabled aria-describedby="lang-hint">
              <option value="en">English</option>
            </select>
            <span className="hint" id="lang-hint">
              English is the only language available today. Other languages will be added once translations are complete and reviewed.
            </span>
          </div>
        </div>
        <fieldset>
          <legend className="small">Wellness goals (optional)</legend>
          <p className="hint">Used only on this device to suggest recipes. Never used for advertising.</p>
          <div className="chip-row">
            {GOALS.map((g) => (
              <button
                key={g.id}
                type="button"
                className="filter-chip"
                aria-pressed={prefs.goals.includes(g.id)}
                onClick={() => update({ goals: prefs.goals.includes(g.id) ? prefs.goals.filter((x) => x !== g.id) : [...prefs.goals, g.id] })}
              >
                {g.title}
              </button>
            ))}
          </div>
        </fieldset>
        <p className="xs muted">
          Planner settings (household, allergies, budget) are managed in the <Link href="/meal-planner">meal planner</Link>.
        </p>
      </section>

      <section className="card" aria-labelledby="notif-h">
        <h2 id="notif-h" style={{ fontSize: "var(--fs-xl)" }}>
          Notifications &amp; privacy
        </h2>
        <label className="checkbox">
          <input type="checkbox" checked={prefs.notifications.planReminders} onChange={(e) => update({ notifications: { ...prefs.notifications, planReminders: e.target.checked } })} />
          <span>
            Weekly meal-plan reminders <span className="xs muted">(saved for when reminders launch; nothing is sent yet)</span>
          </span>
        </label>
        <label className="checkbox" style={{ marginTop: 12 }}>
          <input type="checkbox" checked={consent === "granted"} onChange={(e) => setConsent(e.target.checked ? "granted" : "denied")} />
          <span>
            Allow anonymous usage analytics <span className="xs muted">(never includes health topics; <Link href="/privacy#analytics">details</Link>)</span>
          </span>
        </label>
        <p className="small" style={{ marginTop: 16, marginBottom: 0 }}>
          Newsletter: subscribe or unsubscribe using the form in the footer or the link in any email.
        </p>
      </section>

      <section className="card" aria-labelledby="data-h">
        <h2 id="data-h" style={{ fontSize: "var(--fs-xl)" }}>
          Your data
        </h2>
        <p className="small">Download everything NourishWell has stored on this device, or delete it permanently.</p>
        <div className="row">
          <button type="button" className="btn btn-secondary btn-sm" onClick={download}>
            <Icon name="download" size={16} /> Export my data (JSON)
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ color: "var(--danger)", borderColor: "var(--danger)" }}
            onClick={() => {
              if (window.confirm("Delete all saved recipes, plans, shopping lists and preferences from this device? This can't be undone.")) {
                deleteAllData();
                toast("All NourishWell data on this device has been deleted");
              }
            }}
          >
            <Icon name="trash" size={16} /> Delete all my data
          </button>
        </div>
      </section>
    </div>
  );
}
