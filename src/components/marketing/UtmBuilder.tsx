"use client";

import { useMemo, useState } from "react";
import { toast } from "../Toaster";

const PRESETS: { label: string; source: string; medium: string }[] = [
  { label: "Newsletter", source: "newsletter", medium: "email" },
  { label: "Instagram", source: "instagram", medium: "social" },
  { label: "Pinterest", source: "pinterest", medium: "social" },
  { label: "TikTok", source: "tiktok", medium: "social" },
  { label: "Facebook", source: "facebook", medium: "social" },
  { label: "Partner", source: "partner", medium: "referral" },
];

const slug = (v: string) =>
  v
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

/** Builds tagged campaign links. Visits through them are attributed on sign-ups and checkouts. */
export function UtmBuilder({ baseUrl }: { baseUrl: string }) {
  const [path, setPath] = useState("/free-meal-plan");
  const [source, setSource] = useState("instagram");
  const [medium, setMedium] = useState("social");
  const [campaign, setCampaign] = useState("launch");
  const [content, setContent] = useState("");

  const url = useMemo(() => {
    const u = new URL(path.startsWith("/") ? path : `/${path}`, baseUrl);
    if (source) u.searchParams.set("utm_source", slug(source));
    if (medium) u.searchParams.set("utm_medium", slug(medium));
    if (campaign) u.searchParams.set("utm_campaign", slug(campaign));
    if (content) u.searchParams.set("utm_content", slug(content));
    return u.toString();
  }, [baseUrl, path, source, medium, campaign, content]);

  return (
    <div className="card">
      <div className="chip-row" role="group" aria-label="Channel presets" style={{ marginBottom: 12 }}>
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            className="filter-chip"
            aria-pressed={source === p.source && medium === p.medium}
            onClick={() => {
              setSource(p.source);
              setMedium(p.medium);
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="grid grid-2" style={{ gap: 12 }}>
        <div className="field">
          <label htmlFor="utm-path">Page</label>
          <input id="utm-path" className="input" value={path} onChange={(e) => setPath(e.target.value)} list="utm-pages" />
          <datalist id="utm-pages">
            {["/", "/free-meal-plan", "/pricing", "/meal-planner", "/recipes", "/shopping-calendar", "/for-businesses", "/advertise"].map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </div>
        <div className="field">
          <label htmlFor="utm-campaign">Campaign</label>
          <input id="utm-campaign" className="input" value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="e.g. january-reset" />
        </div>
        <div className="field">
          <label htmlFor="utm-source">Source</label>
          <input id="utm-source" className="input" value={source} onChange={(e) => setSource(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="utm-medium">Medium</label>
          <input id="utm-medium" className="input" value={medium} onChange={(e) => setMedium(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="utm-content">Content (optional)</label>
          <input id="utm-content" className="input" value={content} onChange={(e) => setContent(e.target.value)} placeholder="e.g. reel-tikka-masala" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="utm-out">Campaign link</label>
        <input id="utm-out" className="input" readOnly value={url} onFocus={(e) => e.currentTarget.select()} />
      </div>
      <button
        type="button"
        className="btn btn-primary btn-sm"
        onClick={() =>
          navigator.clipboard
            ?.writeText(url)
            .then(() => toast("Link copied"))
            .catch(() => toast("Copy failed — select the link and copy it manually"))
        }
      >
        Copy link
      </button>
    </div>
  );
}
