"use client";

import Link from "next/link";
import { useState } from "react";
import { track } from "@/lib/analytics";
import { Icon } from "../Icon";
import { toast } from "../Toaster";
import { usePlan } from "./usePlan";
import { useEffect } from "react";
import { useVariant } from "../marketing/useExperiment";

/** A contextual Premium prompt. It names the feature and links to honest pricing. */
export function UpgradePrompt({ feature, onClose }: { feature: string; onClose?: () => void }) {
  const { info } = usePlan();
  const copy = useVariant("upgrade-prompt-copy");
  useEffect(() => {
    if (copy) track("upgrade_prompt_view", { feature, variant: copy });
  }, [copy, feature]);
  const label = !info.sellable ? "Join the waitlist" : copy === "name-the-benefit" ? "Unlock exports and 50 saved plans" : "See Premium";
  return (
    <div className="upsell" role="status">
      <Icon name="leaf" size={20} />
      <div style={{ flex: 1 }}>
        <p className="small">
          <strong>{feature} is part of Premium.</strong>{" "}
          {info.sellable ? "Premium also keeps up to 50 saved weekly plans." : "Premium isn't open yet — join the waitlist to hear when it launches."}
        </p>
        <div className="row" style={{ marginTop: 8 }}>
          <Link href="/pricing" className="btn btn-primary btn-sm" onClick={() => track("upgrade_prompt_click", { feature, variant: copy ?? "see-premium" })}>
            {label}
          </Link>
          {onClose && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
              Not now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Calls the server-enforced Premium export and downloads the file. */
export function useExport() {
  const [blocked, setBlocked] = useState<string | null>(null);
  const run = async (label: string, body: Record<string, unknown>, filename: string) => {
    try {
      const res = await fetch("/api/premium/export", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      if (res.status === 402) {
        setBlocked(label);
        return;
      }
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        toast(json.message ?? "Export failed. Please try again.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      track("premium_export", { kind: String(body.kind) });
      toast("Downloaded");
    } catch {
      toast("We couldn't reach the server. Check your connection and try again.");
    }
  };
  return { run, blocked, clear: () => setBlocked(null) };
}

/** The Monday of next week (or today, if today is Monday), as YYYY-MM-DD in local time. */
export function upcomingMonday(now = new Date()) {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  d.setDate(d.getDate() + ((8 - d.getDay()) % 7));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
